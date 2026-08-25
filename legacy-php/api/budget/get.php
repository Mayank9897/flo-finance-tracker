<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

// Default to current month if not specified
$month = $_GET['month'] ?? date('Y-m');

$db = getDB();

// Get budget limits for this month
$stmt = $db->prepare(
    'SELECT category, limit_amount
     FROM budgets
     WHERE user_id = ? AND month = ?'
);
$stmt->bind_param('is', $userId, $month);
$stmt->execute();
$result  = $stmt->get_result();
$budgets = [];
while ($row = $result->fetch_assoc()) {
    $budgets[$row['category']] = (float)$row['limit_amount'];
}
$stmt->close();

// Get actual spending per category for this month
$monthStart = $month . '-01';
$monthEnd   = date('Y-m-t', strtotime($monthStart));

$stmt = $db->prepare(
    "SELECT category, SUM(amount) AS spent
     FROM transactions
     WHERE user_id = ? AND type = 'expense'
       AND date BETWEEN ? AND ?
     GROUP BY category"
);
$stmt->bind_param('iss', $userId, $monthStart, $monthEnd);
$stmt->execute();
$result = $stmt->get_result();
$spent  = [];
while ($row = $result->fetch_assoc()) {
    $spent[$row['category']] = (float)$row['spent'];
}
$stmt->close();
$db->close();

// Merge budgets with actual spending
$allCategories = array_unique(array_merge(array_keys($budgets), array_keys($spent)));
$data = [];
foreach ($allCategories as $cat) {
    $limit   = $budgets[$cat] ?? 0;
    $spentAmt = $spent[$cat]  ?? 0;
    $percent = $limit > 0 ? min(round(($spentAmt / $limit) * 100), 100) : 0;
    $data[]  = [
        'category' => $cat,
        'limit'    => $limit,
        'spent'    => $spentAmt,
        'percent'  => $percent,
        'over'     => $spentAmt > $limit && $limit > 0
    ];
}

// Sort by percent descending
usort($data, fn($a, $b) => $b['percent'] <=> $a['percent']);

jsonResponse(['success' => true, 'month' => $month, 'budgets' => $data]);
?>
