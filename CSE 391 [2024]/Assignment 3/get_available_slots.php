<?php
require_once 'dbconnection.php';

$date = $_GET['date'];
$mechanic_id = $_GET['mechanic_id'];

// Get all booked appointments for the mechanic on the selected date, excluding completed appointments
$query = "SELECT time_slot FROM appointments 
          WHERE mechanic_id = ? AND appointment_date = ? AND appointment_status != 'completed'";
$stmt = $conn->prepare($query);
$stmt->bind_param("is", $mechanic_id, $date);
$stmt->execute();
$result = $stmt->get_result();

$booked_times = [];
while ($row = $result->fetch_assoc()) {
    $booked_times[] = $row['time_slot'];
}

// Count total non-completed appointments for the day
$count_query = "SELECT COUNT(*) as count FROM appointments 
                WHERE mechanic_id = ? AND appointment_date = ? AND appointment_status != 'completed'";
$count_stmt = $conn->prepare($count_query);
$count_stmt->bind_param("is", $mechanic_id, $date);
$count_stmt->execute();
$count_result = $count_stmt->get_result()->fetch_assoc();

header('Content-Type: application/json');
echo json_encode([
    'bookedTimes' => $booked_times,
    'bookedSlots' => $count_result['count']
]);