# Medical College Student Management System

A comprehensive web-based system for managing students, faculty, academic records, and administrative data in a medical college environment.

## Features

### Core Functionality
- **User Authentication & Authorization**: Secure login system with role-based access control
- **Student Management**: Complete student lifecycle management
- **Faculty Management**: Faculty profiles and subject assignments
- **Academic Management**: Subjects, departments, and batch management
- **Attendance Tracking**: Comprehensive attendance monitoring and reporting
- **Marks Management**: Exam results and performance tracking
- **Department Management**: Organizational structure management

### Role-Based Access
- **Admin**: Full system access, user management, system configuration
- **Faculty**: Manage assigned subjects, mark attendance, enter marks
- **Student**: View personal information, attendance, marks, and timetables

## Technology Stack

### Backend
- **PHP 8.0+**: RESTful API development
- **MySQL 8.0+**: Database management
- **JWT Authentication**: Secure token-based authentication
- **PDO**: Database abstraction layer

### Frontend
- **React 18**: Modern UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **Lucide React**: Icon library
- **Recharts**: Data visualization

## Installation & Setup

### Prerequisites
- XAMPP/WAMP/LAMP stack (PHP 8.0+, MySQL 8.0+, Apache)
- Node.js 16+ and npm
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "College management"
   ```

2. **Database Setup**
   - Start Apache and MySQL from XAMPP control panel
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Import the database schema:
     ```sql
     -- Copy and execute the contents of database/schema.sql
     ```

3. **Configure API**
   - Update `api/config/database.php` with your database credentials
   - Ensure the `api` directory is accessible via Apache

4. **Test API**
   - Visit `http://localhost/api` to verify the API is working

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open `http://localhost:3000` in your browser

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Faculty | faculty | faculty123 |
| Student | student | student123 |

## API Endpoints

### Authentication
- `POST /api/auth` - Login
- `POST /api/auth?action=register` - Register
- `GET /api/auth` - Get profile

### Students
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/students?action=attendance` - Get student attendance
- `GET /api/students?action=marks` - Get student marks

### Faculty
- `GET /api/faculty` - Get all faculty
- `GET /api/faculty/{id}` - Get faculty by ID
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/{id}` - Update faculty
- `DELETE /api/faculty/{id}` - Delete faculty
- `GET /api/faculty?action=subjects` - Get assigned subjects
- `GET /api/faculty?action=timetable` - Get timetable

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/{id}` - Get subject by ID
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance?action=mark` - Mark attendance
- `GET /api/attendance?action=report` - Get attendance report
- `GET /api/attendance?action=students` - Get students for attendance

### Marks
- `GET /api/marks` - Get marks records
- `POST /api/marks?action=add` - Add marks
- `GET /api/marks?action=report` - Get marks report
- `GET /api/marks?action=students` - Get students for marks
- `GET /api/marks?action=performance` - Get subject-wise performance

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/{id}` - Update department
- `DELETE /api/departments/{id}` - Delete department

## Database Schema

The system uses a normalized relational database with the following main tables:

- **users**: Authentication and user management
- **students**: Student information
- **faculty**: Faculty information
- **departments**: Organizational structure
- **subjects**: Academic subjects
- **batches**: Student batches/classes
- **attendance**: Attendance records
- **marks**: Academic performance
- **timetable**: Class schedules
- **faculty_subjects**: Faculty-subject assignments

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **Input Validation**: Server-side input validation and sanitization
- **Role-Based Access Control**: Granular permission system
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Development

### Adding New Features
1. Create corresponding controller in `api/controllers/`
2. Add routes in `api/index.php`
3. Create React components in `frontend/src/components/` or `frontend/src/pages/`
4. Add API service methods in `frontend/src/services/api.js`

### Code Structure
```
College management/
├── api/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   └── index.php
├── database/
│   └── schema.sql
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
