<?php
// Quick Fix Script - One-click solution
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🚀 Quick Fix - Medical College System</h1>";

// Step 1: Create database and import schema
echo "<h2>Step 1: Database Setup</h2>";

try {
    // Connect to MySQL
    $conn = new PDO("mysql:host=localhost", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color: green;'>✅ Connected to MySQL</p>";
    
    // Create database
    $conn->exec("DROP DATABASE IF EXISTS medical_college_db");
    $conn->exec("CREATE DATABASE medical_college_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p style='color: green;'>✅ Database created fresh</p>";
    
    // Use database
    $conn->exec("USE medical_college_db");
    
    // Create tables manually (simplified version)
    $tables = [
        "CREATE TABLE users (
            user_id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'faculty', 'student') NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE departments (
            department_id INT PRIMARY KEY AUTO_INCREMENT,
            department_name VARCHAR(100) NOT NULL,
            department_code VARCHAR(20) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE faculty (
            faculty_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT UNIQUE NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            department_id INT NOT NULL,
            designation VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (department_id) REFERENCES departments(department_id)
        )",
        
        "CREATE TABLE students (
            student_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT UNIQUE NOT NULL,
            roll_number VARCHAR(20) UNIQUE NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            department_id INT NOT NULL,
            semester INT NOT NULL DEFAULT 1,
            status ENUM('active', 'graduated', 'suspended', 'withdrawn') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (department_id) REFERENCES departments(department_id)
        )",
        
        "CREATE TABLE subjects (
            subject_id INT PRIMARY KEY AUTO_INCREMENT,
            subject_name VARCHAR(100) NOT NULL,
            subject_code VARCHAR(20) UNIQUE NOT NULL,
            department_id INT NOT NULL,
            credit_hours INT NOT NULL DEFAULT 1,
            semester INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(department_id)
        )",
        
        "CREATE TABLE attendance (
            attendance_id INT PRIMARY KEY AUTO_INCREMENT,
            student_id INT NOT NULL,
            subject_id INT NOT NULL,
            date DATE NOT NULL,
            status ENUM('present', 'absent', 'late') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
        )",
        
        "CREATE TABLE marks (
            mark_id INT PRIMARY KEY AUTO_INCREMENT,
            student_id INT NOT NULL,
            subject_id INT NOT NULL,
            exam_type ENUM('quiz', 'assignment', 'mid_term', 'final') NOT NULL,
            max_marks DECIMAL(5,2) NOT NULL,
            obtained_marks DECIMAL(5,2) NOT NULL,
            exam_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
        )"
    ];
    
    foreach ($tables as $sql) {
        $conn->exec($sql);
    }
    echo "<p style='color: green;'>✅ All tables created</p>";
    
    // Insert sample data
    $conn->exec("INSERT INTO departments (department_name, department_code, description) VALUES 
                 ('Medicine', 'MED', 'Department of General Medicine'),
                 ('Surgery', 'SURG', 'Department of General Surgery')");
    
    $conn->exec("INSERT INTO users (username, email, password_hash, role) VALUES 
                 ('admin', 'admin@medicalcollege.edu', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')");
    
    $conn->exec("INSERT INTO users (username, email, password_hash, role) VALUES 
                 ('faculty', 'faculty@medicalcollege.edu', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty')");
    
    $conn->exec("INSERT INTO users (username, email, password_hash, role) VALUES 
                 ('student', 'student@medicalcollege.edu', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student')");
    
    echo "<p style='color: green;'>✅ Sample data inserted</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database Error: " . $e->getMessage() . "</p>";
}

// Step 2: Fix API routing
echo "<h2>Step 2: API Routing Fix</h2>";

// Create a simple API router that doesn't need mod_rewrite
$api_content = '<?php
// Simple API Router - No mod_rewrite required
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Get the request path
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$path = str_replace("/api", "", $path);
$segments = explode("/", trim($path, "/"));

$endpoint = $segments[0] ?? "";

// Simple auth endpoint
if ($endpoint === "auth" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    if ($data->username === "admin" && $data->password === "admin123") {
        echo json_encode([
            "success" => true,
            "token" => "simple_token_123",
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
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["message" => "API endpoint: " . $endpoint]);
}
?>';

file_put_contents(__DIR__ . '/api/simple.php', $api_content);
echo "<p style='color: green;'>✅ Created simple API router</p>";

// Step 3: Create test page
echo "<h2>Step 3: Create Test Page</h2>";

$test_page = '<!DOCTYPE html>
<html>
<head>
    <title>Login Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; }
        input, button { padding: 10px; margin: 5px 0; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        .result { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Login Test</h1>
    
    <form id="loginForm">
        <div class="form-group">
            <label>Username:</label>
            <input type="text" id="username" value="admin" required>
        </div>
        <div class="form-group">
            <label>Password:</label>
            <input type="password" id="password" value="admin123" required>
        </div>
        <button type="submit">Test Login</button>
    </form>
    
    <div id="result" class="result">Click "Test Login" to test the API</div>
    
    <script>
        document.getElementById("loginForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const resultDiv = document.getElementById("result");
            
            resultDiv.innerHTML = "Testing...";
            
            try {
                const response = await fetch("/api/simple.php/auth", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = `
                        <h3 style="color: green;">✅ Login Successful!</h3>
                        <p><strong>User:</strong> ${data.user.username}</p>
                        <p><strong>Role:</strong> ${data.user.role}</p>
                        <p><strong>Email:</strong> ${data.user.email}</p>
                        <p><a href="/frontend" target="_blank">🚀 Go to Application</a></p>
                    `;
                } else {
                    resultDiv.innerHTML = `<h3 style="color: red;">❌ Login Failed</h3><p>${data.message}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<h3 style="color: red;">❌ Error</h3><p>${error.message}</p>`;
            }
        });
    </script>
</body>
</html>';

file_put_contents(__DIR__ . '/login_test.html', $test_page);
echo "<p style='color: green;'>✅ Created login test page</p>";

echo "<h2>🎯 Next Steps</h2>";
echo "<div style='background: #e8f5e8; padding: 20px; border-radius: 5px;'>";
echo "<p><strong>1. Test Login:</strong> <a href='login_test.html' target='_blank'>Click here to test login</a></p>";
echo "<p><strong>2. If test works:</strong> The issue is with the main API routing</p>";
echo "<p><strong>3. Default Credentials:</strong> admin / admin123</p>";
echo "</div>";

echo "<p><small>After testing, you can delete quick_fix.php for security</small></p>";
?>
