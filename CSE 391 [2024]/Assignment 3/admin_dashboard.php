<?php
// Start session
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Redirect to login page if not logged in
    header("Location: admin_login.php");
    exit();
}

// Include database connection
require_once 'dbconnection.php';

// Function to get total counts
function getTotalCounts($conn) {
    $counts = [];
    $result = $conn->query("SELECT COUNT(*) as total_clients FROM clients");
    $counts['total_clients'] = $result->fetch_assoc()['total_clients'];
    $result = $conn->query("SELECT COUNT(*) as total_appointments FROM appointments");
    $counts['total_appointments'] = $result->fetch_assoc()['total_appointments'];
    $result = $conn->query("SELECT COUNT(*) as total_vehicles FROM cars");
    $counts['total_vehicles'] = $result->fetch_assoc()['total_vehicles'];
    return $counts;
}

// Function to get all mechanics
function getAllMechanics($conn) {
    $result = $conn->query("SELECT * FROM mechanics ORDER BY name");
    return $result->fetch_all(MYSQLI_ASSOC);
}

// Function to get mechanic details
function getMechanicDetails($conn, $mechanic_id) {
    $stmt = $conn->prepare("SELECT * FROM mechanics WHERE mechanic_id = ?");
    $stmt->bind_param("i", $mechanic_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

// Function to get appointments for a mechanic
function getMechanicAppointments($conn, $mechanic_id) {
    $stmt = $conn->prepare("
        SELECT a.*, c.name AS client_name, car.car_name, car.license_number 
        FROM appointments a
        JOIN clients c ON a.client_id = c.client_id
        JOIN cars car ON a.car_id = car.car_id
        WHERE a.mechanic_id = ?
        ORDER BY a.appointment_date DESC
    ");
    $stmt->bind_param("i", $mechanic_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getAvailableMechanics($conn, $appointment_date) {
    $stmt = $conn->prepare("
        SELECT m.* FROM mechanics m
        WHERE m.mechanic_id NOT IN (
            SELECT DISTINCT mechanic_id FROM appointments 
            WHERE appointment_date = ? AND appointment_status != 'completed'
            GROUP BY mechanic_id
            HAVING COUNT(*) >= m.max_daily_appointments
        )
    ");
    $stmt->bind_param("s", $appointment_date);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getAppointmentsByDate($conn, $date) {
    $stmt = $conn->prepare("
        SELECT a.*, c.name AS client_name, car.car_name, car.license_number, m.name AS mechanic_name
        FROM appointments a
        JOIN clients c ON a.client_id = c.client_id
        JOIN cars car ON a.car_id = car.car_id
        JOIN mechanics m ON a.mechanic_id = m.mechanic_id
        WHERE a.appointment_date = ?
        ORDER BY a.time_slot
    ");
    $stmt->bind_param("s", $date);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getBookedTimeslotsByMechanic($conn, $mechanic_id, $date) {
    $stmt = $conn->prepare("
        SELECT time_slot FROM appointments 
        WHERE mechanic_id = ? AND appointment_date = ? 
        AND appointment_status != 'completed'
    ");
    $stmt->bind_param("is", $mechanic_id, $date);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $booked_times = [];
    while ($row = $result->fetch_assoc()) {
        $booked_times[] = $row['time_slot'];
    }
    return $booked_times;
}

// Handle status update if POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $appointment_id = $_POST['appointment_id'];
    $new_status = $_POST['appointment_status'];
    $mechanic_id = $_POST['mechanic_id'];
    
    $stmt = $conn->prepare("UPDATE appointments SET appointment_status = ? WHERE appointment_id = ?");
    $stmt->bind_param("si", $new_status, $appointment_id);
    $stmt->execute();
    
    header("Location: ".$_SERVER['PHP_SELF']."?mechanic_id=".($mechanic_id ?? ''));
    exit();
}

// Get dashboard counts
$dashboardCounts = getTotalCounts($conn);

// Get all mechanics
$mechanics = getAllMechanics($conn);

// Get selected mechanic details if a mechanic is selected
$selectedMechanicDetails = null;
$selectedMechanicAppointments = [];
if (isset($_GET['mechanic_id'])) {
    $selectedMechanicDetails = getMechanicDetails($conn, $_GET['mechanic_id']);
    $selectedMechanicAppointments = getMechanicAppointments($conn, $_GET['mechanic_id']);
}

// Handle appointment update
if (isset($_POST['update_appointment'])) {
    $appointment_id = $_POST['appointment_id'];
    $new_date = $_POST['new_date'];
    $new_time = $_POST['new_time'];
    $new_mechanic = $_POST['new_mechanic'];
    
    $booked_slots = getBookedTimeslotsByMechanic($conn, $new_mechanic, $new_date);
    $is_slot_available = !in_array($new_time, $booked_slots);
    
    if ($is_slot_available) {
        $update_query = "UPDATE appointments 
                       SET mechanic_id = ?, appointment_date = ?, time_slot = ? 
                       WHERE appointment_id = ?";
        $stmt = $conn->prepare($update_query);
        $stmt->bind_param("issi", $new_mechanic, $new_date, $new_time, $appointment_id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            $success_message = "Appointment updated successfully!";
        } else {
            $error_message = "Failed to update appointment.";
        }
    } else {
        $error_message = "Selected time slot is not available for this mechanic.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/admin_dcss.css">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet"/>
    <title>Admin Dashboard</title>
</head>
<body>
    <div class="navbar">
        <h1><i class="ri-roadster-fill"></i>CarZone</h1>
        <div class="nav-content">
            <a href="admin_login.php" class="login-btn">Logout</a>
        </div>
    </div>

    <div class="app_container">
        <h1>Admin Dashboard</h1>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <i class="ri-user-line" style="font-size: 2em; color: #007bff;"></i>
                <h3>Total Clients</h3>
                <div class="count"><?php echo $dashboardCounts['total_clients']; ?></div>
            </div>
            <div class="dashboard-card">
                <i class="ri-calendar-check-line" style="font-size: 2em; color: #28a745;"></i>
                <h3>Total Appointments</h3>
                <div class="count"><?php echo $dashboardCounts['total_appointments']; ?></div>
            </div>
            <div class="dashboard-card">
                <i class="ri-car-line" style="font-size: 2em; color: #dc3545;"></i>
                <h3>Total Vehicles</h3>
                <div class="count"><?php echo $dashboardCounts['total_vehicles']; ?></div>
            </div>
        </div>

        <h1 style="color:white">Mechanics</h1>

        <div class="mechanics-section">
            
            <form method="get">
                <select name="mechanic_id" class="mechanics-dropdown" onchange="this.form.submit()">
                    <option value="">Select a Mechanic</option>
                    <?php foreach($mechanics as $mechanic): ?>
                        <option value="<?php echo $mechanic['mechanic_id']; ?>" 
                            <?php echo (isset($_GET['mechanic_id']) && $_GET['mechanic_id'] == $mechanic['mechanic_id']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($mechanic['name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <input type="hidden" name="date" value="<?php echo isset($_GET['date']) ? $_GET['date'] : ''; ?>">
            </form>

            <?php if ($selectedMechanicDetails): ?>
                <div class="mechanic-details">
                    <img src="<?php echo htmlspecialchars($selectedMechanicDetails['image_path']); ?>" 
                         alt="<?php echo htmlspecialchars($selectedMechanicDetails['name']); ?>">
                    <div>
                        <h3><?php echo htmlspecialchars($selectedMechanicDetails['name']); ?></h3>
                        <p>Max Daily Appointments: <?php echo $selectedMechanicDetails['max_daily_appointments']; ?></p>
                    </div>
                </div>

                <h2>Appointments</h2>
                <br>
                <table class="appointments-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Client</th>
                            <th>Car</th>
                            <th>License</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach($selectedMechanicAppointments as $appointment): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($appointment['appointment_date']); ?></td>
                            <td><?php echo date('h:i A', strtotime($appointment['time_slot'])); ?></td>
                            <td><?php echo htmlspecialchars($appointment['client_name']); ?></td>
                            <td><?php echo htmlspecialchars($appointment['car_name']); ?></td>
                            <td><?php echo htmlspecialchars($appointment['license_number']); ?></td>
                            <td class="status-<?php echo htmlspecialchars($appointment['appointment_status']); ?>">
                                <?php echo htmlspecialchars(ucfirst(str_replace('_', ' ', $appointment['appointment_status']))); ?>
                            </td>
                            <td>
                                <form method="post">
                                    <input type="hidden" name="update_status" value="1">
                                    <input type="hidden" name="appointment_id" value="<?php echo $appointment['appointment_id']; ?>">
                                    <input type="hidden" name="mechanic_id" value="<?php echo $_GET['mechanic_id']; ?>">
                                    <select name="appointment_status" class="status-dropdown" onchange="this.form.submit()">
                                        <option value="pending" <?php echo $appointment['appointment_status'] == 'pending' ? 'selected' : ''; ?>>Pending</option>
                                        <option value="scheduled" <?php echo $appointment['appointment_status'] == 'scheduled' ? 'selected' : ''; ?>>Scheduled</option>
                                        <option value="in_progress" <?php echo $appointment['appointment_status'] == 'in_progress' ? 'selected' : ''; ?>>In Progress</option>
                                        <option value="completed" <?php echo $appointment['appointment_status'] == 'completed' ? 'selected' : ''; ?>>Completed</option>
                                    </select>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>

    <div class="app2_container">
        <h1 style="color:white;">Appointment Management</h1>
        <div class="appointment-section">
            
            
            <form class="date-selector">
                <label>Select Date:</label>
                <input type="date" name="date" 
                       value="<?php echo isset($_GET['date']) ? $_GET['date'] : '';  ?>" 
                       onchange="this.form.submit()">
                
            <input type="hidden" name="mechanic_id" value="<?php echo isset($_GET['mechanic_id']) ? $_GET['mechanic_id'] : ''; ?>">
            </form>
            

            <?php if (isset($success_message)): ?>
                <div class="success-message"><?php echo $success_message; ?></div>
            <?php endif; ?>

            <?php if (isset($error_message)): ?>
                <div class="error-message"><?php echo $error_message; ?></div>
            <?php endif; ?>

            <div class="appointments-container">
                <table class="daily-appointments-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Car</th>
                            <th>Mechanic</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $selected_date = isset($_GET['date']) ? $_GET['date'] : "";
                        $daily_appointments = getAppointmentsByDate($conn, $selected_date);
                        foreach($daily_appointments as $appointment): 
                        ?>
                        <tr>
                            <td><?php echo htmlspecialchars($appointment['client_name']); ?></td>
                            <td>
                                <?php echo htmlspecialchars($appointment['car_name']); ?> 
                                (<?php echo htmlspecialchars($appointment['license_number']); ?>)
                            </td>
                            <td><?php echo htmlspecialchars($appointment['mechanic_name']); ?></td>
                            <td><?php echo date('h:i A', strtotime($appointment['time_slot'])); ?></td>
                            <td class="status-<?php echo $appointment['appointment_status']; ?>">
                                <?php echo ucfirst($appointment['appointment_status']); ?>
                            </td>
                            <td>
                                <button class="edit-btn" 
                                        onclick="openEditModal(<?php echo htmlspecialchars(json_encode($appointment)); ?>)">
                                    Edit
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

           <!-- Edit Modal -->
           <div id="editModal" class="modal">
               <div class="modal-content">
                   <h3>Edit Appointment</h3>
                   <form method="POST" id="editForm">
                       <input type="hidden" name="appointment_id" id="edit_appointment_id">
                       <input type="hidden" name="update_appointment" value="1">
                       
                       <div class="form-group">
                           <label>Date:</label>
                           <input type="date" name="new_date" id="edit_date" required>
                       </div>
                       
                       <div class="form-group">
                           <label>Time:</label>
                           <select name="new_time" id="edit_time" required>
                               <option value="10:00:00">10:00 AM</option>
                               <option value="12:00:00">12:00 PM</option>
                               <option value="14:00:00">2:00 PM</option>
                               <option value="16:00:00">4:00 PM</option>
                           </select>
                       </div>
                       
                       <div class="form-group">
                           <label>Mechanic:</label>
                           <select name="new_mechanic" id="edit_mechanic" required>
                               <?php 
                               $available_mechanics = getAvailableMechanics($conn, $selected_date);
                               foreach ($available_mechanics as $mechanic): 
                               ?>
                                   <option value="<?php echo $mechanic['mechanic_id']; ?>">
                                       <?php echo htmlspecialchars($mechanic['name']); ?>
                                   </option>
                               <?php endforeach; ?>
                           </select>
                       </div>
                       
                       <div class="modal-buttons">
                           <button type="button" onclick="closeEditModal()" class="cancel-btn">Cancel</button>
                           <button type="submit" class="update-btn">Update</button>
                       </div>
                   </form>
               </div>
           </div>
           
           </div>
           </div>
           <script>
                function openEditModal(appointment) {
                    document.getElementById('edit_appointment_id').value = appointment.appointment_id;
                    document.getElementById('edit_date').value = appointment.appointment_date;
                    document.getElementById('edit_time').value = appointment.time_slot;
                    document.getElementById('edit_mechanic').value = appointment.mechanic_id;
                    document.getElementById('editModal').style.display = 'block';
                }
                
                function closeEditModal() {
                    document.getElementById('editModal').style.display = 'none';
                }
                
                // Close modal when clicking outside
                window.onclick = function(event) {
                    const modal = document.getElementById('editModal');
                    if (event.target === modal) {
                        closeEditModal();
                    }
                }
            </script>
</body>
</html>