<?php
// Authentication middleware

class Auth {
    private $secret_key = 'your_secret_key_here_change_in_production';
    
    public function generateJWT($user_id, $username, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user_id,
            'username' => $username,
            'role' => $role,
            'exp' => time() + (60 * 60 * 24) // 24 hours
        ]);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    public function validateJWT($jwt) {
        if (!$jwt) {
            return false;
        }
        
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            return false;
        }
        
        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signature_provided = $tokenParts[2];
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_'], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_'], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_'], base64_encode($signature));
        
        if ($base64UrlSignature !== $signature_provided) {
            return false;
        }
        
        $payload_obj = json_decode($payload);
        if ($payload_obj->exp < time()) {
            return false;
        }
        
        return $payload_obj;
    }
    
    public function getAuthenticatedUser() {
        $headers = getallheaders();
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $jwt = $matches[1];
            return $this->validateJWT($jwt);
        }
        
        return false;
    }
    
    public function requireAuth() {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            exit();
        }
        return $user;
    }
    
    public function requireRole($required_role) {
        $user = $this->requireAuth();
        if ($user->role !== $required_role && $user->role !== 'admin') {
            http_response_code(403);
            echo json_encode(['message' => 'Forbidden - Insufficient privileges']);
            exit();
        }
        return $user;
    }
}
?>
