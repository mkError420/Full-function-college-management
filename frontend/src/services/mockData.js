// Mock Data Service for all CRUD operations

// Load initial data from localStorage or use defaults
const getInitialData = () => {
  const storedData = localStorage.getItem('medicalCollegeData');
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Initial mock data
  return {
    batches: [
      {
        id: 1,
        batch_name: 'MBBS 2021',
        batch_code: 'MBBS2021',
        department_id: 1,
        department_name: 'Medicine',
        start_date: '2021-08-01',
        end_date: '2027-06-30',
        strength: 150,
        status: 'active'
      },
      {
        id: 2,
        batch_name: 'MBBS 2022',
        batch_code: 'MBBS2022',
        department_id: 1,
        department_name: 'Medicine',
        start_date: '2022-08-01',
        end_date: '2028-06-30',
        strength: 160,
        status: 'active'
      },
      {
        id: 3,
        batch_name: 'MBBS 2023',
        batch_code: 'MBBS2023',
        department_id: 1,
        department_name: 'Medicine',
        start_date: '2023-08-01',
        end_date: '2029-06-30',
        strength: 170,
        status: 'active'
      }
    ],

    students: [
      {
        id: 1,
        user_id: 3,
        roll_number: 'MC2021001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@medicalcollege.edu',
        phone: '+1234567890',
        department_id: 1,
        department_name: 'Medicine',
        batch_id: 1,
        batch_name: 'MBBS 2021',
        semester: 3,
        date_of_birth: '2000-05-15',
        gender: 'male',
        address: '123 Main St, City, State',
        admission_date: '2021-08-01',
        status: 'active'
      },
      {
        id: 2,
        user_id: 4,
        roll_number: 'MC2021002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@medicalcollege.edu',
        phone: '+1234567891',
        department_id: 1,
        department_name: 'Medicine',
        batch_id: 1,
        batch_name: 'MBBS 2021',
        semester: 3,
        date_of_birth: '2000-08-20',
        gender: 'female',
        address: '456 Oak Ave, City, State',
        admission_date: '2021-08-01',
        status: 'active'
      }
    ],

    departments: [
      {
        id: 1,
        department_name: 'Medicine',
        department_code: 'MED',
        description: 'Department of General Medicine',
        head_of_department: null,
        created_at: '2024-01-01'
      },
      {
        id: 2,
        department_name: 'Surgery',
        department_code: 'SURG',
        description: 'Department of General Surgery',
        head_of_department: null,
        created_at: '2024-01-01'
      },
      {
        id: 3,
        department_name: 'Pediatrics',
        department_code: 'PED',
        description: 'Department of Pediatrics',
        head_of_department: null,
        created_at: '2024-01-01'
      }
    ],

    faculty: [
      {
        id: 1,
        user_id: 2,
        employee_id: 'EMP001',
        first_name: 'Dr. Robert',
        last_name: 'Johnson',
        email: 'robert.johnson@medicalcollege.edu',
        phone: '+1234567892',
        department_id: 1,
        department_name: 'Medicine',
        designation: 'Professor',
        specialization: 'Internal Medicine',
        joining_date: '2020-01-15',
        status: 'active'
      },
      {
        id: 2,
        user_id: 5,
        employee_id: 'EMP002',
        first_name: 'Dr. Sarah',
        last_name: 'Williams',
        email: 'sarah.williams@medicalcollege.edu',
        phone: '+1234567893',
        department_id: 1,
        department_name: 'Medicine',
        designation: 'Associate Professor',
        specialization: 'Cardiology',
        joining_date: '2021-03-20',
        status: 'active'
      }
    ],

    subjects: [
      {
        id: 1,
        subject_name: 'Anatomy',
        subject_code: 'ANAT101',
        department_id: 1,
        department_name: 'Medicine',
        credits: 4,
        semester: 1,
        description: 'Human Anatomy',
        status: 'active'
      },
      {
        id: 2,
        subject_name: 'Physiology',
        subject_code: 'PHYS101',
        department_id: 1,
        department_name: 'Medicine',
        credits: 4,
        semester: 1,
        description: 'Human Physiology',
        status: 'active'
      },
      {
        id: 3,
        subject_name: 'Pathology',
        subject_code: 'PATH101',
        department_id: 1,
        department_name: 'Medicine',
        credits: 3,
        semester: 2,
        description: 'General Pathology',
        status: 'active'
      }
    ],

    attendance: [
      {
        id: 1,
        student_id: 1,
        subject_id: 1,
        date: '2024-01-15',
        status: 'present',
        marked_by: 1,
        remarks: null
      },
      {
        id: 2,
        student_id: 1,
        subject_id: 2,
        date: '2024-01-16',
        status: 'absent',
        marked_by: 1,
        remarks: 'Sick leave'
      }
    ],

    marks: [
      {
        id: 1,
        student_id: 1,
        subject_id: 1,
        exam_type: 'mid_term',
        max_marks: 50,
        obtained_marks: 42,
        exam_date: '2024-01-20',
        remarks: 'Good performance'
      },
      {
        id: 2,
        student_id: 1,
        subject_id: 2,
        exam_type: 'mid_term',
        max_marks: 50,
        obtained_marks: 38,
        exam_date: '2024-01-20',
        remarks: 'Needs improvement'
      }
    ]
  };
};

