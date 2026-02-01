import React, { useState, useEffect } from 'react';
import { attendanceAPI, subjectsAPI, departmentsAPI } from '../services/api';
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchAttendance();
    fetchSubjects();
    fetchDepartments();
    fetchAttendanceReport();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAll();
      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
    const matchesSearch = record.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
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
        <button className="btn btn-primary flex items-center">
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
              <option key={subject.subject_id} value={subject.subject_id}>
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
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(record => (
                <tr key={record.attendance_id}>
                  <td>
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-2">
                        {record.first_name} {record.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="font-medium">{record.roll_number}</td>
                  <td>{record.subject_name}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td>{record.faculty_first_name} {record.faculty_last_name}</td>
                  <td className="text-sm text-secondary-600">{record.remarks || '-'}</td>
                </tr>
              ))}
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
    </div>
  );
};

export default Attendance;
