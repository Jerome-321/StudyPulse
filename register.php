<?php
session_start();
require 'db.php';

// Generate CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        die("Invalid CSRF token");
    }

    // Sanitize and validate inputs
    $first_name = trim(filter_input(INPUT_POST, 'first_name', FILTER_SANITIZE_STRING));
    $last_name = trim(filter_input(INPUT_POST, 'last_name', FILTER_SANITIZE_STRING));
    $email = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
    $username = trim(filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING));
    $password = $_POST['password'];

    // Validate inputs
    $errors = [];
    
    if (empty($first_name) || strlen($first_name) > 50) {
        $errors[] = "First name must be 1-50 characters";
    }
    
    if (empty($last_name) || strlen($last_name) > 50) {
        $errors[] = "Last name must be 1-50 characters";
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]{4,20}$/', $username)) {
        $errors[] = "Username must be 4-20 alphanumeric characters";
    }
    
    if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
        $errors[] = "Password must be 8+ characters with at least one uppercase letter and one number";
    }

    if (!empty($errors)) {
        $_SESSION['register_errors'] = $errors;
        header("Location: register.php");
        exit();
    }

    // Check for existing user
    $checkQuery = "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1";
    $stmt = mysqli_prepare($conn, $checkQuery);
    mysqli_stmt_bind_param($stmt, "ss", $email, $username);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        $_SESSION['register_errors'] = ["Email or username already exists"];
        header("Location: register.php");
        exit();
    }
    mysqli_stmt_close($stmt);

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $insertQuery = "INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $insertQuery);
    mysqli_stmt_bind_param($stmt, "sssss", $first_name, $last_name, $email, $username, $hashed_password);

    if (mysqli_stmt_execute($stmt)) {
        // Auto-login after registration
        $user_id = mysqli_insert_id($conn);
        
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        $_SESSION['last_login'] = time();
        
        setcookie(session_name(), session_id(), [
            'expires' => time() + 86400,
            'path' => '/',
            'domain' => $_SERVER['HTTP_HOST'],
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
        header("Location: dashboard.php");
        exit();
    } else {
        $_SESSION['register_errors'] = ["Registration failed. Please try again."];
        header("Location: register.php");
        exit();
    }
}

// Display registration form if not POST request
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register | StudyPulse</title>
    <style>
        /* Your existing CSS styles */
        .error {
            color: #ff3860;
            font-size: 12px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container" id="container">
        <!-- Sign Up Form -->
        <div class="form-container sign-up">
            <form action="register.php" method="POST">
                <h1>Create Account</h1>
                <span>Register with your information</span>
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                
                <?php if (isset($_SESSION['register_errors'])): ?>
                    <?php foreach ($_SESSION['register_errors'] as $error): ?>
                        <p class="error"><?= htmlspecialchars($error) ?></p>
                    <?php endforeach; ?>
                    <?php unset($_SESSION['register_errors']); ?>
                <?php endif; ?>
                
                <input type="text" name="first_name" placeholder="First Name" required>
                <input type="text" name="last_name" placeholder="Last Name" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password (8+ chars with uppercase & number)" required minlength="8">
                <button type="submit">Sign Up</button>
            </form>
        </div>

        <!-- Toggle Panels (same as before) -->
    </div>

    <script>
        // Your existing JavaScript
    </script>
</body>
</html>
