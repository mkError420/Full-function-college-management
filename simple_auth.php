<?php
// Simple authentication test
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    if ($data->username === "admin" && $data->password === "admin123") {
        echo json_encode([
            "success" => true,
            "token" => "test_token",
            "user" => [
                "id" => 1,
                "username" => "admin",
                "email" => "admin@medicalcollege.edu",
                "role" => "admin",
                "details" => [
                    "first_name" => "Admin",
                    "last_name" => "User"
                ]
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials"
        ]);
    }
} else {
    echo json_encode(["message" => "POST only"]);
}
?>
