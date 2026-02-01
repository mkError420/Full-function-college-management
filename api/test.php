<?php
// Test API connection and database

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>API Connection Test</h1>";

// Test database connection
try {
    require_once 'config/database.php';
    $database = new Database();
    $conn = $database->connect();
    
    if ($conn) {
        echo "<p style='color: green;'>✅ Database connection successful!</p>";
        
        // Test if users table exists and has data
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        
        echo "<p>📊 Users in database: " . $result['count'] . "</p>";
        
        // Show admin user if exists
        $stmt = $conn->query("SELECT username, email, role FROM users WHERE role = 'admin'");
        $admin = $stmt->fetch();
        
        if ($admin) {
            echo "<p>👤 Admin user found: " . $admin['username'] . " (" . $admin['email'] . ")</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ No admin user found</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Database connection failed</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test API endpoint
echo "<h2>API Endpoint Test</h2>";
$api_url = 'http://localhost/api';
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json'
    ]
]);

$response = file_get_contents($api_url, false, $context);
if ($response) {
    echo "<p style='color: green;'>✅ API endpoint responding</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ API endpoint not responding</p>";
}

echo "<h2>Next Steps</h2>";
echo "<ul>";
echo "<li>If database connection fails, check XAMPP services</li>";
echo "<li>If no admin user found, import the schema.sql file</li>";
echo "<li>If API fails, check .htaccess and Apache configuration</li>";
echo "</ul>";
?>
