<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

$db = getDB();

// Monthly income vs expenses (last 12 months)
$stmt = $db->prepare(
    "SELECT
        DATE_FORMAT(date, '%b %y') AS month_label,
        DATE_FORMAT(date, '%Y-%m') AS month_key,
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY month_key, month_label
     ORDER BY month_key ASC"
);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$months = [];
while ($row = $result->fetch_assoc()) {
    $months[] = [
        'label'   => $row['month_label'],
        'income'  => (float)$row['income'],
        'expense' => (float)$row['expense']
    ];
}
$stmt->close();

// Cumulative trend (all time, sorted by date)
$stmt = $db->prepare(
    "SELECT date, type, amount
     FROM transactions
     WHERE user_id = ?
     ORDER BY date ASC, created_at ASC"
);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$trend       = [];
$cumIncome   = 0;
$cumExpense  = 0;

while ($row = $result->fetch_assoc()) {
    if ($row['type'] === 'income') $cumIncome  += (float)$row['amount'];
    else                           $cumExpense += (float)$row['amount'];

    $trend[] = [
        'date'        => $row['date'],
        'cum_income'  => $cumIncome,
        'cum_expense' => $cumExpense
    ];
}
$stmt->close();
$db->close();

jsonResponse([
    'success' => true,
    'monthly' => $months,
    'trend'   => $trend
]);
?>
