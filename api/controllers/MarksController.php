<?php
// Marks Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class MarksController {
    private $db;
    private $auth;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->auth = new Auth();
    }
    
    public function getAll() {
        $user = $this->auth->requireAuth();
        
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        $exam_type = isset($_GET['exam_type']) ? $_GET['exam_type'] : null;
        $batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
        $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
        
        try {
            $query = "SELECT m.*, s.roll_number, s.first_name, s.last_name, sub.subject_name, sub.subject_code, 
                     f.first_name as faculty_first_name, f.last_name as faculty_last_name, b.batch_name 
                     FROM marks m 
                     JOIN students s ON m.student_id = s.student_id 
                     JOIN subjects sub ON m.subject_id = sub.subject_id 
                     JOIN faculty f ON m.faculty_id = f.faculty_id 
                     JOIN batches b ON s.batch_id = b.batch_id 
                     WHERE 1=1";
            
            $params = [];
            
            if ($subject_id) {
                $query .= " AND m.subject_id = ?";
                $params[] = $subject_id;
            }
            
            if ($exam_type) {
                $query .= " AND m.exam_type = ?";
                $params[] = $exam_type;
            }
            
            if ($batch_id) {
                $query .= " AND s.batch_id = ?";
                $params[] = $batch_id;
            }
            
            if ($student_id) {
                $query .= " AND m.student_id = ?";
                $params[] = $student_id;
            }
            
            // Faculty can only see marks for their assigned subjects
            if ($user->role === 'faculty') {
                $query .= " AND m.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)";
                $params[] = $user->user_id;
            }
            
            // Students can only see their own marks
            if ($user->role === 'student') {
                $query .= " AND m.student_id = (SELECT student_id FROM students WHERE user_id = ?)";
                $params[] = $user->user_id;
            }
            
            $query .= " ORDER BY m.exam_date DESC, s.roll_number";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
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
    
    public function addMarks() {
        $user = $this->auth->requireRole('faculty');
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->subject_id) || !isset($data->exam_type) || !isset($data->exam_date) || !isset($data->marks_records)) {
            http_response_code(400);
            echo json_encode(['message' => 'Subject ID, exam type, exam date, and marks records are required']);
            return;
        }
        
        try {
            $this->db->beginTransaction();
            
            // Get faculty ID
            $faculty_query = "SELECT faculty_id FROM faculty WHERE user_id = ?";
            $faculty_stmt = $this->db->prepare($faculty_query);
            $faculty_stmt->execute([$user->user_id]);
            $faculty = $faculty_stmt->fetch();
            
            if (!$faculty) {
                $this->db->rollBack();
                http_response_code(403);
                echo json_encode(['message' => 'Faculty not found']);
                return;
            }
            
            // Check if faculty is assigned to this subject
            $assignment_query = "SELECT assignment_id FROM faculty_subjects 
                                WHERE faculty_id = ? AND subject_id = ?";
            $assignment_stmt = $this->db->prepare($assignment_query);
            $assignment_stmt->execute([$faculty['faculty_id'], $data->subject_id]);
            
            if (!$assignment_stmt->fetch()) {
                $this->db->rollBack();
                http_response_code(403);
                echo json_encode(['message' => 'You are not assigned to this subject']);
                return;
            }
            
            $added_count = 0;
            
            foreach ($data->marks_records as $record) {
                if (!isset($record->student_id) || !isset($record->max_marks) || !isset($record->obtained_marks)) {
                    continue;
                }
                
                // Validate marks
                if ($record->obtained_marks > $record->max_marks || $record->obtained_marks < 0) {
                    continue;
                }
                
                // Check if marks already exist for this student, subject, exam type, and date
                $check_query = "SELECT mark_id FROM marks 
                               WHERE student_id = ? AND subject_id = ? AND exam_type = ? AND exam_date = ?";
                $check_stmt = $this->db->prepare($check_query);
                $check_stmt->execute([$record->student_id, $data->subject_id, $data->exam_type, $data->exam_date]);
                
                if ($check_stmt->fetch()) {
                    // Update existing marks
                    $update_query = "UPDATE marks SET max_marks = ?, obtained_marks = ?, remarks = ?, faculty_id = ? 
                                    WHERE student_id = ? AND subject_id = ? AND exam_type = ? AND exam_date = ?";
                    $update_stmt = $this->db->prepare($update_query);
                    $update_stmt->execute([
                        $record->max_marks,
                        $record->obtained_marks,
                        $record->remarks ?? '',
                        $faculty['faculty_id'],
                        $record->student_id,
                        $data->subject_id,
                        $data->exam_type,
                        $data->exam_date
                    ]);
                } else {
                    // Insert new marks
                    $insert_query = "INSERT INTO marks (student_id, subject_id, faculty_id, exam_type, max_marks, obtained_marks, exam_date, remarks) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    $insert_stmt = $this->db->prepare($insert_query);
                    $insert_stmt->execute([
                        $record->student_id,
                        $data->subject_id,
                        $faculty['faculty_id'],
                        $data->exam_type,
                        $record->max_marks,
                        $record->obtained_marks,
                        $data->exam_date,
                        $record->remarks ?? ''
                    ]);
                }
                
                $added_count++;
            }
            
            $this->db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => "Marks added for $added_count students"
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to add marks: ' . $e->getMessage()]);
        }
    }
    
    public function getMarksReport() {
        $user = $this->auth->requireAuth();
        
        $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        $exam_type = isset($_GET['exam_type']) ? $_GET['exam_type'] : null;
        $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : null;
        $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : null;
        
        try {
            $query = "SELECT 
                        COUNT(*) as total_exams,
                        SUM(max_marks) as total_max_marks,
                        SUM(obtained_marks) as total_obtained_marks,
                        ROUND((SUM(obtained_marks) * 100.0 / SUM(max_marks)), 2) as percentage,
                        MAX(obtained_marks) as highest_marks,
                        MIN(obtained_marks) as lowest_marks,
                        ROUND(AVG(obtained_marks), 2) as average_marks
                     FROM marks m";
            
            $where_conditions = [];
            $params = [];
            
            if ($student_id) {
                $where_conditions[] = "m.student_id = ?";
                $params[] = $student_id;
            }
            
            if ($subject_id) {
                $where_conditions[] = "m.subject_id = ?";
                $params[] = $subject_id;
            }
            
            if ($exam_type) {
                $where_conditions[] = "m.exam_type = ?";
                $params[] = $exam_type;
            }
            
            if ($from_date) {
                $where_conditions[] = "m.exam_date >= ?";
                $params[] = $from_date;
            }
            
            if ($to_date) {
                $where_conditions[] = "m.exam_date <= ?";
                $params[] = $to_date;
            }
            
            // Faculty can only see reports for their assigned subjects
            if ($user->role === 'faculty') {
                $where_conditions[] = "m.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)";
                $params[] = $user->user_id;
            }
            
            // Students can only see their own reports
            if ($user->role === 'student') {
                $where_conditions[] = "m.student_id = (SELECT student_id FROM students WHERE user_id = ?)";
                $params[] = $user->user_id;
            }
            
            if (!empty($where_conditions)) {
                $query .= " WHERE " . implode(' AND ', $where_conditions);
            }
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            $report = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $report
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function getStudentsForMarks() {
        $user = $this->auth->requireRole('faculty');
        
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        $batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
        
        if (!$subject_id || !$batch_id) {
            http_response_code(400);
            echo json_encode(['message' => 'Subject ID and Batch ID are required']);
            return;
        }
        
        try {
            // Verify faculty is assigned to this subject
            $faculty_query = "SELECT faculty_id FROM faculty WHERE user_id = ?";
            $faculty_stmt = $this->db->prepare($faculty_query);
            $faculty_stmt->execute([$user->user_id]);
            $faculty = $faculty_stmt->fetch();
            
            if (!$faculty) {
                http_response_code(403);
                echo json_encode(['message' => 'Faculty not found']);
                return;
            }
            
            $assignment_query = "SELECT assignment_id FROM faculty_subjects 
                                WHERE faculty_id = ? AND subject_id = ? AND batch_id = ?";
            $assignment_stmt = $this->db->prepare($assignment_query);
            $assignment_stmt->execute([$faculty['faculty_id'], $subject_id, $batch_id]);
            
            if (!$assignment_stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['message' => 'You are not assigned to this subject for this batch']);
                return;
            }
            
            $query = "SELECT s.student_id, s.roll_number, s.first_name, s.last_name 
                     FROM students s 
                     WHERE s.batch_id = ? AND s.status = 'active'
                     ORDER BY s.roll_number";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$batch_id]);
            
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => students
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function getSubjectWisePerformance() {
        $user = $this->auth->requireAuth();
        
        $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
        
        if ($user->role === 'student') {
            $student_id = $user->user_id;
        }
        
        if (!$student_id) {
            http_response_code(400);
            echo json_encode(['message' => 'Student ID is required']);
            return;
        }
        
        try {
            $query = "SELECT 
                        sub.subject_id,
                        sub.subject_name,
                        sub.subject_code,
                        COUNT(*) as total_exams,
                        SUM(m.max_marks) as total_max_marks,
                        SUM(m.obtained_marks) as total_obtained_marks,
                        ROUND((SUM(m.obtained_marks) * 100.0 / SUM(m.max_marks)), 2) as percentage
                     FROM marks m 
                     JOIN subjects sub ON m.subject_id = sub.subject_id 
                     WHERE m.student_id = (SELECT student_id FROM students WHERE user_id = ?)
                     GROUP BY sub.subject_id, sub.subject_name, sub.subject_code
                     ORDER BY sub.subject_name";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$student_id]);
            
            $performance = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $performance
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
