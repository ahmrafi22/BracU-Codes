<?php
session_start();
require_once 'db_connection.php';

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    $sql = "SELECT id, username, password FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            header("Location: index.php");
            exit();
        } else {
            $error = "Invalid username or password";
        }
    } else {
        $error = "Invalid username or password";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login For Restaurant</title>
    <link rel="stylesheet" href="LRstyle.css">
</head>
<body>
    <div class="login-form">
        <h1>Login</h1>
        <div class="container">
            <div class="main">
                <div class="content">
                    <h2>Log In</h2>
                    <?php if ($error): ?>
                        <p class="error"><?php echo $error; ?></p>
                    <?php endif; ?>
                    <form action="" method="post">
                        <input type="text" name="username" placeholder="User Name" required autofocus>
                        <input type="password" name="password" placeholder="User Password" required>
                        <button class="btn" type="submit">
                            Login
                        </button>
                    </form>
                    <p class="account">Don't Have An Account? <a href="register.php">Register</a></p>
                </div>
                <div class="form-img">
                    <img src="images/bg.jpg" alt="">
                </div>
            </div>
        </div>
    </div>
</body>
</html>