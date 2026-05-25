<?php
// small helper file for reading and writing our json file

$dataFile = __DIR__ . '/../data/media.json';

function getAllItems() {
    global $dataFile;

    if (!file_exists($dataFile)) {
        return [];
    }

    $text = file_get_contents($dataFile);
    $items = json_decode($text, true);

    if ($items === null) {
        return [];
    }

    return $items;
}

function saveAllItems($items) {
    global $dataFile;

    $json = json_encode($items, JSON_PRETTY_PRINT);
    file_put_contents($dataFile, $json);
}

function getNextId($items) {
    $max = 0;
    foreach ($items as $item) {
        if ($item['id'] > $max) {
            $max = $item['id'];
        }
    }
    return $max + 1;
}

?>
