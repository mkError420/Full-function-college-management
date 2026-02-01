import React, { useState, useEffect } from 'react';
import { marksAPI, subjectsAPI, departmentsAPI, studentsAPI } from '../services/api';
import { Award, Search, Filter, TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';

const Marks = () => {
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [reportData, setReportData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchMarks();
    fetchSubjects();
    fetchDepartments();
    fetchStudents();
    fetchMarksReport();
  }, []);

  const fetchMarks = async () => {
    try {
      const response = await marksAPI.getAll();
      setMarks(response.data);
    } catch (error) {
      console.error('Error fetching marks:', error);
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

  const fetchMarksReport = async () => {
    try {
      const response = await marksAPI.getReport();
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching marks report:', error);
    }
  };

  const filteredMarks = marks.filter(record => {
    const student = students.find(s => s.id == record.student_id);
    const subject = subjects.find(s => s.id == record.subject_id);
    
    const studentName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
    const rollNumber = student ? student.roll_number.toLowerCase() : '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = studentName.includes(searchTermLower) ||
                         rollNumber.includes(searchTermLower);
    const matchesSubject = !filterSubject || record.subject_id == filterSubject;
    const matchesExamType = !filterExamType || record.exam_type === filterExamType;
    return matchesSearch && matchesSubject && matchesExamType;
  });

  const getExamTypeBadge = (examType) => {
    const colors = {
      quiz: 'badge-info',
      assignment: 'badge-warning',
      mid_term: 'badge-success',
      final: 'badge-danger',
      practical: 'badge-secondary'
    };
    return <span className={`badge ${colors[examType]}`}>{examType.replace('_', ' ')}</span>;
  };

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage >= 60) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddMark = () => {
    setEditingMark(null);
    setShowModal(true);
  };

  const handleEditMark = (mark) => {
    setEditingMark(mark);
    setShowModal(true);
  };

  const handleDeleteMark = async (markId) => {
    if (window.confirm('Are you sure you want to delete this mark record?')) {
      try {
        await marksAPI.delete(markId);
        fetchMarks();
      } catch (error) {
        console.error('Error deleting mark:', error);
      }
    }
  };

  const handleSaveMark = async (markData) => {
    try {
      if (editingMark) {
        await marksAPI.update(editingMark.id, markData);
      } else {
        await marksAPI.create(markData);
      }
      setShowModal(false);
      fetchMarks();
    } catch (error) {
      console.error('Error saving mark:', error);
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
        <h1 className="text-2xl font-bold text-secondary-900">Marks Management</h1>
        <button className="btn btn-primary flex items-center" onClick={handleAddMark}>
          <Award className="h-4 w-4 mr-2" />
          Add Marks
        </button>
      </div>

      {/* Performance Summary */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Exams</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.total_exams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Average %</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.average_marks || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Highest</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.highest_marks || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Lowest</p>
                <p className="text-2xl font-semibold text-secondary-900">{reportData.lowest_marks || 0}</p>
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
          <select
            className="input"
            value={filterExamType}
            onChange={(e) => setFilterExamType(e.target.value)}
          >
            <option value="">All Exam Types</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
            <option value="mid_term">Mid Term</option>
            <option value="final">Final</option>
            <option value="practical">Practical</option>
          </select>
          <div className="flex items-center text-sm text-secondary-600">
            <Filter className="h-4 w-4 mr-2" />
            {filteredMarks.length} records
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Date</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th>Faculty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarks.map(record => {
                const student = students.find(s => s.id == record.student_id);
                const subject = subjects.find(s => s.id == record.subject_id);
                const percentage = Math.round((record.obtained_marks / record.max_marks) * 100);
                
                return (
                  <tr key={record.id}>
                    <td>{student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}</td>
                    <td className="font-medium">{student ? student.roll_number : 'N/A'}</td>
                    <td>{subject ? subject.subject_name : 'Unknown Subject'}</td>
                    <td>{getExamTypeBadge(record.exam_type)}</td>
                    <td>{new Date(record.exam_date).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center">
                        {getPerformanceIcon(percentage)}
                        <span className="ml-2 font-medium">
                          {record.obtained_marks}/{record.max_marks}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`font-medium ${getPerformanceColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </td>
                    <td>Admin</td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditMark(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteMark(record.id)}
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

      {filteredMarks.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No marks found</h3>
          <p className="text-secondary-500">Get started by adding new marks.</p>
        </div>
      )}
      
      {/* Marks Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingMark ? 'Edit Marks' : 'Add New Marks'}
            </h2>
            
            <MarksForm 
              mark={editingMark}
              students={students}
              subjects={subjects}
              onSave={handleSaveMark}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Marks Form Component
const MarksForm = ({ mark, students, subjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    student_id: mark?.student_id || '',
    subject_id: mark?.subject_id || '',
    exam_type: mark?.exam_type || '',
    max_marks: mark?.max_marks || '',
    obtained_marks: mark?.obtained_marks || '',
    exam_date: mark?.exam_date || '',
    remarks: mark?.remarks || ''
  });

  // Update form data when mark prop changes (for editing)
  useEffect(() => {
    setFormData({
      student_id: mark?.student_id || '',
      subject_id: mark?.subject_id || '',
      exam_type: mark?.exam_type || '',
      max_marks: mark?.max_marks || '',
      obtained_marks: mark?.obtained_marks || '',
      exam_date: mark?.exam_date || '',
      remarks: mark?.remarks || ''
    });
  }, [mark]);

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
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Exam Type</label>
          <select
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Exam Type</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
            <option value="mid_term">Mid Term</option>
            <option value="final">Final</option>
            <option value="practical">Practical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Max Marks</label>
          <input
            type="number"
            name="max_marks"
            value={formData.max_marks}
            onChange={handleChange}
            className="input"
            placeholder="Maximum marks"
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Obtained Marks</label>
          <input
            type="number"
            name="obtained_marks"
            value={formData.obtained_marks}
            onChange={handleChange}
            className="input"
            placeholder="Obtained marks"
            min="0"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Exam Date</label>
          <input
            type="date"
            name="exam_date"
            value={formData.exam_date}
            onChange={handleChange}
            className="input"
            required
          />
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
          {mark ? 'Update' : 'Save'} Marks
        </button>
      </div>
    </form>
  );
};

export default Marks;
