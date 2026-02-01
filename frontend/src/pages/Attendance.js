import React, { useState, useEffect } from 'react';
import { attendanceAPI, subjectsAPI, departmentsAPI, studentsAPI } from '../services/api';
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchAttendance();
    fetchSubjects();
    fetchDepartments();
    fetchStudents();
    fetchAttendanceReport();
  }, []);

  // Debug: Log the component state
  useEffect(() => {
    console.log('Attendance Management - Current state:', { 
      attendanceLength: attendance.length, 
      studentsLength: students.length, 
      subjectsLength: subjects.length 
    });
  }, [attendance, students, subjects]);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAll();
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendanceReport = async () => {
    try {
      const response = await attendanceAPI.getReport();
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const student = students.find(s => s.id == record.student_id);
    const subject = subjects.find(s => s.id == record.subject_id);
    
    const studentName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
    const rollNumber = student ? student.roll_number.toLowerCase() : '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = studentName.includes(searchTermLower) ||
                         rollNumber.includes(searchTermLower);
    const matchesSubject = !filterSubject || record.subject_id == filterSubject;
    const matchesDate = !filterDate || record.date === filterDate;
    return matchesSearch && matchesSubject && matchesDate;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'badge-success',
      absent: 'badge-danger',
      late: 'badge-warning'
    };
    return <span className={`badge ${styles[status]}`}>{status}</span>;
  };

  const handleAddAttendance = () => {
    setEditingAttendance(null);
    setShowModal(true);
  };

  const handleEditAttendance = (attendance) => {
    setEditingAttendance(attendance);
    setShowModal(true);
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await attendanceAPI.delete(attendanceId);
        if (response.data && response.data.success) {
          fetchAttendance();
          alert('Attendance deleted successfully!');
        } else {
          alert('Error deleting attendance: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting attendance:', error);
        alert('Error deleting attendance. Please try again.');
      }
    }
  };

  const handleSaveAttendance = async (attendanceData) => {
    try {
      console.log('Saving attendance data:', attendanceData);
      
      let response;
      if (editingAttendance) {
        response = await attendanceAPI.update(editingAttendance.id, attendanceData);
      } else {
        response = await attendanceAPI.create(attendanceData);
      }
      
      console.log('Attendance save response:', response);
      
      if (response.data && response.data.success) {
        setShowModal(false);
        fetchAttendance();
        alert(editingAttendance ? 'Attendance updated successfully!' : 'Attendance marked successfully!');
      } else {
        alert('Error saving attendance: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance. Please try again.');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900">Attendance Management</h1>
        <button className="btn btn-primary flex items-center" onClick={handleAddAttendance}>
          <Calendar className="h-4 w-4 mr-2" />
          Mark Attendance
        </button>
      </div>

      {/* Attendance Summary */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Classes</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.total_classes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Present</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.present_count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Absent</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.absent_count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Late</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.late_count}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="input"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <div className="flex items-center text-sm text-secondary-600">
            <Filter className="h-4 w-4 mr-2" />
            {filteredAttendance.length} records
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Faculty</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(record => {
                const student = students.find(s => s.id == record.student_id);
                const subject = subjects.find(s => s.id == record.subject_id);
                
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className="ml-2">
                          {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                        </span>
                      </div>
                    </td>
                    <td className="font-medium">{student ? student.roll_number : 'N/A'}</td>
                    <td>{subject ? subject.subject_name : 'Unknown Subject'}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td>Admin</td>
                    <td className="text-sm text-secondary-600">{record.remarks || '-'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditAttendance(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteAttendance(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {filteredAttendance.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No attendance records found</h3>
          <p className="text-secondary-500">Start marking attendance to see records here.</p>
        </div>
      )}

      {/* Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
            </h2>
            
            <AttendanceForm 
              attendance={editingAttendance}
              students={students}
              subjects={subjects}
              onSave={handleSaveAttendance}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Form Component
const AttendanceForm = ({ attendance, students, subjects, onSave, onCancel }) => {
  console.log('AttendanceForm props:', { attendance, students, subjects });
  
  const [formData, setFormData] = useState({
    student_id: attendance?.student_id || '',
    subject_id: attendance?.subject_id || '',
    date: attendance?.date || new Date().toISOString().split('T')[0],
    status: attendance?.status || 'present',
    remarks: attendance?.remarks || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.student_id || !formData.subject_id || !formData.date || !formData.status) {
      console.error('Missing required fields:', formData);
      alert('Please fill all required fields');
      return;
    }
    
    console.log('All fields valid, calling onSave...');
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Student</label>
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.first_name} {student.last_name} ({student.roll_number})
              </option>
            ))}
          </select>
          {students.length === 0 && <p className="text-red-500 text-sm mt-1">No students available</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Subject</label>
          <select
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
          {subjects.length === 0 && <p className="text-red-500 text-sm mt-1">No subjects available</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Remarks</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          className="input"
          rows="3"
          placeholder="Additional remarks..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {attendance ? 'Update' : 'Save'} Attendance
        </button>
      </div>
    </form>
  );
};

export default Attendance;
