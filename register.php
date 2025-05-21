<?php
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $first = $_POST['first_name'];
    $last = $_POST['last_name'];
    $email = $_POST['email'];
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $query = "INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssss", $first, $last, $email, $username, $hashedPassword);

    if ($stmt->execute()) {
        header("Location: login.html"); // Redirect to login after successful registration
        exit();
    } else {
        echo "Registration failed: " . $stmt->error;
    }

    $stmt->close();
}
?>
