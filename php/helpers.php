<?php
// Shared helper functions for the Media Stars PHP API.

const DATA_FILE = __DIR__ . '/../data/media.json';
const ALLOWED_TYPES = ['movie', 'tv', 'book'];

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function requireMethod(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        sendJson(['ok' => false, 'error' => 'Method not allowed'], 405);
    }
}

function readJsonBody(): array
{
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (!is_array($data)) {
        sendJson(['ok' => false, 'error' => 'Request body must be valid JSON'], 400);
    }

    return $data;
}

function ensureDataFileExists(): void
{
    $directory = dirname(DATA_FILE);

    if (!is_dir($directory)) {
        mkdir($directory, 0775, true);
    }

    if (!file_exists(DATA_FILE)) {
        file_put_contents(DATA_FILE, "[]", LOCK_EX);
    }
}

function getAllItems(): array
{
    ensureDataFileExists();

    $text = file_get_contents(DATA_FILE);
    $items = json_decode($text, true);

    if (!is_array($items)) {
        return [];
    }

    return $items;
}

function saveAllItems(array $items): void
{
    ensureDataFileExists();

    $json = json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

    if ($json === false) {
        sendJson(['ok' => false, 'error' => 'Could not encode data'], 500);
    }

    $tempFile = DATA_FILE . '.tmp';
    file_put_contents($tempFile, $json, LOCK_EX);
    rename($tempFile, DATA_FILE);
}

function getNextId(array $items): int
{
    $max = 0;

    foreach ($items as $item) {
        $id = (int) ($item['id'] ?? 0);
        if ($id > $max) {
            $max = $id;
        }
    }

    return $max + 1;
}

function cleanString(array $data, string $field, int $maxLength): string
{
    $value = trim((string) ($data[$field] ?? ''));

    if ($value === '') {
        sendJson(['ok' => false, 'error' => ucfirst($field) . ' is required'], 400);
    }

    if (mb_strlen($value) > $maxLength) {
        sendJson(['ok' => false, 'error' => ucfirst($field) . ' is too long'], 400);
    }

    return $value;
}

function cleanInt(array $data, string $field, int $min, int $max): int
{
    $value = filter_var($data[$field] ?? null, FILTER_VALIDATE_INT);

    if ($value === false || $value < $min || $value > $max) {
        sendJson(['ok' => false, 'error' => ucfirst($field) . " must be between $min and $max"], 400);
    }

    return $value;
}

function cleanType(array $data): string
{
    $type = (string) ($data['type'] ?? '');

    if (!in_array($type, ALLOWED_TYPES, true)) {
        sendJson(['ok' => false, 'error' => 'Invalid media type'], 400);
    }

    return $type;
}

function cleanImageUrl(array $data): string
{
    $url = trim((string) ($data['image_url'] ?? ''));

    if ($url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {
        sendJson(['ok' => false, 'error' => 'Image URL must be a valid URL'], 400);
    }

    $scheme = parse_url($url, PHP_URL_SCHEME);
    if ($scheme !== 'http' && $scheme !== 'https') {
        sendJson(['ok' => false, 'error' => 'Image URL must start with http:// or https://'], 400);
    }

    return $url;
}

function buildItemFromInput(array $data): array
{
    $type = cleanType($data);

    $item = [
        'id' => 0,
        'type' => $type,
        'title' => cleanString($data, 'title', 80),
        'year' => cleanInt($data, 'year', 1000, 2100),
        'genre' => cleanString($data, 'genre', 40),
        'ratings' => [cleanInt($data, 'rating', 1, 5)],
        'image_url' => cleanImageUrl($data),
        'created_at' => date('c')
    ];

    if ($type === 'movie') {
        $item['length'] = cleanInt($data, 'length', 1, 600);
    } elseif ($type === 'tv') {
        $item['seasons'] = cleanInt($data, 'seasons', 1, 100);
    } else {
        $item['pages'] = cleanInt($data, 'pages', 1, 10000);
    }

    return $item;
}
?>
