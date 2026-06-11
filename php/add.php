<?php
require_once 'helpers.php';

requireMethod('POST');
$data = readJsonBody();
$newItem = buildItemFromInput($data);

$items = getAllItems();
$newItem['id'] = getNextId($items);
$items[] = $newItem;

saveAllItems($items);
sendJson(['ok' => true, 'item' => $newItem], 201);
?>
