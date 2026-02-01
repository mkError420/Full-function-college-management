<?php
// Working Authentication API
error_reporting(0); // Hide errors
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

// Get and decode JSON data
$json_input = file_get_contents("php://input");
if ($json_input === false) {
    echo json_encode(["success" => false, "message" => "No input data"]);
    exit();
}

$data = json_decode($json_input);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit();
}

// Validate input
if (!isset($data->username) || !isset($data->password)) {
    echo json_encode(["success" => false, "message" => "Username and password required"]);
    exit();
}

// Simple authentication logic
$username = $data->username;
$password = $data->password;

// Valid credentials
$valid_users = [
    "admin" => [
        "password" => "admin123",
        "id" => 1,
        "email" => "admin@medicalcollege.edu",
        "role" => "admin",
        "first_name" => "Admin",
        "last_name" => "User",
        "department_name" => "Administration"
    ],
    "faculty" => [
        "password" => "faculty123",
        "id" => 2,
        "email" => "faculty@medicalcollege.edu",
        "role" => "faculty",
        "first_name" => "Faculty",
        "last_name" => "User",
        "department_name" => "Medicine"
    ],
    "student" => [
        "password" => "student123",
        "id" => 3,
        "email" => "student@medicalcollege.edu",
        "role" => "student",
        "first_name" => "Student",
        "last_name" => "User",
        "department_name" => "Medicine",
        "semester" => 3
    ]
];

if (isset($valid_users[$username]) && $valid_users[$username]["password"] === $password) {
    $user = $valid_users[$username];
    echo json_encode([
        "success" => true,
        "token" => "working_token_" . time() . "_" . $user["id"],
        "user" => [
            "id" => $user["id"],
            "username" => $username,
            "email" => $user["email"],
            "role" => $user["role"],
            "details" => [
                "first_name" => $user["first_name"],
                "last_name" => $user["last_name"],
                "department_name" => $user["department_name"]
            ]
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password"
    ]);
}
?>
