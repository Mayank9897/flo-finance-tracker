<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$id   = (int)($data['id'] ?? 0);

if (!$id) {
    jsonResponse(['error' => 'Transaction ID is required'], 400);
}

$db = getDB();

// Make sure the transaction belongs to this user
$stmt = $db->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    jsonResponse(['success' => true, 'message' => 'Transaction deleted']);
} else {
    jsonResponse(['error' => 'Transaction not found or access denied'], 404);
}

$stmt->close();
$db->close();
?>
