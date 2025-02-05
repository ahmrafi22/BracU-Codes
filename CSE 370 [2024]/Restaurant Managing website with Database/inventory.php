<?php
session_start();

// Check if the user is logged in as admin
if (!isset($_SESSION['staff_id']) || !$_SESSION['is_admin']) {
    header("Location: staff_login.php");
    exit();
}

include 'db_connection.php';

// Function to sanitize input
function sanitize_input($data) {
    global $conn;
    return mysqli_real_escape_string($conn, trim($data));
}

// Handle form submissions
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['add_item'])) {
        $item_name = sanitize_input($_POST['item_name']);
        $quantity = sanitize_input($_POST['quantity']);
        $unit = sanitize_input($_POST['unit']);
        
        $sql = "INSERT INTO inventory (item_name, quantity, unit) VALUES ('$item_name', '$quantity', '$unit')";
        mysqli_query($conn, $sql);
    } elseif (isset($_POST['update_item'])) {
        $id = sanitize_input($_POST['id']);
        $quantity = sanitize_input($_POST['quantity']);
        
        $sql = "UPDATE inventory SET quantity = '$quantity' WHERE id = '$id'";
        mysqli_query($conn, $sql);
    } elseif (isset($_POST['delete_item'])) {
        $id = sanitize_input($_POST['id']);
        
        $sql = "DELETE FROM inventory WHERE id = '$id'";
        mysqli_query($conn, $sql);
    }
}

// Fetch inventory items
$sql = "SELECT * FROM inventory ORDER BY item_name";
$result = mysqli_query($conn, $sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css2/inv.css"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Management</title>
</head>
<body>
    <img src="images/staff_bg.png" alt="User Avatar" class="avatar">
    <h1>Inventory Management</h1>
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
            <h2>Current Inventory</h2>
            <table>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                </tr>
                <?php while ($row = mysqli_fetch_assoc($result)) : ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['item_name']); ?></td>
                        <td><?php echo htmlspecialchars($row['quantity']); ?></td>
                        <td><?php echo htmlspecialchars($row['unit']); ?></td>
                        <td><?php echo htmlspecialchars($row['last_updated']); ?></td>
                        <td>
                            <button onclick="openUpdateModal(<?php echo $row['id']; ?>, '<?php echo $row['item_name']; ?>', <?php echo $row['quantity']; ?>)" class="addupdate-btn">Update</button>
                            <button onclick="openDeleteModal(<?php echo $row['id']; ?>, '<?php echo $row['item_name']; ?>')" class="delete-btn">Delete</button>
                        </td>
                    </tr>
                <?php endwhile; ?>
            </table>
            
            <button onclick="openAddModal()" class="addupdate-btn" style="margin-top: 20px;">Add New Item</button>
        </div>
    </div>

    <!-- Add Item Modal -->
    <div id="addModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('addModal')">&times;</span>
            <h2>Add New Item</h2>
            <form method="post">
                <input type="hidden" name="add_item" value="1">
                <label for="item_name">Item Name:</label>
                <input type="text" id="item_name" name="item_name" required><br><br>
                <label for="quantity">Quantity:</label>
                <input type="number" id="quantity" name="quantity" required><br><br>
                <label for="unit">Unit:</label>
                <input type="text" id="unit" name="unit" required><br><br>
                <input type="submit" value="Add Item" class="addupdate-btn">
            </form>
        </div>
    </div>

    <!-- Update Item Modal -->
    <div id="updateModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('updateModal')">&times;</span>
            <h2>Update Item</h2>
            <form method="post">
                <input type="hidden" name="update_item" value="1">
                <input type="hidden" id="update_id" name="id">
                <label for="update_item_name">Item Name:</label>
                <input type="text" id="update_item_name" name="item_name" readonly><br><br>
                <label for="update_quantity">New Quantity:</label>
                <input type="number" id="update_quantity" name="quantity" required><br><br>
                <input type="submit" value="Update Item" class="addupdate-btn">
            </form>
        </div>
    </div>

    <!-- Delete Item Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('deleteModal')">&times;</span>
            <h2>Delete Item</h2>
            <p>Are you sure you want to delete this item?</p>
            <form method="post">
                <input type="hidden" name="delete_item" value="1">
                <input type="hidden" id="delete_id" name="id">
                <p id="delete_item_name"></p>
                <input type="submit" value="Yes, Delete" class="delete-btn">
                <button type="button" onclick="closeModal('deleteModal')" class="addupdate-btn">Cancel</button>
            </form>
        </div>
    </div>

    <script>
        function openModal(modalId) {
            document.getElementById(modalId).style.display = "block";
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = "none";
        }

        function openAddModal() {
            openModal('addModal');
        }

        function openUpdateModal(id, name, quantity) {
            document.getElementById('update_id').value = id;
            document.getElementById('update_item_name').value = name;
            document.getElementById('update_quantity').value = quantity;
            openModal('updateModal');
        }

        function openDeleteModal(id, name) {
            document.getElementById('delete_id').value = id;
            document.getElementById('delete_item_name').textContent = name;
            openModal('deleteModal');
        }

        // Close the modal if the user clicks outside of it
        window.onclick = function(event) {
            if (event.target.className === "modal") {
                event.target.style.display = "none";
            }
        }
    </script>
</body>
</html>