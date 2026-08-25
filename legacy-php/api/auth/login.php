<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email']    ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {
    jsonResponse(['error' => 'Email and password are required'], 400);
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();
$db->close();

if (!$user || !password_verify($password, $user['password'])) {
    jsonResponse(['error' => 'Invalid email or password'], 401);
}

$_SESSION['user_id']    = $user['id'];
$_SESSION['user_name']  = $user['name'];
$_SESSION['user_email'] = $user['email'];

jsonResponse([
    'success' => true,
    'user'    => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email']
    ]
]);
?>
