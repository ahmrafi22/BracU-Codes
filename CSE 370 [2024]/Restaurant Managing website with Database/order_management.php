<?php
session_start();
require_once 'db_connection.php';

// Check if the user is logged in and is an admin
if (!isset($_SESSION['staff_id']) || !$_SESSION['is_admin']) {
    header("Location: staff_login.php");
    exit();
}

$success_message = '';

// Handle order status updates
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $order_id = $_POST['order_id'];
    $new_status = $_POST['new_status'];

    $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $new_status, $order_id);
    
    if ($stmt->execute()) {
        $success_message = ($new_status === 'confirmed') ? "Successfully confirmed order #$order_id" : "Successfully cancelled order #$order_id";
    } else {
        $success_message = "Error updating order status.";
    }
}

// Fetch all orders with order items
$stmt = $conn->prepare("SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, u.username,
                        oi.menu_item_id, oi.quantity, mi.name AS item_name
                        FROM orders o 
                        JOIN users u ON o.user_id = u.id 
                        JOIN order_items oi ON o.id = oi.order_id
                        JOIN menu_items mi ON oi.menu_item_id = mi.id
                        WHERE o.status = 'pending'
                        ORDER BY o.created_at DESC");
$stmt->execute();
$result = $stmt->get_result();
$orders = [];
while ($row = $result->fetch_assoc()) {
    $order_id = $row['id'];
    if (!isset($orders[$order_id])) {
        $orders[$order_id] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'total_amount' => $row['total_amount'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'items' => []
        ];
    }
    $orders[$order_id]['items'][] = [
        'name' => $row['item_name'],
        'quantity' => $row['quantity']
    ];
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css2/order_mng.css"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Management</title>
</head>
<body>
    <img src="images/staff_bg.png" alt="User Avatar" class="avatar">
    <h1>Order Management</h1>
    <div class="container">
        <div class="button-grid">
            <a href="admin_dashboard.php" class="bn632-hover admin-dashboard">
                <img src="images/staff_bg.png" alt="Menu">
                Admin Dashboard
            </a>
            <a href="table_mange.php" class="bn632-hover table-confirmation" data-page="table-confirmation">
                <img src="images/table_icon.svg" alt="Table">
                Table Confirmation
            </a>
            <a href="order_management.php" class="bn632-hover order-confirmation" data-page="order-confirmation">
                <img src="images/order_icon.svg" alt="Order">
                Order Confirmation
            </a>
            <a href="menu_manage.php" class="bn632-hover menu-management">
                <img src="images/menu_icon.svg" alt="Menu">
                Menu Management
            </a>
            <a href="inventory.php" class="bn632-hover inventory-management" data-page="inventory-management">
                <img src="images/inventory_icon.svg" alt="Inventory">
                Inventory Management
            </a>
            <a href="logout.php" class="bn632-hover logout-button">
                <img src="images/admin_exit.svg" alt="Logout">
                Logout
            </a>
        </div>
        <section class="ftco-section">
            <div class="content-area">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Items</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($orders as $order): ?>
                        <tr>
                            <td><?php echo $order['id']; ?></td>
                            <td><?php echo htmlspecialchars($order['username']); ?></td>
                            <td>$<?php echo number_format($order['total_amount'], 2); ?></td>
                            <td><?php echo ucfirst($order['status']); ?></td>
                            <td><?php echo $order['created_at']; ?></td>
                            <td>
                                <?php foreach ($order['items'] as $item): ?>
                                    <?php echo htmlspecialchars($item['name']); ?> (x<?php echo $item['quantity']; ?>)<br>
                                <?php endforeach; ?>
                            </td>
                            <td>
                                <form method="post" action="order_management.php">
                                    <input type="hidden" name="order_id" value="<?php echo $order['id']; ?>">
                                    <input type="hidden" name="update_status" value="1">
                                    <button type="submit" name="new_status" value="confirmed" class="confirm-btn">
                                        <span>Confirm </span>
                                    </button>
                                    <span> </span>
                                    <button type="submit" name="new_status" value="cancelled" class="cancel-btn">
                                        <span>Cancel</span>
                                    </button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </div>

    <!-- Modal -->
    <div id="successModal" class="modal">
        <div class="modal-content" id="modal-message">
            <?php if (!empty($success_message)): ?>
                <?php echo $success_message; ?>
            <?php endif; ?>
        </div>
    </div>

    <script>
        // Show the modal if success message exists
        document.addEventListener('DOMContentLoaded', function() {
            var modal = document.getElementById('successModal');
            var message = "<?php echo $success_message; ?>";
            if (message) {
                modal.style.display = 'flex';
                setTimeout(function() {
                    modal.style.display = 'none';
                }, 1400);
            }
        });
    </script>
</body>
</html>