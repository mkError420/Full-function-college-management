import React, { useState, useEffect } from 'react';
import { marksAPI, subjectsAPI, departmentsAPI } from '../services/api';
import { Award, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

const Marks = () => {
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchMarks();
    fetchSubjects();
    fetchDepartments();
    fetchMarksReport();
  }, []);

  const fetchMarks = async () => {
    try {
      const response = await marksAPI.getAll();
      if (response.data.success) {
        setMarks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
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
    const matchesSearch = record.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
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
        <button className="btn btn-primary flex items-center">
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
              <option key={subject.subject_id} value={subject.subject_id}>
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
              </tr>
            </thead>
            <tbody>
              {filteredMarks.map(record => {
                const percentage = Math.round((record.obtained_marks / record.max_marks) * 100);
                return (
                  <tr key={record.mark_id}>
                    <td>{record.first_name} {record.last_name}</td>
                    <td className="font-medium">{record.roll_number}</td>
                    <td>{record.subject_name}</td>
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
                    <td>{record.faculty_first_name} {record.faculty_last_name}</td>
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
          <p className="text-secondary-500">Start adding marks to see records here.</p>
        </div>
      )}
    </div>
  );
};

export default Marks;
