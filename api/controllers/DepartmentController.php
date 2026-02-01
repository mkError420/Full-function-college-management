<?php
// Department Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class DepartmentController {
    private $db;
    private $auth;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->auth = new Auth();
    }
    
    public function getAll() {
        $user = $this->auth->requireAuth();
        
        try {
            $query = "SELECT d.*, 
                            (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.department_id) as faculty_count,
                            (SELECT COUNT(*) FROM students s WHERE s.department_id = d.department_id) as student_count,
                            (SELECT COUNT(*) FROM subjects sub WHERE sub.department_id = d.department_id) as subject_count,
                            u_head.username as head_username,
                            CONCAT(u_head.first_name, ' ', u_head.last_name) as head_name
                     FROM departments d 
                     LEFT JOIN users u_head ON d.head_of_department = u_head.user_id
                     LEFT JOIN faculty f_head ON d.head_of_department = f_head.user_id
                     ORDER BY d.department_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $departments
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function getById() {
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        
        if ($department_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Department ID is required']);
            return;
        }
        
        $user = $this->auth->requireAuth();
        
        try {
            $query = "SELECT d.*, 
                            (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.department_id) as faculty_count,
                            (SELECT COUNT(*) FROM students s WHERE s.department_id = d.department_id) as student_count,
                            (SELECT COUNT(*) FROM subjects sub WHERE sub.department_id = d.department_id) as subject_count,
                            u_head.username as head_username,
                            CONCAT(f_head.first_name, ' ', f_head.last_name) as head_name
                     FROM departments d 
                     LEFT JOIN users u_head ON d.head_of_department = u_head.user_id
                     LEFT JOIN faculty f_head ON d.head_of_department = f_head.user_id
                     WHERE d.department_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$department_id]);
            
            $department = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($department) {
                echo json_encode([
                    'success' => true,
                    'data' => $department
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Department not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function create() {
        $user = $this->auth->requireRole('admin');
        
        $data = json_decode(file_get_contents("php://input"));
        
        $required_fields = ['department_name', 'department_code'];
        foreach ($required_fields as $field) {
            if (!isset($data->$field)) {
                http_response_code(400);
                echo json_encode(['message' => "$field is required"]);
                return;
            }
        }
        
        try {
            // Check if department code already exists
            $check_query = "SELECT department_id FROM departments WHERE department_code = ?";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([$data->department_code]);
            
            if ($check_stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['message' => 'Department code already exists']);
                return;
            }
            
            // Check if head_of_department is a valid faculty member
            if (isset($data->head_of_department) && $data->head_of_department) {
                $head_check = "SELECT u.user_id FROM users u JOIN faculty f ON u.user_id = f.user_id 
                              WHERE u.user_id = ? AND u.role = 'faculty'";
                $head_stmt = $this->db->prepare($head_check);
                $head_stmt->execute([$data->head_of_department]);
                
                if (!$head_stmt->fetch()) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Invalid head of department. Must be a faculty member.']);
                    return;
                }
            }
            
            $query = "INSERT INTO departments (department_name, department_code, description, head_of_department) 
                     VALUES (?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $data->department_name,
                $data->department_code,
                $data->description ?? '',
                $data->head_of_department ?? null
            ]);
            
            $department_id = $this->db->lastInsertId();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Department created successfully',
                'department_id' => $department_id
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to create department: ' . $e->getMessage()]);
        }
    }
    
    public function update() {
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        
        if ($department_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Department ID is required']);
            return;
        }
        
        $user = $this->auth->requireRole('admin');
        
        $data = json_decode(file_get_contents("php://input"));
        
        try {
            $update_fields = [];
            $update_values = [];
            
            $allowed_fields = ['department_name', 'description'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data->$field)) {
                    $update_fields[] = "$field = ?";
                    $update_values[] = $data->$field;
                }
            }
            
            if (isset($data->department_code)) {
                // Check if new department code conflicts with existing departments
                $check_query = "SELECT department_id FROM departments WHERE department_code = ? AND department_id != ?";
                $check_stmt = $this->db->prepare($check_query);
                $check_stmt->execute([$data->department_code, $department_id]);
                
                if ($check_stmt->fetch()) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Department code already exists']);
                    return;
                }
                
                $update_fields[] = "department_code = ?";
                $update_values[] = $data->department_code;
            }
            
            if (isset($data->head_of_department)) {
                if ($data->head_of_department) {
                    // Check if head_of_department is a valid faculty member
                    $head_check = "SELECT u.user_id FROM users u JOIN faculty f ON u.user_id = f.user_id 
                                  WHERE u.user_id = ? AND u.role = 'faculty'";
                    $head_stmt = $this->db->prepare($head_check);
                    $head_stmt->execute([$data->head_of_department]);
                    
                    if (!$head_stmt->fetch()) {
                        http_response_code(400);
                        echo json_encode(['message' => 'Invalid head of department. Must be a faculty member.']);
                        return;
                    }
                }
                
                $update_fields[] = "head_of_department = ?";
                $update_values[] = $data->head_of_department ?: null;
            }
            
            if (empty($update_fields)) {
                http_response_code(400);
                echo json_encode(['message' => 'No fields to update']);
                return;
            }
            
            $update_values[] = $department_id;
            $query = "UPDATE departments SET " . implode(', ', $update_fields) . " WHERE department_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($update_values);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Department updated successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Department not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update department: ' . $e->getMessage()]);
        }
    }
    
    public function delete() {
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        
        if ($department_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Department ID is required']);
            return;
        }
        
        $user = $this->auth->requireRole('admin');
        
        try {
            // Check if department has associated faculty, students, or subjects
            $check_query = "SELECT 
                               (SELECT COUNT(*) FROM faculty WHERE department_id = ?) as faculty_count,
                               (SELECT COUNT(*) FROM students WHERE department_id = ?) as student_count,
                               (SELECT COUNT(*) FROM subjects WHERE department_id = ?) as subject_count";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([$department_id, $department_id, $department_id]);
            $check_result = $check_stmt->fetch();
            
            if ($check_result['faculty_count'] > 0 || $check_result['student_count'] > 0 || $check_result['subject_count'] > 0) {
                http_response_code(400);
                echo json_encode([
                    'message' => 'Cannot delete department. It has associated faculty, students, or subjects.',
                    'faculty_count' => $check_result['faculty_count'],
                    'student_count' => $check_result['student_count'],
                    'subject_count' => $check_result['subject_count']
                ]);
                return;
            }
            
            $query = "DELETE FROM departments WHERE department_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$department_id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Department deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Department not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete department: ' . $e->getMessage()]);
        }
    }
    
    public function getFaculty() {
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        
        if ($department_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Department ID is required']);
            return;
        }
        
        $user = $this->auth->requireAuth();
        
        try {
            $query = "SELECT f.*, u.username, u.email 
                     FROM faculty f 
                     JOIN users u ON f.user_id = u.user_id 
                     WHERE f.department_id = ? 
                     ORDER BY f.last_name, f.first_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$department_id]);
            
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
    
    public function getStudents() {
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        
        if ($department_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Department ID is required']);
            return;
        }
        
        $user = $this->auth->requireAuth();
        
        try {
            $query = "SELECT s.*, u.username, u.email, b.batch_name 
                     FROM students s 
                     JOIN users u ON s.user_id = u.user_id 
                     JOIN batches b ON s.batch_id = b.batch_id 
                     WHERE s.department_id = ? 
                     ORDER BY b.batch_name, s.roll_number";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$department_id]);
            
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
}
?>
