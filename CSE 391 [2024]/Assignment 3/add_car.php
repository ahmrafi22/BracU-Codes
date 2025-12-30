<?php
require_once 'dbconnection.php';
session_start();

if (!isset($_SESSION['client_id'])) {
    header("Location: login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $client_id = $_SESSION['client_id'];
    $car_name = $_POST['car_name'];
    $license_number = $_POST['license_number'];
    $engine_number = $_POST['engine_number'];

    $insert_query = "INSERT INTO cars (client_id, car_name, license_number, engine_number) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($insert_query);
    $stmt->bind_param("isss", $client_id, $car_name, $license_number, $engine_number);
    
    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }
    exit();
}
?>