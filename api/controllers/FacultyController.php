<?php
// Faculty Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class FacultyController {
    private $db;
    private $auth;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->auth = new Auth();
    }
    
    public function getAll() {
        $user = $this->auth->requireAuth();
        
        // Faculty can only see their own data
        if ($user->role === 'faculty') {
            $this->getById($user->user_id);
            return;
        }
        
        try {
            $query = "SELECT f.*, u.username, u.email, d.department_name 
                     FROM faculty f 
                     JOIN users u ON f.user_id = u.user_id 
                     JOIN departments d ON f.department_id = d.department_id 
                     ORDER BY f.last_name, f.first_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $faculty = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $faculty
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
        
        // Faculty can only access their own data
        if ($current_user->role === 'faculty' && $current_user->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied']);
            return;
        }
        
        try {
            $query = "SELECT f.*, u.username, u.email, d.department_name 
                     FROM faculty f 
                     JOIN users u ON f.user_id = u.user_id 
                     JOIN departments d ON f.department_id = d.department_id 
                     WHERE f.user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$user_id]);
            
            $faculty_member = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($faculty_member) {
                echo json_encode([
                    'success' => true,
                    'data' => $faculty_member
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Faculty member not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function create() {
        $user = $this->auth->requireRole('admin');
        
        $data = json_decode(file_get_contents("php://input"));
        
        $required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'department_id'];
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
            
            // Insert user
            $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
            $user_query = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'faculty')";
            $user_stmt = $this->db->prepare($user_query);
            $user_stmt->execute([$data->username, $data->email, $password_hash]);
            
            $user_id = $this->db->lastInsertId();
            
            // Insert faculty
            $faculty_query = "INSERT INTO faculty (user_id, first_name, last_name, department_id, designation, qualification, experience_years, phone, address, date_of_birth, gender) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $faculty_stmt = $this->db->prepare($faculty_query);
            $faculty_stmt->execute([
                $user_id,
                $data->first_name,
                $data->last_name,
                $data->department_id,
                $data->designation ?? '',
                $data->qualification ?? '',
                $data->experience_years ?? 0,
                $data->phone ?? '',
                $data->address ?? '',
                $data->date_of_birth ?? null,
                $data->gender ?? 'other'
            ]);
            
            $this->db->commit();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Faculty member created successfully',
                'user_id' => $user_id
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to create faculty member: ' . $e->getMessage()]);
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
        
        // Faculty can only update their own data (except critical fields)
        if ($current_user->role === 'faculty' && $current_user->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied']);
            return;
        }
        
        // Only admin can update other faculty
        if ($current_user->role !== 'admin' && $current_user->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied']);
            return;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        try {
            $this->db->beginTransaction();
            
            // Update user table if email is provided
            if (isset($data->email)) {
                $user_query = "UPDATE users SET email = ? WHERE user_id = ?";
                $user_stmt = $this->db->prepare($user_query);
                $user_stmt->execute([$data->email, $user_id]);
            }
            
            // Update faculty table
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
                $admin_fields = ['department_id', 'designation', 'qualification', 'experience_years'];
                foreach ($admin_fields as $field) {
                    if (isset($data->$field)) {
                        $update_fields[] = "$field = ?";
                        $update_values[] = $data->$field;
                    }
                }
            }
            
            if (!empty($update_fields)) {
                $update_values[] = $user_id;
                $faculty_query = "UPDATE faculty SET " . implode(', ', $update_fields) . " WHERE user_id = ?";
                $faculty_stmt = $this->db->prepare($faculty_query);
                $faculty_stmt->execute($update_values);
            }
            
            $this->db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Faculty member updated successfully'
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update faculty member: ' . $e->getMessage()]);
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
            
            // Delete from faculty table (will cascade to user due to foreign key)
            $query = "DELETE FROM users WHERE user_id = ? AND role = 'faculty'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$user_id]);
            
            if ($stmt->rowCount() > 0) {
                $this->db->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Faculty member deleted successfully'
                ]);
            } else {
                $this->db->rollBack();
                http_response_code(404);
                echo json_encode(['message' => 'Faculty member not found']);
            }
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete faculty member: ' . $e->getMessage()]);
        }
    }
    
    public function getAssignedSubjects() {
        $user = $this->auth->requireAuth();
        
        $faculty_user_id = $user->role === 'faculty' ? $user->user_id : (isset($_GET['user_id']) ? $_GET['user_id'] : null);
        
        if ($faculty_user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Faculty user ID is required']);
            return;
        }
        
        try {
            $query = "SELECT fs.*, sub.subject_name, sub.subject_code, b.batch_name, d.department_name 
                     FROM faculty_subjects fs 
                     JOIN subjects sub ON fs.subject_id = sub.subject_id 
                     JOIN batches b ON fs.batch_id = b.batch_id 
                     JOIN departments d ON sub.department_id = d.department_id 
                     WHERE fs.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)
                     ORDER BY sub.subject_name, b.batch_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$faculty_user_id]);
            
            $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $subjects
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function getTimetable() {
        $user = $this->auth->requireAuth();
        
        $faculty_user_id = $user->role === 'faculty' ? $user->user_id : (isset($_GET['user_id']) ? $_GET['user_id'] : null);
        
        if ($faculty_user_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Faculty user ID is required']);
            return;
        }
        
        try {
            $query = "SELECT tt.*, sub.subject_name, sub.subject_code, b.batch_name, d.department_name 
                     FROM timetable tt 
                     JOIN subjects sub ON tt.subject_id = sub.subject_id 
                     JOIN batches b ON tt.batch_id = b.batch_id 
                     JOIN departments d ON sub.department_id = d.department_id 
                     WHERE tt.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)
                     ORDER BY tt.day_of_week, tt.start_time";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$faculty_user_id]);
            
            $timetable = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $timetable
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
