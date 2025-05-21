<?php
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get input data
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Check if email or username already exists using prepared statement
    $checkQuery = "SELECT id FROM users WHERE email = ? OR username = ?";
    $stmt = mysqli_prepare($conn, $checkQuery);
    mysqli_stmt_bind_param($stmt, "ss", $email, $username);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        echo "Email or username already exists.";
        mysqli_stmt_close($stmt);
    } else {
        mysqli_stmt_close($stmt);

        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert new user with prepared statement
        $insertQuery = "INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $insertQuery);
        mysqli_stmt_bind_param($stmt, "sssss", $first_name, $last_name, $email, $username, $hashed_password);

        if (mysqli_stmt_execute($stmt)) {
            echo "Registration successful! <a href='login.html'>Login here</a>";
        } else {
            echo "Error: " . mysqli_error($conn);
        }
        mysqli_stmt_close($stmt);
    }
}

mysqli_close($conn);
?>