// Get current data from localStorage
let mockData = getInitialData();

// Save data to localStorage
const saveData = () => {
  localStorage.setItem('medicalCollegeData', JSON.stringify(mockData));
};

// Mock API functions
export const mockAPI = {
  // Batches
  batches: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.batches];
      
      if (params.search) {
        filtered = filtered.filter(batch => 
          batch.batch_name.toLowerCase().includes(params.search.toLowerCase()) ||
          batch.batch_code.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      if (params.department_id) {
        filtered = filtered.filter(batch => batch.department_id == params.department_id);
      }
      
      return { data: filtered };
    },
    
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const batch = mockData.batches.find(b => b.id == id);
      return { data: batch };
    },
    
    create: async (batchData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newBatch = {
        id: Math.max(...mockData.batches.map(b => b.id), 0) + 1,
        ...batchData,
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.batches.push(newBatch);
      saveData();
      return { data: { success: true, message: 'Batch created successfully', batch: newBatch } };
    },
    
    update: async (id, batchData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const index = mockData.batches.findIndex(b => b.id == id);
      if (index !== -1) {
        mockData.batches[index] = { ...mockData.batches[index], ...batchData };
        saveData();
        return { data: { success: true, message: 'Batch updated successfully', batch: mockData.batches[index] } };
      }
      return { data: { success: false, message: 'Batch not found' } };
    },
    
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockData.batches.findIndex(b => b.id == id);
      if (index !== -1) {
        mockData.batches.splice(index, 1);
        saveData();
        return { data: { success: true, message: 'Batch deleted successfully' } };
      }
      return { data: { success: false, message: 'Batch not found' } };
    }
  },

  // Students
  students: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.students];
      
      if (params.search) {
        filtered = filtered.filter(student => 
          student.first_name.toLowerCase().includes(params.search.toLowerCase()) ||
          student.last_name.toLowerCase().includes(params.search.toLowerCase()) ||
          student.roll_number.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      if (params.department_id) {
        filtered = filtered.filter(student => student.department_id == params.department_id);
      }
      
      if (params.batch_id) {
        filtered = filtered.filter(student => student.batch_id == params.batch_id);
      }
      
      return { data: filtered };
    },
    
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const student = mockData.students.find(s => s.id == id);
      return { data: student };
    },
    
    create: async (studentData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newStudent = {
        id: Math.max(...mockData.students.map(s => s.id), 0) + 1,
        user_id: Math.max(...mockData.students.map(s => s.user_id), 0) + 1,
        ...studentData,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.students.push(newStudent);
      saveData();
      return { data: { success: true, message: 'Student created successfully', student: newStudent } };
    },
    
    update: async (id, studentData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const index = mockData.students.findIndex(s => s.id == id);
      if (index !== -1) {
        mockData.students[index] = { ...mockData.students[index], ...studentData };
        saveData();
        return { data: { success: true, message: 'Student updated successfully', student: mockData.students[index] } };
      }
      return { data: { success: false, message: 'Student not found' } };
    },
    
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockData.students.findIndex(s => s.id == id);
      if (index !== -1) {
        mockData.students.splice(index, 1);
        saveData();
        return { data: { success: true, message: 'Student deleted successfully' } };
      }
      return { data: { success: false, message: 'Student not found' } };
    }
  },

  // Departments
  departments: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.departments];
      
      if (params.search) {
        filtered = filtered.filter(dept => 
          dept.department_name.toLowerCase().includes(params.search.toLowerCase()) ||
          dept.department_code.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      return { data: filtered };
    },
    
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const department = mockData.departments.find(d => d.id == id);
      return { data: department };
    },
    
    create: async (deptData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newDept = {
        id: Math.max(...mockData.departments.map(d => d.id), 0) + 1,
        ...deptData,
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.departments.push(newDept);
      saveData();
      return { data: { success: true, message: 'Department created successfully', department: newDept } };
    },
    
    update: async (id, deptData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const index = mockData.departments.findIndex(d => d.id == id);
      if (index !== -1) {
        mockData.departments[index] = { ...mockData.departments[index], ...deptData };
        saveData();
        return { data: { success: true, message: 'Department updated successfully', department: mockData.departments[index] } };
      }
      return { data: { success: false, message: 'Department not found' } };
    },
    
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockData.departments.findIndex(d => d.id == id);
      if (index !== -1) {
        mockData.departments.splice(index, 1);
        saveData();
        return { data: { success: true, message: 'Department deleted successfully' } };
      }
      return { data: { success: false, message: 'Department not found' } };
    }
  },

  // Faculty
  faculty: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.faculty];
      
      if (params.search) {
        filtered = filtered.filter(faculty => 
          faculty.first_name.toLowerCase().includes(params.search.toLowerCase()) ||
          faculty.last_name.toLowerCase().includes(params.search.toLowerCase()) ||
          faculty.employee_id.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      if (params.department_id) {
        filtered = filtered.filter(faculty => faculty.department_id == params.department_id);
      }
      
      return { data: filtered };
    },
    
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const faculty = mockData.faculty.find(f => f.id == id);
      return { data: faculty };
    },
    
    create: async (facultyData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newFaculty = {
        id: Math.max(...mockData.faculty.map(f => f.id), 0) + 1,
        user_id: Math.max(...mockData.faculty.map(f => f.user_id), 0) + 1,
        ...facultyData,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.faculty.push(newFaculty);
      saveData();
      return { data: { success: true, message: 'Faculty created successfully', faculty: newFaculty } };
    },
    
    update: async (id, facultyData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const index = mockData.faculty.findIndex(f => f.id == id);
      if (index !== -1) {
        mockData.faculty[index] = { ...mockData.faculty[index], ...facultyData };
        saveData();
        return { data: { success: true, message: 'Faculty updated successfully', faculty: mockData.faculty[index] } };
      }
      return { data: { success: false, message: 'Faculty not found' } };
    },
    
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockData.faculty.findIndex(f => f.id == id);
      if (index !== -1) {
        mockData.faculty.splice(index, 1);
        saveData();
        return { data: { success: true, message: 'Faculty deleted successfully' } };
      }
      return { data: { success: false, message: 'Faculty not found' } };
    }
  },

  // Subjects
  subjects: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.subjects];
      
      if (params.search) {
        filtered = filtered.filter(subject => 
          subject.subject_name.toLowerCase().includes(params.search.toLowerCase()) ||
          subject.subject_code.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      if (params.department_id) {
        filtered = filtered.filter(subject => subject.department_id == params.department_id);
      }
      
      if (params.semester) {
        filtered = filtered.filter(subject => subject.semester == params.semester);
      }
      
      return { data: filtered };
    },
    
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const subject = mockData.subjects.find(s => s.id == id);
      return { data: subject };
    },
    
    create: async (subjectData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newSubject = {
        id: Math.max(...mockData.subjects.map(s => s.id), 0) + 1,
        ...subjectData,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.subjects.push(newSubject);
      saveData();
      return { data: { success: true, message: 'Subject created successfully', subject: newSubject } };
    },
    
    update: async (id, subjectData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const index = mockData.subjects.findIndex(s => s.id == id);
      if (index !== -1) {
        mockData.subjects[index] = { ...mockData.subjects[index], ...subjectData };
        saveData();
        return { data: { success: true, message: 'Subject updated successfully', subject: mockData.subjects[index] } };
      }
      return { data: { success: false, message: 'Subject not found' } };
    },
    
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockData.subjects.findIndex(s => s.id == id);
      if (index !== -1) {
        mockData.subjects.splice(index, 1);
        saveData();
        return { data: { success: true, message: 'Subject deleted successfully' } };
      }
      return { data: { success: false, message: 'Subject not found' } };
    }
  },

  // Attendance
  attendance: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.attendance];
      
      if (params.student_id) {
        filtered = filtered.filter(att => att.student_id == params.student_id);
      }
      
      if (params.subject_id) {
        filtered = filtered.filter(att => att.subject_id == params.subject_id);
      }
      
      if (params.date) {
        filtered = filtered.filter(att => att.date == params.date);
      }
      
      return { data: filtered };
    },
    
    create: async (attendanceData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newAttendance = {
        id: Math.max(...mockData.attendance.map(a => a.id), 0) + 1,
        ...attendanceData,
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.attendance.push(newAttendance);
      saveData();
      return { data: { success: true, message: 'Attendance marked successfully', attendance: newAttendance } };
    }
  },

  // Marks
  marks: {
    getAll: async (params = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockData.marks];
      
      if (params.student_id) {
        filtered = filtered.filter(mark => mark.student_id == params.student_id);
      }
      
      if (params.subject_id) {
        filtered = filtered.filter(mark => mark.subject_id == params.subject_id);
      }
      
      if (params.exam_type) {
        filtered = filtered.filter(mark => mark.exam_type == params.exam_type);
      }
      
      return { data: filtered };
    },
    
    create: async (marksData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newMarks = {
        id: Math.max(...mockData.marks.map(m => m.id), 0) + 1,
        ...marksData,
        created_at: new Date().toISOString().split('T')[0]
      };
      mockData.marks.push(newMarks);
      saveData();
      return { data: { success: true, message: 'Marks added successfully', marks: newMarks } };
    },
    
    update: async (id, marksData) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const index = mockData.marks.findIndex(m => m.id == id);
      if (index !== -1) {
        mockData.marks[index] = { ...mockData.marks[index], ...marksData };
        saveData();
        return { data: { success: true, message: 'Marks updated successfully', marks: mockData.marks[index] } };
      }
      return { data: { success: false, message: 'Marks not found' } };
    }
  }
};
