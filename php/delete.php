<?php
require_once 'helpers.php';

requireMethod('POST');
$data = readJsonBody();
$id = cleanInt($data, 'id', 1, PHP_INT_MAX);

$items = getAllItems();
$updatedItems = [];
$found = false;

foreach ($items as $item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $found = true;
        continue;
    }

    $updatedItems[] = $item;
}

if (!$found) {
    sendJson(['ok' => false, 'error' => 'Item not found'], 404);
}

saveAllItems($updatedItems);
sendJson(['ok' => true]);
?>
