<?php
require_once 'helpers.php';

requireMethod('POST');
$data = readJsonBody();
$id = cleanInt($data, 'id', 1, PHP_INT_MAX);
$rating = cleanInt($data, 'rating', 1, 5);

$items = getAllItems();
$updatedItem = null;

foreach ($items as $index => $item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        if (!isset($items[$index]['ratings']) || !is_array($items[$index]['ratings'])) {
            $items[$index]['ratings'] = [];
        }

        $items[$index]['ratings'][] = $rating;
        $updatedItem = $items[$index];
        break;
    }
}

if ($updatedItem === null) {
    sendJson(['ok' => false, 'error' => 'Item not found'], 404);
}

saveAllItems($items);
sendJson(['ok' => true, 'item' => $updatedItem]);
?>
