import React, { useState, useEffect } from 'react';
import { facultyAPI, departmentsAPI } from '../services/api';
import { GraduationCap, Plus, Edit, Trash2, Search, Mail, Phone } from 'lucide-react';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await facultyAPI.getAll();
      if (response.data.success) {
        setFaculty(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
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

  const filteredFaculty = faculty.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button className="btn btn-primary flex items-center" onClick={() => setShowModal(true)}>
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
        {filteredFaculty.map(member => (
          <div key={member.faculty_id} className="card">
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
                  {member.department_name}
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

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No faculty found</h3>
          <p className="text-secondary-500">Get started by adding a new faculty member.</p>
        </div>
      )}
    </div>
  );
};

export default Faculty;
