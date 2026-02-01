<?php
// Simple database creator
try {
    $conn = new PDO("mysql:host=localhost", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $conn->exec("DROP DATABASE IF EXISTS medical_college_db");
    $conn->exec("CREATE DATABASE medical_college_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    $conn->exec("USE medical_college_db");
    
    $conn->exec("CREATE TABLE users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'faculty', 'student') NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $conn->exec("INSERT INTO users (username, email, password_hash, role) VALUES 
                 ('admin', 'admin@medicalcollege.edu', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')");
    
    echo "✅ Database created successfully!<br>";
    echo "✅ Admin user: admin / admin123<br>";
    echo "✅ Try login now at: <a href='http://localhost:3000'>React App</a>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
