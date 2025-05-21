<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');

// Create connection with error handling
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4 for full Unicode support
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    // Log error (in production, log to file instead of outputting)
    error_log($e->getMessage());
    
    // Show user-friendly message
    die("We're experiencing technical difficulties. Please try again later.");
}

// Function to close connection (optional)
function close_db() {
    global $conn;
    if (isset($conn)) {
        $conn->close();
    }
}

// Register shutdown function to ensure connection closes
register_shutdown_function('close_db');
