<?php
// Include database connection
require_once 'dbconnection.php';

// Initialize error and success messages
$error_message = "";
$success_message = "";

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validate inputs
    if (empty($name)) {
        $error_message .= "Name is required. ";
    }

    if (empty($email)) {
        $error_message .= "Email is required. ";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message .= "Invalid email format. ";
    }

    if (empty($password)) {
        $error_message .= "Password is required. ";
    } elseif (strlen($password) < 8) {
        $error_message .= "Password must be at least 8 characters long. ";
    }

    // If no errors, proceed with database insertion
    if (empty($error_message)) {
        try {
            // Hash the password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // Prepare SQL statement
            $stmt = $conn->prepare("INSERT INTO clients (name, email, password_hash) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $name, $email, $password_hash);

            // Execute the statement
            if ($stmt->execute()) {
                $success_message = "Signup successful! Please login to continue.";
                
                // Clear form inputs
                $name = '';
                $email = '';
            } else {
                $error_message = "Error creating account. Please try again.";
            }

            // Close statement
            $stmt->close();
        } catch (Exception $e) {
            $error_message = "Database error: " . $e->getMessage();
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
    <title>Create Account</title>
    <style>
        .success-message {
            color: green;
            margin-top: 10px;
            text-align: center;
        }
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
            <h1>Create your Free Account</h1>

            <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                <div class="form-group">
                    <label>Full Name <i class="ri-user-3-fill"></i></label>
                    <input type="text" name="name" placeholder="Enter your Full Name here" 
                           value="<?php echo htmlspecialchars($name ?? ''); ?>" required>
                </div>
                <div class="form-group">
                    <label>Email <i class="ri-mail-fill"></i></label>
                    <input type="email" name="email" placeholder="Enter your Email here" 
                           value="<?php echo htmlspecialchars($email ?? ''); ?>" required>
                </div>
                <div class="form-group">
                    <label>Password <i class="ri-lock-password-fill"></i></label>
                    <input type="password" name="password" placeholder="Enter your Password here" required>
                </div>
                <button type="submit" class="create-account-btn">Create Account</button>
            </form>
            <?php if ($error_message != ""): ?>
                <div class="error-message">
                    <strong><?php echo $error_message; ?></strong>
                </div>
            <?php endif; ?>

            <?php if ($success_message != ""): ?>
                <div class="success-message">
                    <strong><?php echo $success_message; ?></strong>
                </div>
            <?php endif; ?>
            <p class="login-text">Already have an account? <a href="login.php?">Log In</a></p>
        </div>
    </div>
</body>
</html>