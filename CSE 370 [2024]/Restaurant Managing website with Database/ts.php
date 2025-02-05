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
    print_r($row); // Print the row for debugging
    return $row['total'];
}


// Function to get total earnings (confirmed orders)
function getTotalEarnings($conn) {
    $sql = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'confirmed'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    print_r($row); // Print the row for debugging
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
echo $totalSalesOrders;
?>