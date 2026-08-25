<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$name     = trim($data['name']     ?? '');
$email    = trim($data['email']    ?? '');
$password = trim($data['password'] ?? '');

// Validation
if (!$name || !$email || !$password) {
    jsonResponse(['error' => 'Name, email and password are required'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Invalid email address'], 400);
}
if (strlen($password) < 6) {
    jsonResponse(['error' => 'Password must be at least 6 characters'], 400);
}

$db = getDB();

// Check if email already exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    jsonResponse(['error' => 'Email already registered'], 409);
}
$stmt->close();

// Insert user
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $email, $hash);

if ($stmt->execute()) {
    $userId = $db->insert_id;
    $_SESSION['user_id']   = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email']= $email;

    jsonResponse([
        'success' => true,
        'user'    => ['id' => $userId, 'name' => $name, 'email' => $email]
    ], 201);
} else {
    jsonResponse(['error' => 'Registration failed'], 500);
}

$stmt->close();
$db->close();
?>
