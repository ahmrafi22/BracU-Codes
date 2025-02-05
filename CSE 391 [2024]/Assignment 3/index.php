<?php
session_start();
require_once 'dbconnection.php';

// Check if the user is logged in
$is_logged_in = isset($_SESSION['client_id']);
$client_id = $is_logged_in ? $_SESSION['client_id'] : null;

// Fetch user's appointment if logged in
if ($is_logged_in) {
        $appointments_query = "SELECT a.*, 
                                      m.name AS mechanic_name, 
                                      m.image_path AS mechanic_image_path 
                               FROM appointments a
                               LEFT JOIN mechanics m ON a.mechanic_id = m.mechanic_id 
                               WHERE a.client_id = ? AND a.appointment_status != 'completed'
                               ORDER BY a.appointment_date DESC";

    $appointments_stmt = $conn->prepare($appointments_query);
    $appointments_stmt->bind_param("i", $client_id);
    $appointments_stmt->execute();
    $appointments_result = $appointments_stmt->get_result();
    
    // Fetch cars for the logged-in client
    $cars_query = "SELECT * FROM cars WHERE client_id = ?";
    $cars_stmt = $conn->prepare($cars_query);
    $cars_stmt->bind_param("i", $client_id);
    $cars_stmt->execute();
    $cars_result = $cars_stmt->get_result();

    // Fetch mechanics
    $mechanics_query = "SELECT * FROM mechanics";
    $mechanics_result = $conn->query($mechanics_query);

    // Process form submission
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $selected_date = $_POST['appointment_date'];
        $selected_car = $_POST['car_id'];
        $selected_mechanic = $_POST['mechanic_id'];
        $selected_time = $_POST['time_slot'];
        $appointment_reason = $_POST['appointment_reason'];

        // Check if client already has an appointment on selected date
        $check_client_query = "SELECT * FROM appointments WHERE client_id = ? AND appointment_date = ? AND appointment_status != 'completed'";
        $check_client_stmt = $conn->prepare($check_client_query);
        $check_client_stmt->bind_param("is", $client_id, $selected_date);
        $check_client_stmt->execute();
        $existing_client_appointment = $check_client_stmt->get_result()->num_rows > 0;

        // Check if mechanic has appointment at selected time
        $check_mechanic_query = "SELECT * FROM appointments WHERE mechanic_id = ? AND appointment_date = ? AND time_slot = ?";
        $check_mechanic_stmt = $conn->prepare($check_mechanic_query);
        $check_mechanic_stmt->bind_param("iss", $selected_mechanic, $selected_date, $selected_time);
        $check_mechanic_stmt->execute();
        $existing_mechanic_appointment = $check_mechanic_stmt->get_result()->num_rows > 0;

        // Count mechanic's appointments for the day
        $count_query = "SELECT COUNT(*) as appointment_count FROM appointments WHERE mechanic_id = ? AND appointment_date = ?";
        $count_stmt = $conn->prepare($count_query);
        $count_stmt->bind_param("is", $selected_mechanic, $selected_date);
        $count_stmt->execute();
        $count_result = $count_stmt->get_result()->fetch_assoc();
        $appointment_count = $count_result['appointment_count'];

        if (!$existing_client_appointment && !$existing_mechanic_appointment && $appointment_count < 4) {
            $insert_query = "INSERT INTO appointments (client_id, car_id, mechanic_id, appointment_date, time_slot, appointment_reason) 
                            VALUES (?, ?, ?, ?, ?, ?)";
            $insert_stmt = $conn->prepare($insert_query);
            $insert_stmt->bind_param("iiisss", $client_id, $selected_car, $selected_mechanic, $selected_date, $selected_time, $appointment_reason);
            
            if ($insert_stmt->execute()) {
                echo "<script>alert('Appointment booked successfully!'); window.location.reload();</script>";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/indstyle.css">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet" />
    <title>Home</title>
</head>
<body>
    <div class="navbar">
        <h1> <i class="ri-roadster-fill"></i> CarZone</h1>
        <div class="nav-content">
            <h2><a class="userp" href="index.php">Home</a></h2>
            <h2><a class="userp" href="userprofile.php">Profile</a></h2>
            <?php if ($is_logged_in): ?>
                <a href="logout.php" class="login-btn logout-btn">Logout</a>
            <?php else: ?>
                <a href="login.php" class="login-btn">Login</a>
            <?php endif; ?>
        </div>
    </div>

    <div class="contnetwrapper">
        <div class="app_container">
            <!-- Booking Form -->
            <div class="booking-form">
                <?php if ($is_logged_in): ?>
                    <h2> <i class="ri-calendar-schedule-fill"></i> Book an Appointment</h2>
                    <form method="POST" id="appointmentForm">
                        <!-- Date Selection -->
                        <div class="form-group">
                            <label for="appointment_date"><i class="ri-calendar-2-line"></i> Select Date:</label>
                            <input type="date" id="appointment_date" name="appointment_date" 
                                   min="<?php echo date('Y-m-d'); ?>" required
                                   onchange="checkClientAppointment(this.value, <?php echo $client_id; ?>)">
                            <span id="date-error" class="error-message"></span>
                        </div>
    
                        <!-- Car Selection -->
                        <div class="form-group">
                            <label for="car_id"> <i class="ri-roadster-fill"></i> Select Car:</label>
                            <?php if ($cars_result->num_rows > 0): ?>
                                <select name="car_id" id="car_id" required>
                                    <option value="">Choose your car</option>
                                    <?php while ($car = $cars_result->fetch_assoc()): ?>
                                        <option value="<?php echo $car['car_id']; ?>">
                                            <?php echo htmlspecialchars($car['car_name'] . ' - ' . $car['license_number']); ?>
                                        </option>
                                    <?php endwhile; ?>
                                </select>
                            <?php else: ?>
                                <p class="error-message">Please add a car to continue</p>
                            <?php endif; ?>
                        </div>
    
                        <!-- Mechanic Selection -->
                        <div class="form-group">
                            <label for="mechanic_id"> <i class="ri-user-settings-fill"></i> Select Mechanic:</label>
                            <select name="mechanic_id" id="mechanic_id" required onchange="updateTimeSlots()">
                                <option value="">Choose a mechanic</option>
                                <?php while ($mechanic = $mechanics_result->fetch_assoc()): ?>
                                    <option value="<?php echo $mechanic['mechanic_id']; ?>" 
                                            data-image="<?php echo $mechanic['image_path']; ?>">
                                        <?php echo htmlspecialchars($mechanic['name']); ?>
                                    </option>
                                <?php endwhile; ?>
                            </select>
                            <div id="mechanic-info"></div>
                        </div>
    
                        <!-- Time Slot Selection -->
                        <div class="form-group">
                            <label for="time_slot"> <i class="ri-time-fill"></i> Select Time:</label>
                            <select name="time_slot" id="time_slot" required>
                                <option value="">Select time slot</option>
                                <option value="10:00:00">10:00 AM</option>
                                <option value="12:00:00">12:00 PM</option>
                                <option value="14:00:00">2:00 PM</option>
                                <option value="16:00:00">4:00 PM</option>
                            </select>
                            <span id="time-error" class="error-message"></span>
                        </div>
    
                        <!-- Appointment Reason -->
                        <div class="form-group">
                            <label for="appointment_reason"> <i class="ri-archive-2-fill"></i> Reason for Appointment:</label>
                            <textarea name="appointment_reason" id="appointment_reason" required></textarea>
                        </div>
    
                        <button type="submit" id="submit-btn">Book Appointment</button>
                    </form>
                <?php else: ?>
                    <p style="text-align: center; color: white;">Please <a href="login.php">login</a> to book an appointment.</p>
                <?php endif; ?>
            </div>
        </div>

        <div class="app2_container">
            <?php if ($is_logged_in): ?>
                <?php 

                $appointments_result->data_seek(0);
                
                if ($appointments_result->num_rows > 0): ?>
                    <div>
                        <h2><i class="ri-calendar-schedule-fill"></i> Your Current Appointment</h2>
                        <br>
                        <?php while ($appointment = $appointments_result->fetch_assoc()): ?>
                           <img src="<?php echo htmlspecialchars($appointment['mechanic_image_path']); ?>" alt="Mechanic Profile" class="mechanic-profile-image">
                           <p><strong> <i class="ri-calendar-2-line"></i> Date: </strong> <?php echo htmlspecialchars($appointment['appointment_date']); ?></p>
                           <p><strong> <i class="ri-time-fill"></i> Time: </strong> <?php echo date('h:i A', strtotime($appointment['time_slot'])); ?></p>
                           <p><strong> <i class="ri-user-settings-fill"></i> Mechanic: </strong> <?php echo htmlspecialchars($appointment['mechanic_name']); ?></p>
                           <p><strong> <i class="ri-file-text-fill"></i> Reason: </strong> <?php echo htmlspecialchars($appointment['appointment_reason']); ?></p>
                           <p><strong> <i class="ri-archive-2-fill"></i> Status:</strong> <strong><?php echo htmlspecialchars($appointment['appointment_status']); ?></p></strong>
                           <br>
                        <?php endwhile; ?>
                    </div>
                <?php else: ?>
                    <p>Your appointment is either completed or not scheduled yet.</p>
                <?php endif; ?>
            <?php else: ?>
                <p>Please <a href="login.php">login</a> to view your appointments.</p>
            <?php endif; ?>
        </div>
    </div>
    <div class="admin">

    <a href="admin_dashboard.php" target="_blank"> Admin login </a>

    </div>
    <script>
        async function checkClientAppointment(date, clientId) {
            const response = await fetch(`check_appointment.php?date=${date}&client_id=${clientId}`);
            const data = await response.json();
            const errorSpan = document.getElementById('date-error');
            const submitBtn = document.getElementById('submit-btn');
            
            if (data.hasAppointment) {
                errorSpan.textContent = 'You already have an appointment on this day';
                errorSpan.style.color = 'red';
                submitBtn.disabled = true;
            } else {
                errorSpan.textContent = '';
                submitBtn.disabled = false;
            }
            updateTimeSlots();
        }

        async function updateTimeSlots() {
            const date = document.getElementById('appointment_date').value;
            const mechanicId = document.getElementById('mechanic_id').value;
            if (!date || !mechanicId) return;
    
            const response = await fetch(`get_available_slots.php?date=${date}&mechanic_id=${mechanicId}`);
            const data = await response.json();
            
            const timeSlotSelect = document.getElementById('time_slot');
            const mechanicInfo = document.getElementById('mechanic-info');
            const submitBtn = document.getElementById('submit-btn');
    
            // Update mechanic info
            const remainingSlots = 4 - data.bookedSlots;
            mechanicInfo.innerHTML = `Available slots: ${remainingSlots}`;
            
            if (remainingSlots === 0) {
                mechanicInfo.innerHTML += '<br><span class="error-message">No available slots. Please select another mechanic.</span>';
                submitBtn.disabled = true;
                return;
        }

        // Update time slots
        const timeSlots = timeSlotSelect.options;
            for (let i = 1; i < timeSlots.length; i++) {
                const time = timeSlots[i].value;
                const isBooked = data.bookedTimes.includes(time);
                timeSlots[i].disabled = isBooked;

                if (isBooked) {
                    const notAvailableText = ' (Not Available)';

                    if (!timeSlots[i].text.includes(notAvailableText)) {
                        timeSlots[i].text += notAvailableText;
                    }
                } else {
                    const notAvailableText = ' (Not Available)';
                    timeSlots[i].text = timeSlots[i].text.replace(notAvailableText, '').trim();
                }
            }
        }
    </script>
</body>
</html>