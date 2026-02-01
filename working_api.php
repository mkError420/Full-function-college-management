<?php
// Working API - No mod_rewrite needed
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Simple routing based on query parameter
$action = $_GET["action"] ?? "auth";

if ($action === "auth" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    // Simple authentication
    if ($data->username === "admin" && $data->password === "admin123") {
        echo json_encode([
            "success" => true,
            "token" => "working_token_" . time(),
            "user" => [
                "id" => 1,
                "username" => "admin",
                "email" => "admin@medicalcollege.edu",
                "role" => "admin",
                "details" => [
                    "first_name" => "Admin",
                    "last_name" => "User",
                    "department_name" => "Administration"
                ]
            ]
        ]);
    } elseif ($data->username === "faculty" && $data->password === "faculty123") {
        echo json_encode([
            "success" => true,
            "token" => "working_token_" . time(),
            "user" => [
                "id" => 2,
                "username" => "faculty",
                "email" => "faculty@medicalcollege.edu",
                "role" => "faculty",
                "details" => [
                    "first_name" => "Faculty",
                    "last_name" => "User",
                    "department_name" => "Medicine"
                ]
            ]
        ]);
    } elseif ($data->username === "student" && $data->password === "student123") {
        echo json_encode([
            "success" => true,
            "token" => "working_token_" . time(),
            "user" => [
                "id" => 3,
                "username" => "student",
                "email" => "student@medicalcollege.edu",
                "role" => "student",
                "details" => [
                    "first_name" => "Student",
                    "last_name" => "User",
                    "department_name" => "Medicine",
                    "semester" => 3
                ]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["message" => "API working - action: " . $action]);
}
?>