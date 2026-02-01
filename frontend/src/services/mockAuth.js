// Mock Authentication Service - No PHP needed
export const mockAuthAPI = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { username, password } = credentials;
    
    // Valid credentials
    const validUsers = {
      admin: {
        password: 'admin123',
        id: 1,
        email: 'admin@medicalcollege.edu',
        role: 'admin',
        details: {
          first_name: 'Admin',
          last_name: 'User',
          department_name: 'Administration'
        }
      },
      faculty: {
        password: 'faculty123',
        id: 2,
        email: 'faculty@medicalcollege.edu',
        role: 'faculty',
        details: {
          first_name: 'Faculty',
          last_name: 'User',
          department_name: 'Medicine'
        }
      },
      student: {
        password: 'student123',
        id: 3,
        email: 'student@medicalcollege.edu',
        role: 'student',
        details: {
          first_name: 'Student',
          last_name: 'User',
          department_name: 'Medicine',
          semester: 3
        }
      }
    };
    
    if (validUsers[username] && validUsers[username].password === password) {
      const user = validUsers[username];
      return {
        data: {
          success: true,
          token: 'mock_token_' + Date.now() + '_' + user.id,
          user: {
            id: user.id,
            username: username,
            email: user.email,
            role: user.role,
            details: user.details
          }
        }
      };
    } else {
      return {
        data: {
          success: false,
          message: 'Invalid username or password'
        }
      };
    }
  },
  
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      data: {
        success: true,
        message: 'User registered successfully',
        user: userData
      }
    };
  },
  
  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return {
        data: {
          success: true,
          user: JSON.parse(userStr)
        }
      };
    }
    return {
      data: {
        success: false,
        message: 'No user found'
      }
    };
  }
};
