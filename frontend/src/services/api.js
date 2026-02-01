import axios from 'axios';
import { mockAuthAPI } from './mockAuth';
import { mockAPI } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Using Mock
export const authAPI = {
  login: mockAuthAPI.login,
  register: mockAuthAPI.register,
  getProfile: mockAuthAPI.getProfile,
};

// Batches API - Using Mock
export const batchesAPI = {
  getAll: mockAPI.batches.getAll,
  getById: mockAPI.batches.getById,
  create: mockAPI.batches.create,
  update: mockAPI.batches.update,
  delete: mockAPI.batches.delete,
};

// Students API - Using Mock
export const studentsAPI = {
  getAll: mockAPI.students.getAll,
  getById: mockAPI.students.getById,
  create: mockAPI.students.create,
  update: mockAPI.students.update,
  delete: mockAPI.students.delete,
  getAttendance: mockAPI.attendance.getAll,
};

// Faculty API - Using Mock
export const facultyAPI = {
  getAll: mockAPI.faculty.getAll,
  getById: mockAPI.faculty.getById,
  create: mockAPI.faculty.create,
  update: mockAPI.faculty.update,
  delete: mockAPI.faculty.delete,
  getSubjects: () => Promise.resolve({ data: [] }),
  getTimetable: () => Promise.resolve({ data: [] }),
};

// Subjects API - Using Mock
export const subjectsAPI = {
  getAll: mockAPI.subjects.getAll,
  getById: mockAPI.subjects.getById,
  create: mockAPI.subjects.create,
  update: mockAPI.subjects.update,
  delete: mockAPI.subjects.delete,
};

// Departments API - Using Mock
export const departmentsAPI = {
  getAll: mockAPI.departments.getAll,
  getById: mockAPI.departments.getById,
  create: mockAPI.departments.create,
  update: mockAPI.departments.update,
  delete: mockAPI.departments.delete,
  getFaculty: mockAPI.faculty.getAll,
  getStudents: mockAPI.students.getAll,
};

// Attendance API - Using Mock
export const attendanceAPI = {
  getAll: mockAPI.attendance.getAll,
  create: mockAPI.attendance.create,
  update: mockAPI.attendance.update,
  getStudents: mockAPI.students.getAll,
  getSubjects: mockAPI.subjects.getAll,
  getReport: mockAPI.attendance.getAll,
};

// Marks API - Using Mock
export const marksAPI = {
  getAll: mockAPI.marks.getAll,
  create: mockAPI.marks.create,
  update: mockAPI.marks.update,
  getStudents: mockAPI.students.getAll,
  getSubjects: mockAPI.subjects.getAll,
  getReport: mockAPI.marks.getAll,
  getSubjectPerformance: mockAPI.marks.getAll,
};

export default api;
