<?php
// Comprehensive Diagnostic Tool
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><title>System Diagnosis</head><body>";
echo "<h1>🔍 Medical College System Diagnosis</h1>";

// Test 1: XAMPP Services
echo "<h2>1. XAMPP Services Check</h2>";
$apache_running = false;
$mysql_running = false;

// Check Apache
if ($socket = @fsockopen('localhost', 80, $errno, $errstr, 1)) {
    fclose($socket);
    $apache_running = true;
    echo "<p style='color: green;'>✅ Apache is running (Port 80)</p>";
} else {
    echo "<p style='color: red;'>❌ Apache is not running or not accessible</p>";
}

// Check MySQL
if ($socket = @fsockopen('localhost', 3306, $errno, $errstr, 1)) {
    fclose($socket);
    $mysql_running = true;
    echo "<p style='color: green;'>✅ MySQL is running (Port 3306)</p>";
} else {
    echo "<p style='color: red;'>❌ MySQL is not running or not accessible</p>";
}

// Test 2: Database Connection
echo "<h2>2. Database Connection</h2>";
if ($mysql_running) {
    try {
        $conn = new PDO("mysql:host=localhost", "root", "");
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "<p style='color: green;'>✅ MySQL connection successful</p>";
        
        // Check if database exists
        $stmt = $conn->query("SHOW DATABASES LIKE 'medical_college_db'");
        if ($stmt->rowCount() > 0) {
            echo "<p style='color: green;'>✅ Database 'medical_college_db' exists</p>";
            
            // Connect to the specific database
            $conn = new PDO("mysql:host=localhost;dbname=medical_college_db", "root", "");
            
            // Check tables
            $stmt = $conn->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "<p style='color: blue;'>📊 Found " . count($tables) . " tables</p>";
            
            // Check users table
            if (in_array('users', $tables)) {
                $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
                $user_count = $stmt->fetch()['count'];
                echo "<p style='color: blue;'>👥 Users table has $user_count records</p>";
                
                // Check admin user
                $stmt = $conn->query("SELECT username, role FROM users WHERE role = 'admin'");
                $admin = $stmt->fetch();
                if ($admin) {
                    echo "<p style='color: green;'>✅ Admin user found: " . htmlspecialchars($admin['username']) . "</p>";
                } else {
                    echo "<p style='color: orange;'>⚠️ No admin user found</p>";
                }
            } else {
                echo "<p style='color: red;'>❌ Users table not found</p>";
            }
        } else {
            echo "<p style='color: red;'>❌ Database 'medical_college_db' does not exist</p>";
        }
    } catch (PDOException $e) {
        echo "<p style='color: red;'>❌ Database connection failed: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Cannot test database - MySQL not running</p>";
}

// Test 3: API Endpoint
echo "<h2>3. API Endpoint Test</h2>";
if ($apache_running) {
    // Test main API
    $api_response = @file_get_contents('http://localhost/api');
    if ($api_response !== false) {
        echo "<p style='color: green;'>✅ Main API endpoint responding</p>";
        echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 4px;'>" . htmlspecialchars($api_response) . "</pre>";
    } else {
        echo "<p style='color: red;'>❌ Main API endpoint not responding</p>";
    }
    
    // Test auth endpoint
    $auth_data = json_encode(['username' => 'admin', 'password' => 'admin123']);
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => $auth_data
        ]
    ]);
    
    $auth_response = @file_get_contents('http://localhost/api/auth', false, $context);
    if ($auth_response !== false) {
        echo "<p style='color: green;'>✅ Auth API endpoint responding</p>";
        $auth_data = json_decode($auth_response, true);
        if ($auth_data && isset($auth_data['success'])) {
            if ($auth_data['success']) {
                echo "<p style='color: green;'>✅ Login test successful!</p>";
            } else {
                echo "<p style='color: orange;'>⚠️ Login test failed: " . ($auth_data['message'] ?? 'Unknown error') . "</p>";
            }
        } else {
            echo "<p style='color: orange;'>⚠️ Invalid API response format</p>";
        }
        echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 4px;'>" . htmlspecialchars($auth_response) . "</pre>";
    } else {
        echo "<p style='color: red;'>❌ Auth API endpoint not responding</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Cannot test API - Apache not running</p>";
}

// Test 4: File Permissions
echo "<h2>4. File Permissions</h2>";
$files_to_check = [
    'api/config/database.php' => 'Database Config',
    'api/index.php' => 'API Router',
    'database/schema.sql' => 'Database Schema'
];

foreach ($files_to_check as $file => $description) {
    if (file_exists(__DIR__ . '/' . $file)) {
        if (is_readable(__DIR__ . '/' . $file)) {
            echo "<p style='color: green;'>✅ $description is readable</p>";
        } else {
            echo "<p style='color: red;'>❌ $description is not readable</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ $description not found</p>";
    }
}

// Recommendations
echo "<h2>🔧 Recommendations</h2>";
echo "<div style='background: #f0f8ff; padding: 15px; border-radius: 5px; border-left: 4px solid #0066cc;'>";

if (!$apache_running) {
    echo "<p><strong>1. Start Apache:</strong> Open XAMPP Control Panel and start Apache service</p>";
}
if (!$mysql_running) {
    echo "<p><strong>2. Start MySQL:</strong> Open XAMPP Control Panel and start MySQL service</p>";
}
if ($apache_running && $mysql_running) {
    echo "<p><strong>1. Run Database Setup:</strong> <a href='setup_database.php'>Click here to setup database</a></p>";
    echo "<p><strong>2. Test API:</strong> <a href='api/test.php'>Click here to test API</a></p>";
}
echo "<p><strong>3. Clear Browser Cache:</strong> Press Ctrl+F5 and try login again</p>";
echo "<p><strong>4. Check Console:</strong> Open browser F12 and check for JavaScript errors</p>";

echo "</div>";

echo "<hr>";
echo "<p><small>After fixing issues, delete diagnose.php for security.</small></p>";
echo "</body></html>";
?>
