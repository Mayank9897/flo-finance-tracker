<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

$db = getDB();

// Total income, expenses, balance
$stmt = $db->prepare(
    "SELECT
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
        SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS balance
     FROM transactions
     WHERE user_id = ?"
);
$stmt->bind_param('i', $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Category breakdown (expenses only)
$stmt = $db->prepare(
    "SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = ? AND type = 'expense'
     GROUP BY category
     ORDER BY total DESC"
);
$stmt->bind_param('i', $userId);
$stmt->execute();
$catResult  = $stmt->get_result();
$categories = [];
while ($cat = $catResult->fetch_assoc()) {
    $categories[] = [
        'category' => $cat['category'],
        'total'    => (float)$cat['total']
    ];
}
$stmt->close();
$db->close();

jsonResponse([
    'success'            => true,
    'total_income'       => (float)($row['total_income']   ?? 0),
    'total_expenses'     => (float)($row['total_expenses'] ?? 0),
    'balance'            => (float)($row['balance']        ?? 0),
    'category_breakdown' => $categories
]);
?>
