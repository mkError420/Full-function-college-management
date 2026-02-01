import React, { useState, useEffect } from 'react';
import { subjectsAPI, departmentsAPI } from '../services/api';
import { BookOpen, Plus, Edit, Trash2, Search, Clock } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
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

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || subject.department_id == filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getSemesterBadge = (semester) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 
                   'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-indigo-100 text-indigo-800'];
    return <span className={`badge ${colors[(semester - 1) % colors.length]}`}>Semester {semester}</span>;
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
        <h1 className="text-2xl font-bold text-secondary-900">Subjects Management</h1>
        <button className="btn btn-primary flex items-center" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_name}
              </option>
            ))}
          </select>
          <div className="flex items-center text-sm text-secondary-600">
            <BookOpen className="h-4 w-4 mr-2" />
            {filteredSubjects.length} of {subjects.length} subjects
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map(subject => (
          <div key={subject.subject_id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-secondary-900">{subject.subject_name}</h3>
                    <p className="text-sm text-secondary-500">{subject.subject_code}</p>
                  </div>
                </div>
                {getSemesterBadge(subject.semester)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-secondary-600">
                  <span className="font-medium">Department:</span>
                  <span className="ml-2">{subject.department_name}</span>
                </div>
                <div className="flex items-center text-secondary-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-medium">Credit Hours:</span>
                  <span className="ml-2">{subject.credit_hours}</span>
                </div>
              </div>

              {subject.description && (
                <div className="mt-3 pt-3 border-t border-secondary-200">
                  <p className="text-sm text-secondary-600 line-clamp-2">
                    {subject.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No subjects found</h3>
          <p className="text-secondary-500">Get started by adding a new subject.</p>
        </div>
      )}
    </div>
  );
};

export default Subjects;
