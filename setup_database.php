<?php
// Database Setup Script
// Run this file to create the database and import schema

echo "<h1>Medical College Database Setup</h1>";

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$db_name = 'medical_college_db';

try {
    // Connect to MySQL (without selecting database)
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ Connected to MySQL server</p>";
    
    // Create database if not exists
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p style='color: green;'>✅ Database '$db_name' created/verified</p>";
    
    // Select the database
    $conn->exec("USE `$db_name`");
    
    // Read and execute schema file
    $schema_file = __DIR__ . '/database/schema.sql';
    if (file_exists($schema_file)) {
        $schema = file_get_contents($schema_file);
        
        // Split SQL statements by semicolon and execute each
        $statements = array_filter(array_map('trim', explode(';', $schema)));
        
        foreach ($statements as $statement) {
            if (!empty($statement) && !preg_match('/^--/', $statement)) {
                try {
                    $conn->exec($statement);
                } catch (PDOException $e) {
                    echo "<p style='color: orange;'>⚠️ Warning: " . $e->getMessage() . "</p>";
                }
            }
        }
        
        echo "<p style='color: green;'>✅ Schema imported successfully</p>";
        
        // Verify admin user exists
        $stmt = $conn->query("SELECT username, email, role FROM users WHERE role = 'admin'");
        $admin = $stmt->fetch();
        
        if ($admin) {
            echo "<p style='color: green;'>✅ Admin user found: " . htmlspecialchars($admin['username']) . "</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ No admin user found, creating one...</p>";
            
            // Create admin user
            $conn->exec("INSERT INTO users (username, email, password_hash, role) VALUES 
                         ('admin', 'admin@medicalcollege.edu', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')");
            echo "<p style='color: green;'>✅ Admin user created (username: admin, password: admin123)</p>";
        }
        
        // Show table count
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "<p style='color: blue;'>📊 Created " . count($tables) . " tables: " . implode(', ', $tables) . "</p>";
        
    } else {
        echo "<p style='color: red;'>❌ Schema file not found: $schema_file</p>";
    }
    
    echo "<h2>✅ Setup Complete!</h2>";
    echo "<p>You can now login to the application with:</p>";
    echo "<ul>";
    echo "<li><strong>Username:</strong> admin</li>";
    echo "<li><strong>Password:</strong> admin123</li>";
    echo "</ul>";
    echo "<p><a href='http://localhost:3000' target='_blank'>Go to Application</a></p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database Error: " . $e->getMessage() . "</p>";
    echo "<p>Please check:</p>";
    echo "<ul>";
    echo "<li>MySQL service is running in XAMPP</li>";
    echo "<li>Default MySQL credentials (root/empty password)</li>";
    echo "<li>No other services using port 3306</li>";
    echo "</ul>";
}

echo "<hr>";
echo "<p><small>After setup, delete this file for security.</small></p>";
?>
