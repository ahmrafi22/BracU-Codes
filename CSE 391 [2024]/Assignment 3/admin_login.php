<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
include('dbconnection.php');

// Start session to manage the session after login
session_start();

// Initialize error message
$error_message = "";

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Validate inputs
    if (empty($username) || empty($password)) {
        $error_message = "Username and password are required.";
    } else {
        // Query to get admin details based on the username
        $sql = "SELECT * FROM admin WHERE username = ?";
        $stmt = $conn->prepare($sql);
        
        if ($stmt === false) {
            // Log or display preparation error
            $error_message = "Database preparation error: " . $conn->error;
        } else {
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                // Fetch the result as an associative array
                $admin = $result->fetch_assoc();

                // Verify the password using password_verify() with the stored hash
                if (password_verify($password, $admin['password_hash'])) {
                    // Set session variables for the logged-in admin
                    $_SESSION['admin_id'] = $admin['admin_id'];
                    $_SESSION['username'] = $admin['username'];
                    $_SESSION['admin_logged_in'] = true;  // Add this line for explicit admin login check

                    // Redirect to admin dashboard
                    // Add some debug output before redirection
                    echo "<script>console.log('Redirecting to admin_dashboard.php');</script>";
                    
                    // Try multiple redirection methods
                    header("Location: admin_dashboard.php");
                    echo "<script>window.location.href='admin_dashboard.php';</script>";
                    exit();
                } else {
                    // Incorrect password
                    $error_message = "Incorrect username or password.";
                }
            } else {
                // Incorrect username
                $error_message = "Incorrect username or password.";
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
    <link rel="stylesheet" href="css/logsinstyle.css">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet"/>
    <title>Admin Login</title>
    <style>
        .debug-info {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 10px;
            margin-top: 20px;
            display: none; /* Hide by default */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="left-side">
            <div class="yellow-blob">
                <h1><i class="ri-roadster-fill"></i>CarZone</h1>
                <img class="car-img" src="assets/car2.gif" alt="Car Image">
            </div>
        </div>
        <div class="right-side">
            <h1>Admin Login</h1>
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="POST">
                <div class="form-group">
                    <label>Username <i class="ri-user-settings-fill"></i></label>
                    <input type="text" name="username" placeholder="Enter Admin Username" required>
                </div>
                <div class="form-group">
                    <label>Password <i class="ri-lock-password-fill"></i></label>
                    <input type="password" name="password" placeholder="Enter your Password here" required>
                </div>
                <button type="submit" class="create-account-btn">Log In</button>
            </form>

            <!-- Error message if username or password is incorrect -->
            <?php if ($error_message != ""): ?>
                <div style="color: red; margin-top: 10px;">
                    <strong><?php echo $error_message; ?></strong>
                </div>
            <?php endif; ?>

            <!-- Debug Information -->
            <div class="debug-info" id="debugInfo">
                <h3>Debugging Information:</h3>
                <p>Server PHP Self: <?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?></p>
                <p>Current Session Status: 
                    <?php 
                    echo session_status() == PHP_SESSION_ACTIVE ? 'Active' : 'Not Active'; 
                    ?>
                </p>
                <?php if (isset($_SESSION)): ?>
                    <p>Session Variables: <?php print_r($_SESSION); ?></p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>