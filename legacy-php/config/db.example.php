<?php
// ─── Database Configuration ───────────────────
// Copy this file to db.php and fill in your credentials

define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // your DB username
define('DB_PASS', '');           // your DB password
define('DB_NAME', 'flo_tracker');

function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}
?>
