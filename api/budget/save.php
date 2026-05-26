<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data     = json_decode(file_get_contents('php://input'), true);
$category = trim($data['category']     ?? '');
$limit    = floatval($data['limit']    ?? 0);
$month    = trim($data['month']        ?? date('Y-m'));

if (!$category) {
    jsonResponse(['error' => 'Category is required'], 400);
}
if ($limit < 0) {
    jsonResponse(['error' => 'Limit must be 0 or greater'], 400);
}

$db = getDB();

// INSERT or UPDATE (upsert)
$stmt = $db->prepare(
    'INSERT INTO budgets (user_id, category, limit_amount, month)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount)'
);
$stmt->bind_param('isds', $userId, $category, $limit, $month);

if ($stmt->execute()) {
    jsonResponse([
        'success'  => true,
        'category' => $category,
        'limit'    => $limit,
        'month'    => $month
    ]);
} else {
    jsonResponse(['error' => 'Failed to save budget'], 500);
}

$stmt->close();
$db->close();
?>
