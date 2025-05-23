<?php
// api/timetable.php
session_start();
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    exit('Not logged in');
}

$user_id = $_SESSION['user_id'];

// Fetch timetable
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->prepare("SELECT * FROM timetable WHERE user_id=?");
    $result->bind_param('i', $user_id);
    $result->execute();
    $res = $result->get_result();
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
    exit;
}

// Save (add or update)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = json_decode(file_get_contents('php://input'), true);
    $id = $json['id'] ?? null;
    $day = $json['day'];
    $time = $json['time'];
    $room = $json['room'];
    $course = $json['course'];
    $type = $json['type'];

    if ($id) {
        // Update
        $stmt = $conn->prepare("UPDATE timetable SET day=?, time=?, room=?, course=?, type=? WHERE id=? AND user_id=?");
        $stmt->bind_param('ssssiii', $day, $time, $room, $course, $type, $id, $user_id);
        $stmt->execute();
    } else {
        // Insert
        $stmt = $conn->prepare("INSERT INTO timetable (user_id, day, time, room, course, type) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('isssss', $user_id, $day, $time, $room, $course, $type);
        $stmt->execute();
    }
    echo json_encode(['success' => true]);
    exit;
}

// Delete
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $json = json_decode(file_get_contents('php://input'), true);
    $id = $json['id'];
    $stmt = $conn->prepare("DELETE FROM timetable WHERE id=? AND user_id=?");
    $stmt->bind_param('ii', $id, $user_id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}
?>