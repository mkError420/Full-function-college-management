<?php
// Subject Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class SubjectController {
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
            $query = "SELECT s.*, d.department_name 
                     FROM subjects s 
                     JOIN departments d ON s.department_id = d.department_id 
                     ORDER BY d.department_name, s.semester, s.subject_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
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
    
    public function getById() {
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        
        if ($subject_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Subject ID is required']);
            return;
        }
        
        try {
            $query = "SELECT s.*, d.department_name 
                     FROM subjects s 
                     JOIN departments d ON s.department_id = d.department_id 
                     WHERE s.subject_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$subject_id]);
            
            $subject = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($subject) {
                echo json_encode([
                    'success' => true,
                    'data' => $subject
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Subject not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function create() {
        $user = $this->auth->requireRole('admin');
        
        $data = json_decode(file_get_contents("php://input"));
        
        $required_fields = ['subject_name', 'subject_code', 'department_id', 'semester'];
        foreach ($required_fields as $field) {
            if (!isset($data->$field)) {
                http_response_code(400);
                echo json_encode(['message' => "$field is required"]);
                return;
            }
        }
        
        try {
            // Check if subject code already exists
            $check_query = "SELECT subject_id FROM subjects WHERE subject_code = ?";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([$data->subject_code]);
            
            if ($check_stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['message' => 'Subject code already exists']);
                return;
            }
            
            $query = "INSERT INTO subjects (subject_name, subject_code, department_id, credit_hours, description, semester) 
                     VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $data->subject_name,
                $data->subject_code,
                $data->department_id,
                $data->credit_hours ?? 1,
                $data->description ?? '',
                $data->semester
            ]);
            
            $subject_id = $this->db->lastInsertId();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Subject created successfully',
                'subject_id' => $subject_id
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to create subject: ' . $e->getMessage()]);
        }
    }
    
    public function update() {
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        
        if ($subject_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Subject ID is required']);
            return;
        }
        
        $user = $this->auth->requireRole('admin');
        
        $data = json_decode(file_get_contents("php://input"));
        
        try {
            $update_fields = [];
            $update_values = [];
            
            $allowed_fields = ['subject_name', 'department_id', 'credit_hours', 'description', 'semester'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data->$field)) {
                    $update_fields[] = "$field = ?";
                    $update_values[] = $data->$field;
                }
            }
            
            if (isset($data->subject_code)) {
                // Check if new subject code conflicts with existing subjects
                $check_query = "SELECT subject_id FROM subjects WHERE subject_code = ? AND subject_id != ?";
                $check_stmt = $this->db->prepare($check_query);
                $check_stmt->execute([$data->subject_code, $subject_id]);
                
                if ($check_stmt->fetch()) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Subject code already exists']);
                    return;
                }
                
                $update_fields[] = "subject_code = ?";
                $update_values[] = $data->subject_code;
            }
            
            if (empty($update_fields)) {
                http_response_code(400);
                echo json_encode(['message' => 'No fields to update']);
                return;
            }
            
            $update_values[] = $subject_id;
            $query = "UPDATE subjects SET " . implode(', ', $update_fields) . " WHERE subject_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($update_values);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Subject updated successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Subject not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update subject: ' . $e->getMessage()]);
        }
    }
    
    public function delete() {
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        
        if ($subject_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Subject ID is required']);
            return;
        }
        
        $user = $this->auth->requireRole('admin');
        
        try {
            $query = "DELETE FROM subjects WHERE subject_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$subject_id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Subject deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Subject not found']);
            }
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete subject: ' . $e->getMessage()]);
        }
    }
    
    public function getByDepartment() {
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        
        if ($department_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Department ID is required']);
            return;
        }
        
        $user = $this->auth->requireAuth();
        
        try {
            $query = "SELECT s.*, d.department_name 
                     FROM subjects s 
                     JOIN departments d ON s.department_id = d.department_id 
                     WHERE s.department_id = ? 
                     ORDER BY s.semester, s.subject_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$department_id]);
            
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
    
    public function getByBatch() {
        $batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
        $semester = isset($_GET['semester']) ? $_GET['semester'] : null;
        
        if ($batch_id === null) {
            http_response_code(400);
            echo json_encode(['message' => 'Batch ID is required']);
            return;
        }
        
        $user = $this->auth->requireAuth();
        
        try {
            $query = "SELECT DISTINCT s.*, d.department_name 
                     FROM subjects s 
                     JOIN departments d ON s.department_id = d.department_id 
                     JOIN faculty_subjects fs ON s.subject_id = fs.subject_id 
                     WHERE fs.batch_id = ?";
            
            $params = [$batch_id];
            
            if ($semester !== null) {
                $query .= " AND s.semester = ?";
                $params[] = $semester;
            }
            
            $query .= " ORDER BY s.semester, s.subject_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
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
}
?>
