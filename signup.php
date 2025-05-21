<?php
session_start();
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Check if user exists
    $checkQuery = "SELECT id FROM users WHERE email = ? OR username = ?";
    $stmt = mysqli_prepare($conn, $checkQuery);
    mysqli_stmt_bind_param($stmt, "ss", $email, $username);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        $_SESSION['error'] = "Email or username already exists";
        header("Location: signup.php");  // Stay on signup page
        exit();
    }
    mysqli_stmt_close($stmt);

    // Hash password and create user
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $insertQuery = "INSERT INTO users (...) VALUES (?,?,?,?,?)";
    $stmt = mysqli_prepare($conn, $insertQuery);
    mysqli_stmt_bind_param($stmt, "sssss", $first_name, $last_name, $email, $username, $hashed_password);

    if (mysqli_stmt_execute($stmt)) {
        $_SESSION['success'] = "Registration successful! Please login";
        header("Location: login.php");  // Redirect to login.php
        exit();
    } else {
        $_SESSION['error'] = "Registration failed: " . mysqli_error($conn);
        header("Location: signup.php");
        exit();
    }
}

mysqli_close($conn);
?>
