<?php
session_start();

// Check if the user is logged in as admin
if (!isset($_SESSION['staff_id']) || !$_SESSION['is_admin']) {
    header("Location: staff_login.php");
    exit();
}

include 'db_connection.php';

// Function to get total sales order number
function getTotalSalesOrders($conn) {
    $sql = "SELECT COUNT(*) as total FROM orders WHERE status = 'confirmed'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    return $row['total'];
}

// Function to get total earnings (confirmed)
function getTotalEarnings($conn) {
    $sql = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'confirmed'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    return $row['total'] ? number_format($row['total'], 2) : '0.00';
}

// Function to get pending earnings
function getPendingEarnings($conn) {
    $sql = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'pending'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    return $row['total'] ? number_format($row['total'], 2) : '0.00';
}

// Function to get pending orders
function getPendingOrders($conn) {
    $sql = "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    return $row['total'];
}

// Function to get total available tables


function getAvailableTables($conn) {
    $currentDate = date('Y-m-d');
    $currentTime = date('H:i:s');

    $sql = "SELECT COUNT(*) as available
            FROM tables t
            WHERE t.table_number NOT IN (
                SELECT r.table_number
                FROM reservations r
                WHERE r.reservation_date = ?
                AND r.reservation_time >= ?
                AND r.status = 'confirmed'
            )";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ss", $currentDate, $currentTime);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);

    return $row['available'];
}

// Function to get average rating
function getAverageRating($conn) {
    $sql = "SELECT AVG(rating) as avg_rating FROM reviews";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    return round($row['avg_rating'], 1);
}

// Function to get daily sales data for the last 7 days
function getDailySales($conn) {
    $sql = "SELECT DATE(created_at) as date, SUM(total_amount) as total 
            FROM orders 
            WHERE created_at >= DATE(NOW()) - INTERVAL 7 DAY 
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at)";
    $result = mysqli_query($conn, $sql);
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    return $data;
}

$totalSalesOrders = getTotalSalesOrders($conn);
$totalEarnings = getTotalEarnings($conn);
$pendingEarnings = getPendingEarnings($conn);
$pendingOrders = getPendingOrders($conn);
$totalAvailableTables = getAvailableTables($conn);
$averageRating = getAverageRating($conn);
$dailySales = getDailySales($conn);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="css2/ad_dash.css"> 
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 
</head>
<body>
    <img src="images/staff_bg.png" alt="User Avatar" class="avatar">
    <h1>Admin Dashboard</h1>
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
        <div class="dashboard-content">
            <div class="dashboard-grid">
                <div class="dashboard-item" style="background-color: rgba(76, 175, 80, 0.2);">
                    <img src="images/order.svg" alt="Total Orders">
                    <h2>Total Sold Orders</h2>
                    <p><?php echo $totalSalesOrders; ?></p>
                </div>
                <div class="dashboard-item" style="background-color: rgba(33, 150, 243, 0.2);">
                    <img src="images/dollar_sign.svg" alt="Total Earnings">
                    <h2>Total Earnings </h2>
                    <p>$<?php echo $totalEarnings; ?></p>
                </div>
                <div class="dashboard-item" style="background-color: rgba(255, 193, 7, 0.2);">
                    <img src="images/tables.svg" alt="Available Tables">
                    <h2>Available Tables</h2>
                    <p><?php echo $totalAvailableTables; ?></p>
                </div>
                <div class="dashboard-item" style="background-color: rgba(255, 87, 34, 0.2);">
                    <img src="images/star.svg" alt="Average Rating">
                    <h2>Average Rating</h2>
                    <p class="stars">
                        <?php
                        $fullStars = floor($averageRating);
                        $halfStar = $averageRating - $fullStars >= 0.5;
                        for ($i = 1; $i <= 5; $i++) {
                            if ($i <= $fullStars) {
                                echo '★';
                            } elseif ($i == $fullStars + 1 && $halfStar) {
                                echo '½';
                            } else {
                                echo '☆';
                            }
                        }
                        ?>
                    </p>
                    <p><?php echo $averageRating; ?> / 5</p>
                </div>
                <div class="dashboard-item" style="background-color: rgba(156, 39, 176, 0.2);">
                    <img src="images/pending_dollar.svg" alt="Pending Earnings">
                    <h2>Pending Earnings</h2>
                    <p>$<?php echo $pendingEarnings; ?></p>
                </div>
                <div class="dashboard-item" style="background-color: rgba(233, 30, 99, 0.2);">
                    <img src="images/pending_order.svg" alt="Pending Orders">
                    <h2>Pending Orders</h2>
                    <p><?php echo $pendingOrders; ?></p>
                </div>
            </div>

            <div class="dashboard-item">
                <h2>Daily Sales (Last 7 Days)</h2>
                <canvas id="salesChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        // Chart bar graph
        var ctx = document.getElementById('salesChart').getContext('2d');
        var salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: <?php echo json_encode(array_column($dailySales, 'date')); ?>,
                datasets: [{
                    label: 'Daily Sales',
                    data: <?php echo json_encode(array_column($dailySales, 'total')); ?>,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });


    </script>
</body>
</html>