<?php
session_start();

// Check if the user is logged in as admin
if (!isset($_SESSION['staff_id']) || !$_SESSION['is_admin']) {
    header("Location: stuff_login.php");
    exit();
}

// Include the database connection file
require_once 'db_connection.php';

// Check if the database connection is established
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// Handle form submissions
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['add_item'])) {
        $name = mysqli_real_escape_string($conn, $_POST['name']);
        $description = mysqli_real_escape_string($conn, $_POST['description']);
        $price = floatval($_POST['price']);
        $category = mysqli_real_escape_string($conn, $_POST['category']);

        $target_dir = "images/";
        // Ensure the images directory exists
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        $target_file = $target_dir . basename($_FILES["image"]["name"]);
        $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

        // Check if image file is a actual image or fake image
        $check = getimagesize($_FILES["image"]["tmp_name"]);
        if ($check !== false) {
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                $sql = "INSERT INTO menu_items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)";
                $stmt = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt, "ssdss", $name, $description, $price, $category, $target_file);
                if (mysqli_stmt_execute($stmt)) {
                    $message = "New item added successfully.";
                } else {
                    $message = "Error: " . mysqli_error($conn);
                }
                mysqli_stmt_close($stmt);
            } else {
                $message = "Sorry, there was an error uploading your file.";
            }
        } else {
            $message = "File is not an image.";
        }
    } elseif (isset($_POST['delete_item'])) {
        $id = intval($_POST['id']);
        $sql = "DELETE FROM menu_items WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $id);
        if (mysqli_stmt_execute($stmt)) {
            $message = "Item deleted successfully.";
        } else {
            $message = "Error: " . mysqli_error($conn);
        }
        mysqli_stmt_close($stmt);
    }
}

// Fetch menu items
$sql = "SELECT * FROM menu_items ORDER BY category, name";
$result = mysqli_query($conn, $sql);
if (!$result) {
    die("Error fetching menu items: " . mysqli_error($conn));
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" href="css2/menu.css"> 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu Management</title>
</head>
<body>
    <img src="images/staff_bg.png" alt="User Avatar" class="avatar">
    <h1>Menu Management</h1>
    <div class="container">
        <div class="button-grid">
            <a href="admin_dashboard.php" class="bn632-hover admin-dashboard">
                <img src="images/staff_bg.png" alt="Menu">
                Admin Dashboard
            </a>
            <a href="table_mange.php" class="bn632-hover table-confirmation">
                <img src="images/table_icon.svg" alt="Table">
                Table Confirmation
            </a>
            <a href="order_management.php" class="bn632-hover order-confirmation">
                <img src="images/order_icon.svg" alt="Order">
                Order Confirmation
            </a>
            <a href="menu_manage.php" class="bn632-hover menu-management">
                <img src="images/menu_icon.svg" alt="Menu">
                Menu Management
            </a>
            <a href="inventory.php" class="bn632-hover inventory-management">
                <img src="images/inventory_icon.svg" alt="Inventory">
                Inventory Management
            </a>
            <a href="logout.php" class="bn632-hover logout-button">
                <img src="images/admin_exit.svg" alt="Logout">
                Logout
            </a>
        </div>
        <div class="content-area">
            <?php if(isset($message)): ?>
                <div class="message"><?php echo htmlspecialchars($message); ?></div>
            <?php endif; ?>

            <h2>Add New Menu Item</h2>
            <form method="POST" action="" enctype="multipart/form-data">
                <input type="text" name="name" placeholder="Item Name" required>
                <textarea name="description" placeholder="Description" required></textarea>
                <input type="number" name="price" placeholder="Price" step="0.01" required>
                <select name="category" required>
                    <option value="">Select Category</option>
                    <option value="drink">Drink</option>
                    <option value="food">Food</option>
                </select>
                <input type="file" name="image" required>
                <input type="submit" name="add_item" value="Add Item" class="confirm-btn">
            </form>

            <h2>Current Menu Items</h2>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Action</th>
                </tr>
                <?php while($row = mysqli_fetch_assoc($result)): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['name']); ?></td>
                        <td><?php echo htmlspecialchars($row['description']); ?></td>
                        <td>$<?php echo number_format($row['price'], 2); ?></td>
                        <td><?php echo htmlspecialchars($row['category']); ?></td>
                        <td>
                            <form method="POST" action="">
                                <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                                <input type="submit" name="delete_item" value="Delete" class="cancel-btn" onclick="return confirm('Are you sure you want to delete this item?');">
                            </form>
                        </td>
                    </tr>
                <?php endwhile; ?>
            </table>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const inputs = form.querySelectorAll('input[type="text"], input[type="number"], select, textarea');

            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.boxShadow = '0 0 5px rgba(81, 203, 238, 1)';
                });

                input.addEventListener('blur', function() {
                    this.style.boxShadow = 'none';
                });
            });
        });
    </script>
</body>
</html>