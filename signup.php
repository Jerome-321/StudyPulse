<?php
session_start();
require 'db.php';

// Only process POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method Not Allowed");
}

// Initialize response
$response = ['success' => false, 'message' => ''];

try {
    // Validate and sanitize inputs
    $fname = trim(filter_input(INPUT_POST, 'first_name', FILTER_SANITIZE_STRING));
    $lname = trim(filter_input(INPUT_POST, 'last_name', FILTER_SANITIZE_STRING));
    $email = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
    $username = trim(filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING));
    $raw_password = $_POST['password'];

    // Validate inputs
    if (empty($fname) || strlen($fname) > 50) {
        throw new Exception("First name must be 1-50 characters");
    }
    if (empty($lname) || strlen($lname) > 50) {
        throw new Exception("Last name must be 1-50 characters");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }
    if (!preg_match('/^[a-zA-Z0-9_]{4,20}$/', $username)) {
        throw new Exception("Username must be 4-20 alphanumeric characters");
    }
    if (strlen($raw_password) < 8) {
        throw new Exception("Password must be at least 8 characters");
    }

    // Check for existing user
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->bind_param("ss", $email, $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        throw new Exception("Email or username already exists");
    }
    $stmt->close();

    // Hash password
    $password = password_hash($raw_password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $fname, $lname, $email, $username, $password);

    if ($stmt->execute()) {
        $response = [
            'success' => true,
            'message' => "Registration successful! Redirecting to login...",
            'redirect' => "login.php"
        ];
    } else {
        throw new Exception("Registration failed: " . $conn->error);
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
exit();
