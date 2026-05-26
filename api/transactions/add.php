<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data        = json_decode(file_get_contents('php://input'), true);
$type        = trim($data['type']        ?? '');
$category    = trim($data['category']    ?? '');
$amount      = floatval($data['amount']  ?? 0);
$date        = trim($data['date']        ?? '');
$description = trim($data['description'] ?? 'No description');

// Validation
if (!in_array($type, ['income', 'expense'])) {
    jsonResponse(['error' => 'Type must be income or expense'], 400);
}
if (!$category) {
    jsonResponse(['error' => 'Category is required'], 400);
}
if ($amount <= 0) {
    jsonResponse(['error' => 'Amount must be greater than 0'], 400);
}
if (!$date || !strtotime($date)) {
    jsonResponse(['error' => 'Valid date is required'], 400);
}

$db   = getDB();
$stmt = $db->prepare(
    'INSERT INTO transactions (user_id, type, category, amount, date, description)
     VALUES (?, ?, ?, ?, ?, ?)'
);
$stmt->bind_param('issdss', $userId, $type, $category, $amount, $date, $description);

if ($stmt->execute()) {
    $newId = $db->insert_id;
    jsonResponse([
        'success'     => true,
        'transaction' => [
            'id'          => $newId,
            'type'        => $type,
            'category'    => $category,
            'amount'      => $amount,
            'date'        => $date,
            'description' => $description
        ]
    ], 201);
} else {
    jsonResponse(['error' => 'Failed to add transaction'], 500);
}

$stmt->close();
$db->close();
?>
