<?php
session_start();
require_once 'db_connection.php';

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $name = $_POST['name'];
    $phone_number = $_POST['phone_number'];
    $email = $_POST['email'];
    
    // Check if username or email already exists
    $check_sql = "SELECT * FROM users WHERE username = ? OR email = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ss", $username, $email);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        $error = "Username or email already exists";
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (username, password, name, phone_number, email) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $username, $hashed_password, $name, $phone_number, $email);
        
        if ($stmt->execute()) {
            $success = "Registration successful. You can now login.";
        } else {
            $error = "Error: " . $stmt->error;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register For Restaurant</title>
    <link rel="stylesheet" href="LRstyle.css">
</head>
<body>
    <div class="login-form">
        <h1>Register</h1>
        <div class="container">
            <div class="main">
                <div class="content">
                    <h2>Sign Up</h2>
                    <?php if ($error): ?>
                        <p class="error"><?php echo $error; ?></p>
                    <?php endif; ?>
                    <?php if ($success): ?>
                        <p class="success"><?php echo $success; ?></p>
                    <?php endif; ?>
                    <form action="" method="post">
                        <input type="text" name="username" placeholder="User Name" required autofocus>
                        <input type="password" name="password" placeholder="Password" required>
                        <input type="text" name="name" placeholder="Full Name" required>
                        <input type="tel" name="phone_number" placeholder="Phone Number" required>
                        <input type="email" name="email" placeholder="Email" required>
                        <button class="btn" type="submit">
                            Register
                        </button>
                    </form>
                    <p class="account">Already Have An Account? <a href="login.php">Login</a></p>
                </div>
                <div class="form-img">
                    <img src="images/bg.jpg" alt="">
                </div>
            </div>
        </div>
    </div>
</body>
</html>