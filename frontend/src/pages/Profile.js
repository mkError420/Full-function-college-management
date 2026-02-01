import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setProfileData(response.data.user);
        setFormData({
          email: response.data.user.email,
          phone: response.data.user.details?.phone || '',
          address: response.data.user.details?.address || '',
          date_of_birth: response.data.user.details?.date_of_birth || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile logic would go here
      console.log('Saving profile:', formData);
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profileData?.email || '',
      phone: profileData?.details?.phone || '',
      address: profileData?.details?.address || '',
      date_of_birth: profileData?.details?.date_of_birth || '',
    });
    setEditing(false);
  };

  const getRoleSpecificInfo = () => {
    if (!profileData?.details) return null;

    switch (profileData.role) {
      case 'student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-secondary-600">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="font-medium">Roll Number:</span>
              <span className="ml-2">{profileData.details.roll_number}</span>
            </div>
            <div className="flex items-center text-secondary-600">
              <Award className="h-4 w-4 mr-2" />
              <span className="font-medium">Semester:</span>
              <span className="ml-2">{profileData.details.semester}</span>
            </div>
            <div className="flex items-center text-secondary-600">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="font-medium">Department:</span>
              <span className="ml-2">{profileData.details.department_name}</span>
            </div>
            <div className="flex items-center text-secondary-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">Batch:</span>
              <span className="ml-2">{profileData.details.batch_name}</span>
            </div>
          </div>
        );
      case 'faculty':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-secondary-600">
              <Award className="h-4 w-4 mr-2" />
              <span className="font-medium">Designation:</span>
              <span className="ml-2">{profileData.details.designation || 'N/A'}</span>
            </div>
            <div className="flex items-center text-secondary-600">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="font-medium">Department:</span>
              <span className="ml-2">{profileData.details.department_name}</span>
            </div>
            <div className="flex items-center text-secondary-600">
              <Award className="h-4 w-4 mr-2" />
              <span className="font-medium">Experience:</span>
              <span className="ml-2">{profileData.details.experience_years || 0} years</span>
            </div>
            <div className="flex items-center text-secondary-600">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="font-medium">Qualification:</span>
              <span className="ml-2">{profileData.details.qualification || 'N/A'}</span>
            </div>
          </div>
        );
      default:
        return null;
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
        <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
        {!editing && (
          <button className="btn btn-secondary flex items-center" onClick={() => setEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body text-center">
              <div className="h-24 w-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-900">
                {profileData?.details?.first_name || profileData?.username}
              </h2>
              <p className="text-secondary-500 mb-4">
                {profileData?.role?.charAt(0).toUpperCase() + profileData?.role?.slice(1)}
              </p>
              <span className="badge badge-info">
                {profileData?.role?.charAt(0).toUpperCase() + profileData?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">Personal Information</h3>
              {editing && (
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-primary flex items-center text-sm" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="btn btn-secondary flex items-center text-sm" 
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="card-body space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-secondary-600">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">Username:</span>
                  <span className="ml-2">{profileData?.username}</span>
                </div>
                <div className="flex items-center text-secondary-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="font-medium">Email:</span>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      className="input ml-2"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="ml-2">{profileData?.email}</span>
                  )}
                </div>
                <div className="flex items-center text-secondary-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="font-medium">Phone:</span>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="input ml-2"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="ml-2">{profileData?.details?.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center text-secondary-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Date of Birth:</span>
                  {editing ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      className="input ml-2"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="ml-2">
                      {profileData?.details?.date_of_birth 
                        ? new Date(profileData.details.date_of_birth).toLocaleDateString()
                        : 'Not provided'
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center text-secondary-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-medium">Address:</span>
                </div>
                {editing ? (
                  <textarea
                    name="address"
                    className="input w-full"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-secondary-600 ml-6">
                    {profileData?.details?.address || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Role-specific Information */}
              {getRoleSpecificInfo()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
