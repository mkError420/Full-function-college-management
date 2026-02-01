<?php
// Attendance Controller

require_once '../config/database.php';
require_once '../middleware/auth.php';

class AttendanceController {
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
        $date = isset($_GET['date']) ? $_GET['date'] : null;
        $batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
        
        try {
            $query = "SELECT a.*, s.roll_number, s.first_name, s.last_name, sub.subject_name, sub.subject_code, 
                     f.first_name as faculty_first_name, f.last_name as faculty_last_name, b.batch_name 
                     FROM attendance a 
                     JOIN students s ON a.student_id = s.student_id 
                     JOIN subjects sub ON a.subject_id = sub.subject_id 
                     JOIN faculty f ON a.faculty_id = f.faculty_id 
                     JOIN batches b ON s.batch_id = b.batch_id 
                     WHERE 1=1";
            
            $params = [];
            
            if ($subject_id) {
                $query .= " AND a.subject_id = ?";
                $params[] = $subject_id;
            }
            
            if ($date) {
                $query .= " AND a.date = ?";
                $params[] = $date;
            }
            
            if ($batch_id) {
                $query .= " AND s.batch_id = ?";
                $params[] = $batch_id;
            }
            
            // Faculty can only see attendance for their assigned subjects
            if ($user->role === 'faculty') {
                $query .= " AND a.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)";
                $params[] = $user->user_id;
            }
            
            $query .= " ORDER BY a.date DESC, s.roll_number";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
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
    
    public function markAttendance() {
        $user = $this->auth->requireRole('faculty');
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->subject_id) || !isset($data->date) || !isset($data->attendance_records)) {
            http_response_code(400);
            echo json_encode(['message' => 'Subject ID, date, and attendance records are required']);
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
            
            $marked_count = 0;
            
            foreach ($data->attendance_records as $record) {
                if (!isset($record->student_id) || !isset($record->status)) {
                    continue;
                }
                
                // Check if attendance already exists for this student, subject, and date
                $check_query = "SELECT attendance_id FROM attendance 
                               WHERE student_id = ? AND subject_id = ? AND date = ?";
                $check_stmt = $this->db->prepare($check_query);
                $check_stmt->execute([$record->student_id, $data->subject_id, $data->date]);
                
                if ($check_stmt->fetch()) {
                    // Update existing attendance
                    $update_query = "UPDATE attendance SET status = ?, remarks = ?, faculty_id = ? 
                                    WHERE student_id = ? AND subject_id = ? AND date = ?";
                    $update_stmt = $this->db->prepare($update_query);
                    $update_stmt->execute([
                        $record->status,
                        $record->remarks ?? '',
                        $faculty['faculty_id'],
                        $record->student_id,
                        $data->subject_id,
                        $data->date
                    ]);
                } else {
                    // Insert new attendance
                    $insert_query = "INSERT INTO attendance (student_id, subject_id, faculty_id, date, status, remarks) 
                                   VALUES (?, ?, ?, ?, ?, ?)";
                    $insert_stmt = $this->db->prepare($insert_query);
                    $insert_stmt->execute([
                        $record->student_id,
                        $data->subject_id,
                        $faculty['faculty_id'],
                        $data->date,
                        $record->status,
                        $record->remarks ?? ''
                    ]);
                }
                
                $marked_count++;
            }
            
            $this->db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => "Attendance marked for $marked_count students"
            ]);
            
        } catch(PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Failed to mark attendance: ' . $e->getMessage()]);
        }
    }
    
    public function getAttendanceReport() {
        $user = $this->auth->requireAuth();
        
        $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
        $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;
        $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : null;
        $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : null;
        
        try {
            $query = "SELECT 
                        COUNT(*) as total_classes,
                        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
                        ROUND((SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
                     FROM attendance a";
            
            $where_conditions = [];
            $params = [];
            
            if ($student_id) {
                $where_conditions[] = "a.student_id = ?";
                $params[] = $student_id;
            }
            
            if ($subject_id) {
                $where_conditions[] = "a.subject_id = ?";
                $params[] = $subject_id;
            }
            
            if ($from_date) {
                $where_conditions[] = "a.date >= ?";
                $params[] = $from_date;
            }
            
            if ($to_date) {
                $where_conditions[] = "a.date <= ?";
                $params[] = $to_date;
            }
            
            // Faculty can only see reports for their assigned subjects
            if ($user->role === 'faculty') {
                $where_conditions[] = "a.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)";
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
    
    public function getStudentsForAttendance() {
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
            
            $query = "SELECT s.student_id, s.roll_number, s.first_name, s.last_name, 
                            a.status as today_status, a.remarks as today_remarks
                     FROM students s 
                     LEFT JOIN attendance a ON s.student_id = a.student_id AND a.subject_id = ? AND a.date = CURDATE()
                     WHERE s.batch_id = ? AND s.status = 'active'
                     ORDER BY s.roll_number";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$subject_id, $batch_id]);
            
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
