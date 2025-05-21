<?php
require 'db.php'; // includes your DB connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fname = trim($_POST["first_name"]);
    $lname = trim($_POST["last_name"]);
    $email = trim($_POST["email"]);
    $username = trim($_POST["username"]);
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT);

    // Check for existing email or username
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->bind_param("ss", $email, $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo "Email or Username already exists.";
    } else {
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $fname, $lname, $email, $username, $password);
        if ($stmt->execute()) {
            echo "Registration successful! <a href='login.html'>Login here</a>";
        } else {
            echo "Error: " . $conn->error;
        }
    }

    $stmt->close();
}
$conn->close();
?>
