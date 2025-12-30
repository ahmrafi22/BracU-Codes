<?php
require_once 'dbconnection.php';

$date = $_GET['date'];
$client_id = $_GET['client_id'];

$query = "SELECT * FROM appointments 
          WHERE client_id = ? AND appointment_date = ? 
          AND appointment_status != 'completed'";
$stmt = $conn->prepare($query);
$stmt->bind_param("is", $client_id, $date);
$stmt->execute();
$result = $stmt->get_result();

header('Content-Type: application/json');
echo json_encode(['hasAppointment' => $result->num_rows > 0]);