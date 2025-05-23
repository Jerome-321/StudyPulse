<?php
session_start();
require_once 'db.php';
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}
require_once 'db.php'; // Your database connection

// Handle password change POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_password') {
    $userId = $_SESSION['user_id'];
    $current = $_POST['currentpass'] ?? '';
    $new = $_POST['newpass'] ?? '';
    $confirm = $_POST['confirmpass'] ?? '';

    // Get current password hash from database
    $stmt = $conn->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->bind_result($hashedPassword);
    $stmt->fetch();
    $stmt->close();

    if (!$hashedPassword || !password_verify($current, $hashedPassword)) {
        $error = "Current password is incorrect.";
    } elseif ($new !== $confirm) {
        $error = "Passwords do not match.";
    } elseif (!preg_match('/^(?=.*\d)(?=.*[\W_]).{8,}$/', $new)) {
        $error = "Password must be at least 8 characters, include a number and a special character.";
    } else {
        $newHash = password_hash($new, PASSWORD_DEFAULT);
        $stmt = $conn->prepare('UPDATE users SET password=? WHERE id=?');
        $stmt->bind_param('si', $newHash, $userId);
        $stmt->execute();
        $stmt->close();
        $success = "Password changed!";
    }
}
    // Fetch hashed password from DB
    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($current, $row['password'])) {
        $error = "Current password is incorrect.";
    } elseif ($new !== $confirm) {
        $error = "Passwords do not match.";
    } elseif (!preg_match('/^(?=.*\d)(?=.*[\W_]).{8,}$/', $new)) {
        $error = "Password must be at least 8 characters, include a number and a special character.";
    } else {
        $newHash = password_hash($new, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->execute([$newHash, $userId]);
        $success = "Password changed!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Settings</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <!-- Your header code -->
</header>

<main>
    <h2>Account Settings</h2>
    <section>
        <form id="profileForm">
            <label>First Name: <input type="text" id="firstName" required></label>
            <label>Last Name: <input type="text" id="lastName" required></label>
            <label>Date of Birth: <input type="date" id="dob"></label>
            <label>Contact Number: <input type="tel" id="contact"></label>
            <label>Email: <input type="email" id="email" required></label>
            <label>Course:
                <select id="course">
                    <option value="">Select Course</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                </select>
            </label>
            <label>Address: <input type="text" id="address"></label>
            <button type="submit">Save Profile Changes</button>
        </form>
    </section>

    <section>
        <form method="POST" id="passwordForm" autocomplete="off">
            <input type="hidden" name="action" value="change_password">
            <label>Current Password: <input type="password" name="currentpass" required></label>
            <label>New Password: <input type="password" name="newpass" id="newpass" required></label>
            <label>Confirm Password: <input type="password" name="confirmpass" required></label>
            <small>Password: min 8 chars, 1 number, 1 special char.</small>
            <button type="submit">Change Password</button>
        </form>
        <?php if (!empty($error)) echo "<p style='color:red;'>$error</p>"; ?>
        <?php if (!empty($success)) echo "<p style='color:green;'>$success</p>"; ?>
    </section>
</main>

<script>
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // For demo: localStorage, in production use AJAX to send to the server
    ['firstName','lastName','dob','contact','email','course','address'].forEach(function(id){
        localStorage.setItem('user_'+id, document.getElementById(id).value);
    });
    alert('Profile saved (demo only, implement backend for real persistence)');
});

// Password strength check (client-side, for feedback only)
document.getElementById('newpass').addEventListener('input', function() {
    const val = this.value;
    if (!/^(?=.*\d)(?=.*[\W_]).{8,}$/.test(val)) {
        this.setCustomValidity("Min 8 chars, 1 number, 1 special char.");
    } else {
        this.setCustomValidity("");
    }
});
</script>
</body>
</html>