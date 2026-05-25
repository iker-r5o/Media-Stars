<?php
header('Content-Type: application/json');

require_once 'helpers.php';

$items = getAllItems();
echo json_encode($items);

?>
