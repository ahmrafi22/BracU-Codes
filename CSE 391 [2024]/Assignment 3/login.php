<?php
// Start session for storing login status
session_start();

// Include database connection
require_once 'dbconnection.php';

// Initialize error and success messages
$error_message = "";
$email = "";

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validate inputs
    if (empty($email)) {
        $error_message = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message = "Invalid email format.";
    }

    if (empty($password)) {
        $error_message = "Password is required.";
    }

    // If no validation errors, proceed with login
    if (empty($error_message)) {
        try {
            // Prepare SQL statement to find user
            $stmt = $conn->prepare("SELECT client_id, name, password_hash FROM clients WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 1) {
                // User found, verify password
                $user = $result->fetch_assoc();
                
                if (password_verify($password, $user['password_hash'])) {
                    // Password correct, set session variables
                    $_SESSION['client_id'] = $user['client_id'];
                    $_SESSION['name'] = $user['name'];
                    $_SESSION['logged_in'] = true;

                    // Redirect to dashboard or home page
                    header("Location: index.php");
                    exit();
                } else {
                    $error_message = "Invalid email or password.";
                }
            } else {
                $error_message = "Invalid email or password.";
            }

            // Close statement
            $stmt->close();
        } catch (Exception $e) {
            $error_message = "Login error: " . $e->getMessage();
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
    <title>Login</title>
    <style>
        .error-message {
            color: red;
            margin-top: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="left-side">
            <div class="yellow-blob">
                <h1><i class="ri-roadster-fill"></i>CarZone</h1>
                <img class="car-img" src="assets/car.gif" alt="">
            </div>
        </div>
        <div class="right-side">
            <h1>Login to your Account</h1>
            
            <?php if ($error_message != ""): ?>
                <div class="error-message">
                    <strong><?php echo $error_message; ?></strong>
                </div>
            <?php endif; ?>

            <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                <div class="form-group">
                    <label>Email <i class="ri-mail-fill"></i></label>
                    <input type="email" name="email" placeholder="Enter your Email here" 
                           value="<?php echo htmlspecialchars($email); ?>" required>
                </div>
                <div class="form-group">
                    <label>Password <i class="ri-lock-password-fill"></i></label>
                    <input type="password" name="password" placeholder="Enter your Password here" required>
                </div>
                <button type="submit" class="create-account-btn">Log In</button>
            </form>
            <p class="login-text">Don't have an account? <a href="SignUp.php">Sign Up</a></p>
        </div>
    </div>
</body>
</html>