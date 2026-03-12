<?php
/**
 * Image Upload API for ZeroTrace Blog Editor
 * 
 * This file must be manually uploaded to /public_html/upload-image.php on the cPanel server.
 * It is NOT part of the Vite build output.
 * 
 * Accepts POST requests with multipart/form-data containing an 'image' field.
 * Validates file type and size, generates a unique filename, and stores the file
 * in /public_html/uploads/blog-images/.
 */

header('Content-Type: application/json');

// CORS headers — adjust origin as needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configuration
$uploadDir = __DIR__ . '/uploads/blog-images/';
$baseUrl = 'https://zerotrace.in/uploads/blog-images/';
$maxFileSize = 5 * 1024 * 1024; // 5 MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Ensure upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Validate file presence
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = isset($_FILES['image']) ? $_FILES['image']['error'] : 'missing';
    http_response_code(400);
    echo json_encode(['error' => 'No valid image file received', 'code' => $errorCode]);
    exit;
}

$file = $_FILES['image'];

// Validate file size
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Maximum size is 5MB.']);
    exit;
}

// Validate MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP.']);
    exit;
}

// Validate extension
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file extension.']);
    exit;
}

// Generate unique filename
$uniqueName = time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
$destination = $uploadDir . $uniqueName;

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode([
        'url' => $baseUrl . $uniqueName,
        'filename' => $uniqueName,
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file.']);
}
