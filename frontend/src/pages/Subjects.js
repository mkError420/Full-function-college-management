import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subjectsAPI, departmentsAPI } from '../services/api';
import { BookOpen, Plus, Edit, Trash2, Search, Clock } from 'lucide-react';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || subject.department_id == filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getSemesterBadge = (semester) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 
                       'bg-purple-100 text-purple-800', 'bg-red-100 text-red-800'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[semester - 1] || colors[0]}`}>Semester {semester}</span>;
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setShowModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await subjectsAPI.delete(subjectId);
        if (response.data && response.data.success) {
          fetchSubjects();
          alert('Subject deleted successfully!');
        } else {
          alert('Error deleting subject: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject. Please try again.');
      }
    }
  };

  const handleSaveSubject = async (subjectData) => {
    try {
      let response;
      if (editingSubject) {
        response = await subjectsAPI.update(editingSubject.id, subjectData);
      } else {
        response = await subjectsAPI.create(subjectData);
      }
      
      if (response.data && response.data.success) {
        setShowModal(false);
        fetchSubjects();
        alert(editingSubject ? 'Subject updated successfully!' : 'Subject added successfully!');
      } else {
        alert('Error saving subject: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Error saving subject. Please try again.');
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
        <h1 className="text-2xl font-bold text-secondary-900">Subjects Management</h1>
        {user && user.role !== 'student' && (
          <button className="btn btn-primary flex items-center" onClick={handleAddSubject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </button>
        )}
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
              <option key={dept.id} value={dept.id}>
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
          <div key={subject.id} className="card">
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

              {user && user.role !== 'student' && (
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditSubject(subject)}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteSubject(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              )}
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

      {/* Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            
            <SubjectForm 
              subject={editingSubject}
              departments={departments}
              onSave={handleSaveSubject}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Subject Form Component
const SubjectForm = ({ subject, departments, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    subject_name: subject?.subject_name || '',
    subject_code: subject?.subject_code || '',
    department_id: subject?.department_id || '',
    semester: subject?.semester || '',
    credit_hours: subject?.credit_hours || '',
    description: subject?.description || ''
  });

  // Update form data when subject prop changes (for editing)
  useEffect(() => {
    setFormData({
      subject_name: subject?.subject_name || '',
      subject_code: subject?.subject_code || '',
      department_id: subject?.department_id || '',
      semester: subject?.semester || '',
      credit_hours: subject?.credit_hours || '',
      description: subject?.description || ''
    });
  }, [subject]);

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
          <label className="block text-sm font-medium text-secondary-700 mb-1">Subject Name</label>
          <input
            type="text"
            name="subject_name"
            value={formData.subject_name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Anatomy"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Subject Code</label>
          <input
            type="text"
            name="subject_code"
            value={formData.subject_code}
            onChange={handleChange}
            className="input"
            placeholder="e.g., ANAT101"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Department</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="input"
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
          <label className="block text-sm font-medium text-secondary-700 mb-1">Semester</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Credit Hours</label>
          <input
            type="number"
            name="credit_hours"
            value={formData.credit_hours}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 3"
            min="1"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="3"
          placeholder="Subject description..."
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
          {subject ? 'Update' : 'Save'} Subject
        </button>
      </div>
    </form>
  );
};

export default Subjects;
