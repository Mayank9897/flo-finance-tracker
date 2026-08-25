<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

$userId = requireAuth();

$db = getDB();

// Optional filters from query string
$type   = $_GET['type']   ?? 'all';   // all | income | expense
$search = $_GET['search'] ?? '';
$limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;

$sql    = 'SELECT id, type, category, amount, date, description, created_at
           FROM transactions
           WHERE user_id = ?';
$params = [$userId];
$types  = 'i';

if ($type !== 'all') {
    $sql     .= ' AND type = ?';
    $params[] = $type;
    $types   .= 's';
}

if ($search) {
    $like     = '%' . $search . '%';
    $sql     .= ' AND (category LIKE ? OR description LIKE ?)';
    $params[] = $like;
    $params[] = $like;
    $types   .= 'ss';
}

$sql .= ' ORDER BY date DESC, created_at DESC';

if ($limit > 0) {
    $sql .= ' LIMIT ' . $limit;
}

$stmt = $db->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$transactions = [];
while ($row = $result->fetch_assoc()) {
    $row['amount'] = (float)$row['amount'];
    $transactions[] = $row;
}

$stmt->close();
$db->close();

jsonResponse(['success' => true, 'transactions' => $transactions]);
?>
