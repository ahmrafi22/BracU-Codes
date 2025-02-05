<?php
require_once 'dbconnection.php';
session_start();

if (!isset($_SESSION['client_id'])) {
    header("Location: login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $client_id = $_SESSION['client_id'];
    $name = $_POST['name'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $address = $_POST['address'];

    $update_query = "UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE client_id = ?";
    $stmt = $conn->prepare($update_query);
    $stmt->bind_param("ssssi", $name, $phone, $email, $address, $client_id);
    
    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }
    exit();
}
?>