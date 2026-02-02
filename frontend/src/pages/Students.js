import React, { useState, useEffect } from 'react';
import { studentsAPI, departmentsAPI, batchesAPI } from '../services/api';
import { Users, Plus, Edit, Trash2, Search, Filter, Eye, EyeOff } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchBatches();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await batchesAPI.getAll();
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || student.department_id == filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'badge-error',
      graduated: 'badge-info',
      suspended: 'badge-warning'
    };
    return <span className={`badge ${styles[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await studentsAPI.delete(studentId);
        if (response.data && response.data.success) {
          fetchStudents();
          alert('Student deleted successfully!');
        } else {
          alert('Error deleting student: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student. Please try again.');
      }
    }
  };

  const handleSaveStudent = async (studentData) => {
    try {
      let response;
      if (editingStudent) {
        response = await studentsAPI.update(editingStudent.id, studentData);
      } else {
        response = await studentsAPI.create(studentData);
      }
      
      if (response.data && response.data.success) {
        setShowModal(false);
        fetchStudents();
        alert(editingStudent ? 'Student updated successfully!' : 'Student added successfully!');
      } else {
        alert('Error saving student: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-1 sm:px-2 lg:px-3">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded shadow p-2 text-white mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-bold">Students Management</h1>
              <p className="text-primary-100 text-xs">Manage student records</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm rounded px-3 py-1 text-white hover:bg-white/30 transition-colors flex items-center" onClick={handleAddStudent}>
              <Plus className="h-3 w-3 mr-1" />
              Add Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded shadow p-2 mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-secondary-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="input pl-7 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input text-xs"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
            <div className="flex items-center text-xs text-secondary-600">
              <Filter className="h-3 w-3 mr-1" />
              {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-secondary-200">
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Roll Number</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Username</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Password</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Name</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Department</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Batch</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Semester</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Status</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredStudents.map(student => {
                  const department = departments.find(dept => dept.id == student.department_id);
                  const batch = batches.find(b => b.id == student.batch_id);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 text-xs font-medium">{student.roll_number}</td>
                      <td className="px-2 py-1 text-xs text-primary-700 font-medium">{student.username}</td>
                      <td 
                        className="px-2 py-1 text-xs text-secondary-600 tracking-widest cursor-pointer hover:text-primary-600 font-medium" 
                        title="Click to change password"
                        onClick={() => handleEditStudent(student)}
                      >
                        ********
                      </td>
                      <td className="px-2 py-1 text-xs">{student.first_name} {student.last_name}</td>
                      <td className="px-2 py-1 text-xs">{department ? department.department_name : 'Unknown Department'}</td>
                      <td className="px-2 py-1 text-xs">{batch ? batch.batch_name : 'Unknown Batch'}</td>
                      <td className="px-2 py-1 text-xs">{student.semester}</td>
                      <td className="px-2 py-1 text-xs">{getStatusBadge(student.status)}</td>
                      <td className="px-2 py-1 text-xs">
                        <div className="flex space-x-1">
                          <button 
                            className="text-blue-600 hover:text-blue-800 p-1"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 p-1"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-secondary-900 mb-1">No students found</h3>
            <p className="text-xs text-secondary-500">Get started by adding a new student.</p>
          </div>
        )}

        {/* Student Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              
              <StudentForm 
                student={editingStudent}
                departments={departments}
                batches={batches}
                onSave={handleSaveStudent}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Student Form Component
const StudentForm = ({ student, departments, batches, onSave, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: student?.username || '',
    password: '',
    roll_number: student?.roll_number || '',
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    department_id: student?.department_id || '',
    batch_id: student?.batch_id || '',
    semester: student?.semester || 1,
    date_of_birth: student?.date_of_birth || '',
    gender: student?.gender || '',
    address: student?.address || '',
    admission_date: student?.admission_date || ''
  });

  // Update form data when student prop changes (for editing)
  useEffect(() => {
    setFormData({
      username: student?.username || '',
      password: '',
      roll_number: student?.roll_number || '',
      first_name: student?.first_name || '',
      last_name: student?.last_name || '',
      email: student?.email || '',
      phone: student?.phone || '',
      department_id: student?.department_id || '',
      batch_id: student?.batch_id || '',
      semester: student?.semester || 1,
      date_of_birth: student?.date_of_birth || '',
      gender: student?.gender || '',
      address: student?.address || '',
      admission_date: student?.admission_date || ''
    });
  }, [student]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., john.doe"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input text-xs pr-8"
              placeholder={student ? "Enter new password to change" : "Enter password"}
              required={!student}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-3 w-3 text-secondary-400" /> : <Eye className="h-3 w-3 text-secondary-400" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Roll Number</label>
          <input
            type="text"
            name="roll_number"
            value={formData.roll_number}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., 2024-001"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., John"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., Doe"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., john.doe@college.edu"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., +1234567890"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Department</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="input text-xs"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Batch</label>
          <select
            name="batch_id"
            value={formData.batch_id}
            onChange={handleChange}
            className="input text-xs"
            required
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.batch_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Semester</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="input text-xs"
            required
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input text-xs"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input text-xs"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Admission Date</label>
          <input
            type="date"
            name="admission_date"
            value={formData.admission_date}
            onChange={handleChange}
            className="input text-xs"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-secondary-700 mb-1">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="input text-xs"
          rows="2"
          placeholder="Student address..."
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary text-xs px-3 py-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary text-xs px-3 py-1"
        >
          {student ? 'Update' : 'Save'} Student
        </button>
      </div>
    </form>
  );
};

export default Students;
