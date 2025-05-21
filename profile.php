<?php
session_start();
header('Content-Type: application/json');

$host = "localhost";
$dbname = "your_db_name";
$username = "your_db_user";
$password = "your_db_pass";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Assume user is logged in and user id is stored in session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch user profile
    $stmt = $conn->prepare("SELECT first_name, last_name, email, photo FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    echo json_encode($user);
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update user profile
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }
    $first_name = $data['first_name'] ?? '';
    $last_name = $data['last_name'] ?? '';
    $email = $data['email'] ?? '';
    $photo = $data['photo'] ?? '';

    // Basic validation example
    if (empty($first_name) || empty($last_name) || empty($email)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // Check if email already exists for another user
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->bind_param("si", $email, $user_id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email already in use"]);
        exit;
    }

    // Update
    $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=?, photo=? WHERE id=?");
    $stmt->bind_param("ssssi", $first_name, $last_name, $email, $photo, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "No changes made or update failed"]);
    }
    exit;
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}
?>
