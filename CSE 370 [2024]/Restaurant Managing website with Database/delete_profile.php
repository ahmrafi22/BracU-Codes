<?php
session_start();
include 'db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];


$conn->begin_transaction();

try {
    // Delete user's reviews
    $delete_reviews = "DELETE FROM reviews WHERE user_id = ?";
    $stmt = $conn->prepare($delete_reviews);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    // Delete user's reservations
    $delete_reservations = "DELETE FROM reservations WHERE user_id = ?";
    $stmt = $conn->prepare($delete_reservations);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    // Delete user's order items
    $delete_order_items = "DELETE oi FROM order_items oi
                           JOIN orders o ON oi.order_id = o.id
                           WHERE o.user_id = ?";
    $stmt = $conn->prepare($delete_order_items);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    // Delete user's orders
    $delete_orders = "DELETE FROM orders WHERE user_id = ?";
    $stmt = $conn->prepare($delete_orders);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    // delete the user
    $delete_user = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($delete_user);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();


    $conn->commit();

  
    session_destroy();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // for error
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Failed to delete profile: ' . $e->getMessage()]);
}

$conn->close();
?>