<?php
session_start();

// Check if the user is logged in as admin
if (!isset($_SESSION['staff_id']) || !$_SESSION['is_admin']) {
    header("Location: stuff_login.php");
    exit();
}

include 'db_connection.php';

// Handle reservation status updates
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['reservation_id']) && isset($_POST['action'])) {
    $reservation_id = $_POST['reservation_id'];
    $action = $_POST['action'];
    
    if ($action === 'confirm') {
        $status = 'confirmed';
    } elseif ($action === 'cancel') {
        $status = 'cancelled';
    } else {
        die("Invalid action");
    }
    
    $sql = "UPDATE reservations SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $status, $reservation_id);
    $stmt->execute();
    $stmt->close();
}

// Handle adding new table
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['add_table'])) {
    $table_number = $_POST['table_number'];
    $capacity = $_POST['capacity'];
    
    $sql = "INSERT INTO tables (table_number, capacity) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $table_number, $capacity);
    $stmt->execute();
    $stmt->close();
}

// Handle deleting table
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['delete_table'])) {
    $table_id = $_POST['table_id'];
    
    $sql = "DELETE FROM tables WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $table_id);
    $stmt->execute();
    $stmt->close();
}

// Fetch pending reservations
$sql = "SELECT r.*, u.name as user_name, t.capacity 
        FROM reservations r 
        JOIN users u ON r.user_id = u.id 
        JOIN tables t ON r.table_number = t.table_number 
        WHERE r.status = 'pending'
        ORDER BY r.reservation_date, r.reservation_time";
$result = $conn->query($sql);
$reservations = $result->fetch_all(MYSQLI_ASSOC);

// Fetch all tables
$sql = "SELECT * FROM tables ORDER BY table_number";
$result = $conn->query($sql);
$tables = $result->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="css2/tab_man.css"> 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Management</title>
    <style>
        .popup {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        }
        .popup-content {
            background-color: black;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 300px;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .delete-btn {
            background-color: #ff4136;
            color: white;
            border: none;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <img src="images/staff_bg.png" alt="User Avatar" class="avatar">
    <h1>Reservation Management</h1>
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
            <h2>Pending Reservations</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Table</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>People</th>
                        <th>Comments</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($reservations as $reservation): ?>
                    <tr>
                        <td><?php echo $reservation['id']; ?></td>
                        <td><?php echo htmlspecialchars($reservation['user_name']); ?></td>
                        <td>Table <?php echo $reservation['table_number']; ?> (Capacity: <?php echo $reservation['capacity']; ?>)</td>
                        <td><?php echo $reservation['reservation_date']; ?></td>
                        <td><?php echo $reservation['reservation_time']; ?></td>
                        <td><?php echo $reservation['number_of_people']; ?></td>
                        <td><?php echo htmlspecialchars($reservation['comment']); ?></td>
                        <td>
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="reservation_id" value="<?php echo $reservation['id']; ?>">
                                <button type="submit" name="action" value="confirm" class="confirm-btn">Confirm</button>
                                <button type="submit" name="action" value="cancel" class="cancel-btn">Cancel</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <button id="addTableBtn" class="confirm-btn">Add New Table</button>
            <button id="deleteTableBtn" class="cancel-btn">Delete Table</button>
        </div>
    </div>

    <!-- Add Table Popup -->
    <div id="addTablePopup" class="popup">
        <div class="popup-content">
            <span class="close">&times;</span>
            <h2>Add New Table</h2>
            <form method="POST">
                <label for="table_number">Table Number:</label>
                <input type="number" id="table_number" name="table_number" required><br><br>
                <label for="capacity">Capacity:</label>
                <input type="number" id="capacity" name="capacity" required><br><br>
                <input type="submit" name="add_table" value="Add Table" class="confirm-btn">
            </form>
        </div>
    </div>

    <!-- Delete Table Popup -->
    <div id="deleteTablePopup" class="popup">
        <div class="popup-content">
            <span class="close">&times;</span>
            <h2>Delete Table</h2>
            <form method="POST">
                <label for="table_id">Select Table:</label>
                <select id="table_id" name="table_id" required>
                    <?php foreach ($tables as $table): ?>
                        <option value="<?php echo $table['id']; ?>">
                            Table <?php echo $table['table_number']; ?> (Capacity: <?php echo $table['capacity']; ?>)
                        </option>
                    <?php endforeach; ?>
                </select><br><br>
                <input type="submit" name="delete_table" value="Delete Table" class="cancel-btn">
            </form>
        </div>
    </div>

    <script>
        // Function to handle popups
        function setupPopup(btnId, popupId) {
            var popup = document.getElementById(popupId);
            var btn = document.getElementById(btnId);
            var span = popup.getElementsByClassName("close")[0];

            btn.onclick = function() {
                popup.style.display = "block";
            }

            span.onclick = function() {
                popup.style.display = "none";
            }

            window.onclick = function(event) {
                if (event.target == popup) {
                    popup.style.display = "none";
                }
            }
        }

        // Setup Add Table Popup
        setupPopup("addTableBtn", "addTablePopup");

        // Setup Delete Table Popup
        setupPopup("deleteTableBtn", "deleteTablePopup");
    </script>
</body>
</html>