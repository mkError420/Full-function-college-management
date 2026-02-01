import React, { useState, useEffect } from 'react';
import { departmentsAPI } from '../services/api';
import { Building, Plus, Edit, Trash2, Search, Users, GraduationCap, BookOpen } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const response = await departmentsAPI.getAll();
      console.log('Departments response:', response);
      setDepartments(response.data);
      console.log('Departments set:', response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.department_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentsAPI.delete(departmentId);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      if (editingDepartment) {
        await departmentsAPI.update(editingDepartment.id, departmentData);
      } else {
        await departmentsAPI.create(departmentData);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
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
        <h1 className="text-2xl font-bold text-secondary-900">Departments Management</h1>
        <button className="btn btn-primary flex items-center" onClick={handleAddDepartment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search departments..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map(department => (
          <div key={department.id} className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-secondary-900">{department.department_name}</h3>
                  <p className="text-sm text-secondary-500">{department.department_code}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-secondary-600">
                    <Users className="h-4 w-4 mr-2" />
                    Students
                  </div>
                  <span className="font-medium text-secondary-900">0</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-secondary-600">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Faculty
                  </div>
                  <span className="font-medium text-secondary-900">0</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-secondary-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Subjects
                  </div>
                  <span className="font-medium text-secondary-900">0</span>
                </div>
              </div>

              {department.description && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <p className="text-sm text-secondary-600 line-clamp-2">
                    {department.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditDepartment(department)}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteDepartment(department.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No departments found</h3>
          <p className="text-secondary-500">Get started by adding a new department.</p>
        </div>
      )}

      {/* Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h2>
            
            <DepartmentForm 
              department={editingDepartment}
              onSave={handleSaveDepartment}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Department Form Component
const DepartmentForm = ({ department, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    department_name: department?.department_name || '',
    department_code: department?.department_code || '',
    description: department?.description || ''
  });

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
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Department Name</label>
        <input
          type="text"
          name="department_name"
          value={formData.department_name}
          onChange={handleChange}
          className="input"
          placeholder="e.g., Medicine"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Department Code</label>
        <input
          type="text"
          name="department_code"
          value={formData.department_code}
          onChange={handleChange}
          className="input"
          placeholder="e.g., MED"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="4"
          placeholder="Department description..."
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
          {department ? 'Update' : 'Save'} Department
        </button>
      </div>
    </form>
  );
};

export default Departments;
