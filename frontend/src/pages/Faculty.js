import React, { useState, useEffect } from 'react';
import { facultyAPI, departmentsAPI } from '../services/api';
import { GraduationCap, Plus, Edit, Trash2, Search, Mail, Phone, Calendar } from 'lucide-react';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  // Debug: Log component state
  useEffect(() => {
    console.log('Faculty Management - Current state:', { 
      facultyLength: faculty.length, 
      departmentsLength: departments.length 
    });
  }, [faculty, departments]);

  const fetchFaculty = async () => {
    try {
      const response = await facultyAPI.getAll();
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments for faculty...');
      const response = await departmentsAPI.getAll();
      console.log('Departments response:', response);
      console.log('Departments data:', response.data);
      setDepartments(response.data);
      console.log('Departments state set to:', response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const filteredFaculty = faculty.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFaculty = () => {
    setEditingFaculty(null);
    setShowModal(true);
  };

  const handleEditFaculty = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setShowModal(true);
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        const response = await facultyAPI.delete(facultyId);
        if (response.data && response.data.success) {
          fetchFaculty();
          alert('Faculty member deleted successfully!');
        } else {
          alert('Error deleting faculty member: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert('Error deleting faculty member. Please try again.');
      }
    }
  };

  const handleSaveFaculty = async (facultyData) => {
    try {
      console.log('Saving faculty data:', facultyData);
      let response;
      if (editingFaculty) {
        response = await facultyAPI.update(editingFaculty.id, facultyData);
      } else {
        response = await facultyAPI.create(facultyData);
      }
      
      console.log('Faculty save response:', response);
      
      if (response.data && response.data.success) {
        setShowModal(false);
        fetchFaculty();
        alert(editingFaculty ? 'Faculty member updated successfully!' : 'Faculty member added successfully!');
      } else {
        alert('Error saving faculty member: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      alert('Error saving faculty member. Please try again.');
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
              <h1 className="text-base sm:text-lg font-bold">Faculty Management</h1>
              <p className="text-primary-100 text-xs">Manage faculty members</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm rounded px-3 py-1 text-white hover:bg-white/30 transition-colors flex items-center" onClick={handleAddFaculty}>
              <Plus className="h-3 w-3 mr-1" />
              Add Faculty
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded shadow p-2 mb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-secondary-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              className="input pl-7 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filteredFaculty.map(member => {
            const department = departments.find(dept => dept.id == member.department_id);
            return (
              <div key={member.id} className="bg-white rounded shadow hover:shadow-md transition-shadow p-3 border border-secondary-100">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-2">
                    <h3 className="font-semibold text-secondary-900 text-sm">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-xs text-secondary-500">{member.designation}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex items-center text-secondary-600">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {department ? department.department_name : 'Unknown Department'}
                  </div>
                  {member.email && (
                    <div className="flex items-center text-secondary-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {member.email}
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center text-secondary-600">
                      <Phone className="h-3 w-3 mr-1" />
                      {member.phone}
                    </div>
                  )}
                  <div className="flex items-center text-secondary-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined: {member.joining_date}
                  </div>
                </div>

                <div className="flex justify-end space-x-1 mt-3">
                  <button 
                    className="text-blue-600 hover:text-blue-800 p-1"
                    onClick={() => handleEditFaculty(member)}
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 p-1"
                    onClick={() => handleDeleteFaculty(member.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFaculty.length === 0 && (
          <div className="text-center py-8">
            <GraduationCap className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-secondary-900 mb-1">No faculty found</h3>
            <p className="text-xs text-secondary-500">Get started by adding a new faculty member.</p>
          </div>
        )}

        {/* Faculty Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
              </h2>
              
              <FacultyForm 
                faculty={editingFaculty}
                departments={departments}
                onSave={handleSaveFaculty}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Faculty Form Component
const FacultyForm = ({ faculty, departments, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: faculty?.first_name || '',
    last_name: faculty?.last_name || '',
    email: faculty?.email || '',
    phone: faculty?.phone || '',
    department_id: faculty?.department_id || '',
    designation: faculty?.designation || '',
    qualification: faculty?.qualification || '',
    joining_date: faculty?.joining_date || ''
  });

  // Update form data when faculty prop changes (for editing)
  useEffect(() => {
    setFormData({
      first_name: faculty?.first_name || '',
      last_name: faculty?.last_name || '',
      email: faculty?.email || '',
      phone: faculty?.phone || '',
      department_id: faculty?.department_id || '',
      designation: faculty?.designation || '',
      qualification: faculty?.qualification || '',
      joining_date: faculty?.joining_date || ''
    });
  }, [faculty]);

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
          <label className="block text-xs font-medium text-secondary-700 mb-1">Designation</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., Professor"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Qualification</label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., PhD in Medicine"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Joining Date</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            className="input text-xs"
            required
          />
        </div>
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
          {faculty ? 'Update' : 'Save'} Faculty
        </button>
      </div>
    </form>
  );
};

export default Faculty;
