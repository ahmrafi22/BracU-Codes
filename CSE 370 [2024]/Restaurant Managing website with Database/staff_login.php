<?php
session_start();
require_once 'db_connection.php';

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $conn->real_escape_string($_POST['username']);
    $password = $_POST['password'];

    $sql = "SELECT * FROM staff WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['staff_id'] = $user['id'];
            $_SESSION['is_admin'] = $user['is_admin'];
            header("Location: admin_dashboard.php");
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
    <title>Staff Login For Restaurant</title>
    <link rel="stylesheet" href="LRstyle.css">
</head>
<body>
    <div class="login-form">
        <h1>Staff Login</h1>
        <div class="container">
            <div class="main">
                <div class="content">
                    <h2>Staff Log In</h2>
                    <?php if ($error): ?>
                        <p class="error"><?php echo $error; ?></p>
                    <?php endif; ?>
                    <form action="" method="post">
                        <input type="text" name="username" placeholder="Staff Username" required autofocus>
                        <input type="password" name="password" placeholder="Staff Password" required>
                        <button class="btn" type="submit">
                            Login
                        </button>
                    </form>
                    <p class="account">Not a staff member? <a href="login.php">User Login</a></p>
                </div>
                <div class="form-img">
                    <img src="images/staff_bg.png" alt="Staff Login">
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const inputs = form.querySelectorAll('input');

            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.boxShadow = '0 0 5px rgba(78, 52, 182, 0.7)';
                });

                input.addEventListener('blur', function() {
                    this.style.boxShadow = 'none';
                });
            });
        });
    </script>
</body>
</html>