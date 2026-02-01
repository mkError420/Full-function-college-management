<?php
// Authentication Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class AuthController {
    private $db;
    private $auth;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->auth = new Auth();
    }
    
    public function login() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Username and password are required']);
            return;
        }
        
        try {
            $query = "SELECT user_id, username, email, password_hash, role FROM users WHERE username = ? OR email = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data->username, $data->username]);
            
            $user = $stmt->fetch();
            
            if ($user && password_verify($data->password, $user['password_hash'])) {
                $token = $this->auth->generateJWT($user['user_id'], $user['username'], $user['role']);
                
                // Get additional user details based on role
                $user_details = $this->getUserDetails($user['user_id'], $user['role']);
                
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $user['user_id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'details' => $user_details
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function register() {
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        $required_fields = ['username', 'email', 'password', 'role', 'first_name', 'last_name'];
        foreach ($required_fields as $field) {
            if (!isset($data->$field)) {
                http_response_code(400);
                echo json_encode(['message' => "$field is required"]);
                return;
            }
        }
        
        // Validate role
        if (!in_array($data->role, ['admin', 'faculty', 'student'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid role']);
            return;
        }
        
        try {
            // Check if username or email already exists
            $check_query = "SELECT user_id FROM users WHERE username = ? OR email = ?";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([$data->username, $data->email]);
            
            if ($check_stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['message' => 'Username or email already exists']);
                return;
            }
            
            // Hash password
            $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
            
            // Start transaction
            $this->db->beginTransaction();
            
            // Insert user
            $user_query = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
            $user_stmt = $this->db->prepare($user_query);
            $user_stmt->execute([$data->username, $data->email, $password_hash, $data->role]);
            
            $user_id = $this->db->lastInsertId();
            
            // Insert role-specific data
            if ($data->role === 'faculty') {
                $this->insertFaculty($user_id, $data);
            } elseif ($data->role === 'student') {
                $this->insertStudent($user_id, $data);
            }
            
            $this->db->commit();
            
            // Generate token
            $token = $this->auth->generateJWT($user_id, $data->username, $data->role);
            
            echo json_encode([
                'success' => true,
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => [
                    'id' => $user_id,
                    'username' => $data->username,
                    'email' => $data->email,
                    'role' => $data->role
                ]
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
    
    private function insertFaculty($user_id, $data) {
        $query = "INSERT INTO faculty (user_id, first_name, last_name, department_id, designation, qualification, experience_years, phone, address, date_of_birth, gender) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $user_id,
            $data->first_name,
            $data->last_name,
            $data->department_id ?? 1,
            $data->designation ?? '',
            $data->qualification ?? '',
            $data->experience_years ?? 0,
            $data->phone ?? '',
            $data->address ?? '',
            $data->date_of_birth ?? null,
            $data->gender ?? 'other'
        ]);
    }
    
    private function insertStudent($user_id, $data) {
        $query = "INSERT INTO students (user_id, roll_number, first_name, last_name, department_id, batch_id, semester, date_of_birth, gender, phone, address, admission_date) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $user_id,
            $data->roll_number ?? 'ROLL' . $user_id,
            $data->first_name,
            $data->last_name,
            $data->department_id ?? 1,
            $data->batch_id ?? 1,
            $data->semester ?? 1,
            $data->date_of_birth ?? null,
            $data->gender ?? 'other',
            $data->phone ?? '',
            $data->address ?? '',
            $data->admission_date ?? date('Y-m-d')
        ]);
    }
    
    private function getUserDetails($user_id, $role) {
        try {
            if ($role === 'faculty') {
                $query = "SELECT f.*, d.department_name FROM faculty f 
                         JOIN departments d ON f.department_id = d.department_id 
                         WHERE f.user_id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$user_id]);
                return $stmt->fetch();
            } elseif ($role === 'student') {
                $query = "SELECT s.*, d.department_name, b.batch_name FROM students s 
                         JOIN departments d ON s.department_id = d.department_id 
                         JOIN batches b ON s.batch_id = b.batch_id 
                         WHERE s.user_id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$user_id]);
                return $stmt->fetch();
            }
            return null;
        } catch(PDOException $e) {
            return null;
        }
    }
    
    public function getProfile() {
        $user = $this->auth->requireAuth();
        $user_details = $this->getUserDetails($user->user_id, $user->role);
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user->user_id,
                'username' => $user->username,
                'role' => $user->role,
                'details' => $user_details
            ]
        ]);
    }
}
?>
