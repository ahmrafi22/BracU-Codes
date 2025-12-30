<?php
require_once 'dbconnection.php';
session_start();

// Check if user is not logged in
if (!isset($_SESSION['client_id'])) {
    header("Location: login.php");
    exit();
}

// Handle car deletion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_car'])) {
    $car_id = $_POST['car_id'];
    $client_id = $_SESSION['client_id'];
    
    // Verify that the car belongs to the logged-in user and delete it
    $delete_query = "DELETE FROM cars WHERE car_id = ? AND client_id = ?";
    $stmt = $conn->prepare($delete_query);
    $stmt->bind_param("ii", $car_id, $client_id);
    $stmt->execute();
    
    // Redirect to refresh the page
    header("Location: userprofile.php");
    exit();
}

// Fetch user details
$client_id = $_SESSION['client_id'];
$user_query = "SELECT * FROM clients WHERE client_id = ?";
$stmt = $conn->prepare($user_query);
$stmt->bind_param("i", $client_id);
$stmt->execute();
$user_result = $stmt->get_result();
$user = $user_result->fetch_assoc();

// Fetch user's cars
$cars_query = "SELECT * FROM cars WHERE client_id = ?";
$stmt = $conn->prepare($cars_query);
$stmt->bind_param("i", $client_id);
$stmt->execute();
$cars_result = $stmt->get_result();

// Fetch mechanic's name and appointment
$appointments_query = "SELECT a.*, m.name as mechanic_name 
                      FROM appointments a 
                      LEFT JOIN mechanics m ON a.mechanic_id = m.mechanic_id 
                      WHERE a.client_id = ?";
$stmt = $conn->prepare($appointments_query);
$stmt->bind_param("i", $client_id);
$stmt->execute();
$appointments_result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/user.css">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet" />
    <title>User Profile</title>

</head>
<body>
    <div class="navbar">
        <h1><i class="ri-roadster-fill"></i>   CarZone</h1>
        <div class="nav-content">
            <h2><a class="userp" href="index.php">Home</a></h2>
            <h2><a class="userp" href="userprofile.php">Profile</a></h2>
            <a href="logout.php" class="logout-btn">Logout</a>
        </div>
    </div>

    <div class="app_container">
        <div class="profile-section">
            <h1><i class="ri-user-smile-fill"></i> User Profile</h1>
            <form id="profile-form" method="POST">
                <div class="form-group">
                    <label for="name">Name <i class="ri-user-fill"></i> </label>
                    <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($user['name']); ?>">
                </div>
                <div class="form-group">
                    <label for="phone">Phone <i class="ri-phone-fill"></i> </label>
                    <input type="text" id="phone" name="phone" value="<?php echo htmlspecialchars($user['phone']); ?>">
                </div>
                <div class="form-group">
                    <label for="email">Email <i class="ri-mail-fill"></i> </label>
                    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>">
                </div>
                <div class="form-group">
                    <label for="address">Address <i class="ri-home-5-fill"></i> </label>
                    <textarea id="address" name="address"><?php echo htmlspecialchars($user['address']); ?></textarea>
                </div>
                <button type="submit" class="update-btn">Update Profile</button>
            </form>
        </div>

        <div class="cars-section">
            <h1><i class="ri-car-fill"></i> My Cars</h1>
            <?php 
            // Check if the user has cars
            if ($cars_result->num_rows > 0):
                while($car = $cars_result->fetch_assoc()): 
            ?>
                    <div class="car-details">
                        <p><strong> <i class="ri-roadster-fill"></i> Car Name:</strong> <?php echo htmlspecialchars($car['car_name']); ?></p>
                        <p><strong> <i class="ri-id-card-fill"></i> License Number:</strong> <?php echo htmlspecialchars($car['license_number']); ?></p>
                        <p><strong> <i class="ri-scroll-to-bottom-fill"></i> Engine Number:</strong> <?php echo htmlspecialchars($car['engine_number']); ?></p>
                        <br>
                    </div>
                <?php endwhile; 
            else: ?>
                <p>You don't have any cars added.</p>
            <?php endif; ?>
            
            <button id="addCarBtn" class="add-car-btn">Add New Car</button>

            <!-- Delete Car Section -->
            <div class="delete-car-section">
                <form method="POST" class="delete-car-form" onsubmit="return confirm('Are you sure you want to delete this car?');">
                    <select name="car_id" required>
                        <option value="">Select a car to delete</option>
                        <?php 
                        // Reset result pointer for dropdown
                        if ($cars_result->num_rows > 0):
                            $cars_result->data_seek(0); // Reset pointer to the beginning
                            while($car = $cars_result->fetch_assoc()): 
                        ?>
                            <option value="<?php echo htmlspecialchars($car['car_id']); ?>">
                                <?php echo htmlspecialchars($car['car_name'] . ' - ' . $car['license_number']); ?>
                            </option>
                        <?php endwhile; endif; ?>
                    </select>
                    <button type="submit" name="delete_car" class="delete-btn">Delete Car</button>
                </form>
            </div>

            <!-- Add Car Modal -->
            <div id="addCarModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Add New Car</h2>
                    <form id="add-car-form">
                        <div class="form-group">
                            <label style="color:black;" for="car_name">Car Name <i class="ri-roadster-fill"></i> </label>
                            <input type="text" id="car_name" name="car_name" required>
                        </div>
                        <div class="form-group">
                            <label style="color:black; for="license_number">License Number <i class="ri-id-card-fill"></i> </label>
                            <input type="text" id="license_number" name="license_number" required>
                        </div>
                        <div class="form-group">
                            <label style="color:black; for="engine_number">Engine Number <i class="ri-scroll-to-bottom-fill"></i></label>
                            <input type="text" id="engine_number" name="engine_number" required>
                        </div>
                        <button type="submit" class="submit-btn">Add Car</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="app2_container">
        <h1>My Appointments</h1>
        <table class="appointments-table">
            <thead>
                <tr>
                    <th>Date <i class="ri-calendar-fill"></i> </th>
                    <th>Time <i class="ri-time-fill"></i> </th>
                    <th>Mechanic <i class="ri-user-settings-fill"></i></th>
                    <th>Status <i class="ri-file-text-fill"></i> </th>
                    <th>Reason <i class="ri-text-snippet"></i> </th>
                </tr>
            </thead>
            <tbody>
                <?php while($appointment = $appointments_result->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($appointment['appointment_date']); ?></td>
                        <td><?php echo date('h:i A', strtotime($appointment['time_slot'])); ?></td>
                        <td><?php echo htmlspecialchars($appointment['mechanic_name']); ?></td>
                        <td><?php echo htmlspecialchars($appointment['appointment_status']); ?></td>
                        <td><?php echo htmlspecialchars($appointment['appointment_reason']); ?></td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Profile update form handling
        const profileForm = document.getElementById('profile-form');
        
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(profileForm);
            
            fetch('update_profile.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(result => {
                if (result === 'success') {
                    alert('Profile updated successfully!');
                } else {
                    alert('An error occurred while updating the profile.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the profile.');
            });
        });

        // Add Car Modal handling
        const modal = document.getElementById('addCarModal');
        const btn = document.getElementById('addCarBtn');
        const span = document.getElementsByClassName('close')[0];
        const addCarForm = document.getElementById('add-car-form');

        btn.onclick = function() {
            modal.style.display = "block";
        }

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        addCarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(addCarForm);
            
            fetch('add_car.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(result => {
                if (result === 'success') {
                    alert('Car added successfully!');
                    location.reload();
                } else {
                    alert('An error occurred while adding the car.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while adding the car.');
            });
        });
    });
    </script>
</body>
</html>
