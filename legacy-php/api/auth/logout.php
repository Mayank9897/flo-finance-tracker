<?php
require_once '../../config/auth.php';

corsHeaders();
header('Content-Type: application/json');

session_destroy();

jsonResponse(['success' => true, 'message' => 'Logged out']);
?>
