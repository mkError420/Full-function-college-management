import React, { useState, useEffect } from 'react';
import { facultyAPI, departmentsAPI } from '../services/api';
import { GraduationCap, Plus, Edit, Trash2, Search, Mail, Phone } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900">Faculty Management</h1>
        <button className="btn btn-primary flex items-center" onClick={handleAddFaculty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search faculty..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map(member => {
          const department = departments.find(dept => dept.id == member.department_id);
          return (
            <div key={member.id} className="card">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-secondary-900">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-sm text-secondary-500">{member.designation}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-secondary-600">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {department ? department.department_name : 'Unknown Department'}
                  </div>
                  {member.email && (
                    <div className="flex items-center text-secondary-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {member.email}
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center text-secondary-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {member.phone}
                    </div>
                  )}
                </div>

                {member.qualification && (
                  <div className="mt-3 pt-3 border-t border-secondary-200">
                    <p className="text-sm text-secondary-600">
                      <strong>Qualification:</strong> {member.qualification}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditFaculty(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteFaculty(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No faculty found</h3>
          <p className="text-secondary-500">Get started by adding a new faculty member.</p>
        </div>
      )}

      {/* Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
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
  );
};

// Faculty Form Component
const FacultyForm = ({ faculty, departments, onSave, onCancel }) => {
  console.log('FacultyForm props:', { faculty, departments });
  console.log('Departments length:', departments?.length || 0);
  console.log('Departments data:', departments);
  
  const [formData, setFormData] = useState({
    first_name: faculty?.first_name || '',
    last_name: faculty?.last_name || '',
    email: faculty?.email || '',
    phone: faculty?.phone || '',
    department_id: faculty?.department_id || '',
    designation: faculty?.designation || '',
    qualification: faculty?.qualification || '',
    address: faculty?.address || ''
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
      address: faculty?.address || ''
    });
  }, [faculty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Department ID being saved:', formData.department_id);
    onSave(formData);
  };

  const handleChange = (e) => {
    console.log('Form field changed:', e.target.name, e.target.value);
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    console.log('New form data:', newFormData);
    setFormData(newFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., John"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Doe"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="e.g., john.doe@college.edu"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="e.g., +1234567890"
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
            {departments.map(dept => {
              console.log('Rendering department option:', dept);
              return (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              );
            })}
          </select>
          {departments.length === 0 && <p className="text-red-500 text-sm mt-1">No departments available</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Designation</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Professor"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Qualification</label>
        <input
          type="text"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          className="input"
          placeholder="e.g., PhD in Computer Science"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="input"
          rows="3"
          placeholder="Faculty member address..."
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
          {faculty ? 'Update' : 'Save'} Faculty
        </button>
      </div>
    </form>
  );
};

export default Faculty;
