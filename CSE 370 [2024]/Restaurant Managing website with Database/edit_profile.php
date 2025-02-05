<?php
session_start();
include 'db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$name = $_POST['name'] ?? '';
$phone = $_POST['phone'] ?? '';
$email = $_POST['email'] ?? '';

if (empty($name) || empty($phone) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}


$update_query = "UPDATE users SET name = ?, phone_number = ?, email = ? WHERE id = ?";
$update_stmt = $conn->prepare($update_query);
$update_stmt->bind_param("sssi", $name, $phone, $email, $user_id);

if ($update_stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}

$conn->close();
?>