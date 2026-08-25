<?php
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    jsonResponse(['loggedIn' => false]);
}

jsonResponse([
    'loggedIn' => true,
    'user' => [
        'id'    => $_SESSION['user_id'],
        'name'  => $_SESSION['user_name'],
        'email' => $_SESSION['user_email']
    ]
]);
?>
