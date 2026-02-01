<?php
// Main API Router

require_once 'config/cors.php';
require_once 'config/database.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string from URI
$uri_path = parse_url($request_uri, PHP_URL_PATH);
$uri_path = str_replace('/api', '', $uri_path);
$uri_segments = explode('/', trim($uri_path, '/'));

// Get endpoint and parameters
$endpoint = $uri_segments[0] ?? '';
$resource_id = $uri_segments[1] ?? null;

// Route the request
switch ($endpoint) {
    case 'auth':
        require_once 'controllers/AuthController.php';
        $controller = new AuthController();
        
        switch ($method) {
            case 'POST':
                $action = $_GET['action'] ?? '';
                if ($action === 'register') {
                    $controller->register();
                } else {
                    $controller->login();
                }
                break;
            case 'GET':
                $controller->getProfile();
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    case 'students':
        require_once 'controllers/StudentController.php';
        $controller = new StudentController();
        
        switch ($method) {
            case 'GET':
                if ($resource_id) {
                    $_GET['user_id'] = $resource_id;
                    $controller->getById();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'attendance') {
                    $controller->getAttendance();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'marks') {
                    $controller->getMarks();
                } else {
                    $controller->getAll();
                }
                break;
            case 'POST':
                $controller->create();
                break;
            case 'PUT':
                if ($resource_id) {
                    $_GET['user_id'] = $resource_id;
                    $controller->update($resource_id);
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'User ID is required']);
                }
                break;
            case 'DELETE':
                if ($resource_id) {
                    $_GET['user_id'] = $resource_id;
                    $controller->delete($resource_id);
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'User ID is required']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    case 'faculty':
        require_once 'controllers/FacultyController.php';
        $controller = new FacultyController();
        
        switch ($method) {
            case 'GET':
                if ($resource_id) {
                    $_GET['user_id'] = $resource_id;
                    $controller->getById();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'subjects') {
                    $controller->getAssignedSubjects();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'timetable') {
                    $controller->getTimetable();
                } else {
                    $controller->getAll();
                }
                break;
            case 'POST':
                $controller->create();
                break;
            case 'PUT':
                if ($resource_id) {
                    $_GET['user_id'] = $resource_id;
                    $controller->update($resource_id);
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'User ID is required']);
                }
                break;
            case 'DELETE':
                if ($resource_id) {
                    $_GET['user_id'] = $resource_id;
                    $controller->delete($resource_id);
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'User ID is required']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    case 'subjects':
        require_once 'controllers/SubjectController.php';
        $controller = new SubjectController();
        
        switch ($method) {
            case 'GET':
                if ($resource_id) {
                    $_GET['subject_id'] = $resource_id;
                    $controller->getById();
                } elseif (isset($_GET['department_id'])) {
                    $controller->getByDepartment();
                } elseif (isset($_GET['batch_id'])) {
                    $controller->getByBatch();
                } else {
                    $controller->getAll();
                }
                break;
            case 'POST':
                $controller->create();
                break;
            case 'PUT':
                if ($resource_id) {
                    $_GET['subject_id'] = $resource_id;
                    $controller->update();
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'Subject ID is required']);
                }
                break;
            case 'DELETE':
                if ($resource_id) {
                    $_GET['subject_id'] = $resource_id;
                    $controller->delete();
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'Subject ID is required']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    case 'attendance':
        require_once 'controllers/AttendanceController.php';
        $controller = new AttendanceController();
        
        switch ($method) {
            case 'GET':
                if (isset($_GET['action']) && $_GET['action'] === 'report') {
                    $controller->getAttendanceReport();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'students') {
                    $controller->getStudentsForAttendance();
                } else {
                    $controller->getAll();
                }
                break;
            case 'POST':
                if (isset($_GET['action']) && $_GET['action'] === 'mark') {
                    $controller->markAttendance();
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'Invalid action']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    case 'marks':
        require_once 'controllers/MarksController.php';
        $controller = new MarksController();
        
        switch ($method) {
            case 'GET':
                if (isset($_GET['action']) && $_GET['action'] === 'report') {
                    $controller->getMarksReport();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'students') {
                    $controller->getStudentsForMarks();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'performance') {
                    $controller->getSubjectWisePerformance();
                } else {
                    $controller->getAll();
                }
                break;
            case 'POST':
                if (isset($_GET['action']) && $_GET['action'] === 'add') {
                    $controller->addMarks();
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'Invalid action']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    case 'departments':
        require_once 'controllers/DepartmentController.php';
        $controller = new DepartmentController();
        
        switch ($method) {
            case 'GET':
                if ($resource_id) {
                    $_GET['department_id'] = $resource_id;
                    $controller->getById();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'faculty') {
                    $controller->getFaculty();
                } elseif (isset($_GET['action']) && $_GET['action'] === 'students') {
                    $controller->getStudents();
                } else {
                    $controller->getAll();
                }
                break;
            case 'POST':
                $controller->create();
                break;
            case 'PUT':
                if ($resource_id) {
                    $_GET['department_id'] = $resource_id;
                    $controller->update();
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'Department ID is required']);
                }
                break;
            case 'DELETE':
                if ($resource_id) {
                    $_GET['department_id'] = $resource_id;
                    $controller->delete();
                } else {
                    http_response_code(400);
                    echo json_encode(['message' => 'Department ID is required']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Method not allowed']);
                break;
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint not found']);
        break;
}
?>
