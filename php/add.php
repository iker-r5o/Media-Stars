<?php
header('Content-Type: application/json');

require_once 'helpers.php';

// get json from the request body
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if ($data === null) {
    echo json_encode(['ok' => false, 'error' => 'Bad data']);
    exit;
}

$type = $data['type'] ?? '';
$title = trim($data['title'] ?? '');
$year = $data['year'] ?? '';
$genre = trim($data['genre'] ?? '');
$rating = $data['rating'] ?? '';
$poster = trim($data['poster'] ?? '');

// basic server side check
if ($title === '' || $genre === '' || $poster === '') {
    echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
    exit;
}

if ($type !== 'movie' && $type !== 'tv' && $type !== 'song') {
    echo json_encode(['ok' => false, 'error' => 'Invalid type']);
    exit;
}

$newItem = [
    'id' => 0,
    'type' => $type,
    'title' => $title,
    'year' => (int) $year,
    'genre' => $genre,
    'rating' => (int) $rating,
    'poster' => $poster
];

if ($type === 'movie' || $type === 'song') {
    $newItem['length'] = (int) ($data['length'] ?? 0);
}

if ($type === 'tv') {
    $newItem['seasons'] = (int) ($data['seasons'] ?? 0);
}

$items = getAllItems();
$newItem['id'] = getNextId($items);
$items[] = $newItem;
saveAllItems($items);

echo json_encode(['ok' => true, 'item' => $newItem]);

?>
