<?php
// Student Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class StudentController {
    private $db;
    private $auth;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->auth = new Auth();
    }
    
    public function getAll() {
        $user = $this->auth->requireAuth();
        
        // Students can only see their own data
        if ($user->role === 'student') {
            $this->getById($user->user_id);
            return;
        }
        
        try {
            $query = "SELECT s.*, u.username, u.email, u.plain_password, d.department_name, b.batch_name 
                     FROM students s 
                     JOIN users u ON s.user_id = u.user_id 
                     JOIN departments d ON s.department_id = d.department_id 
                     JOIN batches b ON s.batch_id = b.batch_id 
                     ORDER BY s.roll_number";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $students
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function getById($user_id = null) {
        if ($user_id === null) {
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        }
        
        if ($user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID is required']);
            return;
        }
        
        $current_user = $this->auth->requireAuth();
        
        // Students can only access their own data
        if ($current_user->role === 'student' && $current_user->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied']);
            return;
        }
        
        try {
            $query = "SELECT s.*, u.username, u.email, u.plain_password, d.department_name, b.batch_name 
                     FROM students s 
                     JOIN users u ON s.user_id = u.user_id 
                     JOIN departments d ON s.department_id = d.department_id 
                     JOIN batches b ON s.batch_id = b.batch_id 
                     WHERE s.user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$user_id]);
            
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($student) {
                echo json_encode([
                    'success' => true,
                    'data' => $student
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Student not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function create() {
        $user = $this->auth->requireRole('admin');
        
        $data = json_decode(file_get_contents("php://input"));
        
        $required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'roll_number', 'department_id', 'batch_id'];
        foreach ($required_fields as $field) {
            if (!isset($data->$field)) {
                http_response_code(400);
                echo json_encode(['message' => "$field is required"]);
                return;
            }
        }
        
        try {
            $this->db->beginTransaction();
            
            // Check if username or email already exists
            $check_query = "SELECT user_id FROM users WHERE username = ? OR email = ?";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([$data->username, $data->email]);
            
            if ($check_stmt->fetch()) {
                $this->db->rollBack();
                http_response_code(400);
                echo json_encode(['message' => 'Username or email already exists']);
                return;
            }
            
            // Check if roll number already exists
            $roll_check = "SELECT student_id FROM students WHERE roll_number = ?";
            $roll_stmt = $this->db->prepare($roll_check);
            $roll_stmt->execute([$data->roll_number]);
            
            if ($roll_stmt->fetch()) {
                $this->db->rollBack();
                http_response_code(400);
                echo json_encode(['message' => 'Roll number already exists']);
                return;
            }
            
            // Insert user
            $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
            $user_query = "INSERT INTO users (username, email, password_hash, plain_password, role) VALUES (?, ?, ?, ?, 'student')";
            $user_stmt = $this->db->prepare($user_query);
            $user_stmt->execute([$data->username, $data->email, $password_hash, $data->password]);
            
            $user_id = $this->db->lastInsertId();
            
            // Insert student
            $student_query = "INSERT INTO students (user_id, roll_number, first_name, last_name, department_id, batch_id, semester, date_of_birth, gender, phone, address, admission_date) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $student_stmt = $this->db->prepare($student_query);
            $student_stmt->execute([
                $user_id,
                $data->roll_number,
                $data->first_name,
                $data->last_name,
                $data->department_id,
                $data->batch_id,
                $data->semester ?? 1,
                $data->date_of_birth ?? null,
                $data->gender ?? 'other',
                $data->phone ?? '',
                $data->address ?? '',
                $data->admission_date ?? date('Y-m-d')
            ]);
            
            $this->db->commit();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Student created successfully',
                'user_id' => $user_id
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to create student: ' . $e->getMessage()]);
        }
    }
    
    public function update($user_id) {
        if ($user_id === null) {
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        }
        
        if ($user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID is required']);
            return;
        }
        
        $current_user = $this->auth->requireAuth();
        
        // Students can only update their own data (except critical fields)
        if ($current_user->role === 'student' && $current_user->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied']);
            return;
        }
        
        // Only admin can update other students
        if ($current_user->role !== 'admin' && $current_user->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied']);
            return;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        try {
            $this->db->beginTransaction();
            
            // Update user table (email, username, password)
            $user_fields = [];
            $user_values = [];

            if (isset($data->email)) {
                $user_fields[] = "email = ?";
                $user_values[] = $data->email;
            }
            if (isset($data->username) && $current_user->role === 'admin') {
                $user_fields[] = "username = ?";
                $user_values[] = $data->username;
            }
            if (isset($data->password) && !empty($data->password) && $current_user->role === 'admin') {
                $user_fields[] = "password_hash = ?";
                $user_values[] = password_hash($data->password, PASSWORD_DEFAULT);
                $user_fields[] = "plain_password = ?";
                $user_values[] = $data->password;
            }

            if (!empty($user_fields)) {
                $user_values[] = $user_id;
                $user_query = "UPDATE users SET " . implode(', ', $user_fields) . " WHERE user_id = ?";
                $user_stmt = $this->db->prepare($user_query);
                $user_stmt->execute($user_values);
            }
            
            // Update student table
            $update_fields = [];
            $update_values = [];
            
            $allowed_fields = ['first_name', 'last_name', 'phone', 'address', 'date_of_birth', 'gender'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data->$field)) {
                    $update_fields[] = "$field = ?";
                    $update_values[] = $data->$field;
                }
            }
            
            // Admin can update additional fields
            if ($current_user->role === 'admin') {
                $admin_fields = ['roll_number', 'department_id', 'batch_id', 'semester', 'status'];
                foreach ($admin_fields as $field) {
                    if (isset($data->$field)) {
                        $update_fields[] = "$field = ?";
                        $update_values[] = $data->$field;
                    }
                }
            }
            
            if (!empty($update_fields)) {
                $update_values[] = $user_id;
                $student_query = "UPDATE students SET " . implode(', ', $update_fields) . " WHERE user_id = ?";
                $student_stmt = $this->db->prepare($student_query);
                $student_stmt->execute($update_values);
            }
            
            $this->db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Student updated successfully'
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update student: ' . $e->getMessage()]);
        }
    }
    
    public function delete($user_id) {
        if ($user_id === null) {
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        }
        
        if ($user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID is required']);
            return;
        }
        
        $user = $this->auth->requireRole('admin');
        
        try {
            $this->db->beginTransaction();
            
            // Delete from students table (will cascade to user due to foreign key)
            $query = "DELETE FROM users WHERE user_id = ? AND role = 'student'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$user_id]);
            
            if ($stmt->rowCount() > 0) {
                $this->db->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Student deleted successfully'
                ]);
            } else {
                $this->db->rollBack();
                http_response_code(404);
                echo json_encode(['message' => 'Student not found']);
            }
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete student: ' . $e->getMessage()]);
        }
    }
    
    public function getAttendance() {
        $user = $this->auth->requireAuth();
        
        $student_user_id = $user->role === 'student' ? $user->user_id : (isset($_GET['user_id']) ? $_GET['user_id'] : null);
        
        if ($student_user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Student user ID is required']);
            return;
        }
        
        try {
            $query = "SELECT a.*, sub.subject_name, sub.subject_code, f.first_name, f.last_name 
                     FROM attendance a 
                     JOIN subjects sub ON a.subject_id = sub.subject_id 
                     JOIN faculty f ON a.faculty_id = f.faculty_id 
                     WHERE a.student_id = (SELECT student_id FROM students WHERE user_id = ?)
                     ORDER BY a.date DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$student_user_id]);
            
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $attendance
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function getMarks() {
        $user = $this->auth->requireAuth();
        
        $student_user_id = $user->role === 'student' ? $user->user_id : (isset($_GET['user_id']) ? $_GET['user_id'] : null);
        
        if ($student_user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Student user ID is required']);
            return;
        }
        
        try {
            $query = "SELECT m.*, sub.subject_name, sub.subject_code, f.first_name, f.last_name 
                     FROM marks m 
                     JOIN subjects sub ON m.subject_id = sub.subject_id 
                     JOIN faculty f ON m.faculty_id = f.faculty_id 
                     WHERE m.student_id = (SELECT student_id FROM students WHERE user_id = ?)
                     ORDER BY m.exam_date DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$student_user_id]);
            
            $marks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $marks
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
