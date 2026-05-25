<?php
header('Content-Type: application/json');

require_once 'helpers.php';

$body = file_get_contents('php://input');
$data = json_decode($body, true);

$id = (int) ($data['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Invalid id']);
    exit;
}

$items = getAllItems();
$newList = [];
$found = false;

foreach ($items as $item) {
    if ($item['id'] === $id) {
        $found = true;
    } else {
        $newList[] = $item;
    }
}

if (!$found) {
    echo json_encode(['ok' => false, 'error' => 'Item not found']);
    exit;
}

saveAllItems($newList);
echo json_encode(['ok' => true]);

?>
