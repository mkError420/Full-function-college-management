import React, { useState, useEffect } from 'react';
import { batchesAPI, departmentsAPI } from '../services/api';
import { Calendar, Plus, Edit, Trash2, Search, Users, Filter, Building } from 'lucide-react';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  useEffect(() => {
    fetchBatches();
    fetchDepartments();
  }, []);

  // Debug: Log component state after changes
  useEffect(() => {
    console.log('Batches component state updated:', { 
      batchesLength: batches.length,
      batchesData: batches.slice(0, 3) // Show first 3 batches for debugging
    });
  }, [batches]);

  const fetchBatches = async () => {
    try {
      console.log('Fetching batches...');
      const response = await batchesAPI.getAll();
      console.log('Batches response:', response);
      console.log('Batches data:', response.data);
      setBatches(response.data);
      console.log('Batches state set to:', response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments for batches:', error);
    }
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batch_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || batch.department_id == filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'badge-error',
      completed: 'badge-info',
      suspended: 'badge-warning'
    };
    return <span className={`badge ${styles[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const handleAddBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        const response = await batchesAPI.delete(batchId);
        if (response.data && response.data.success) {
          fetchBatches();
          alert('Batch deleted successfully!');
        } else {
          alert('Error deleting batch: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Error deleting batch. Please try again.');
      }
    }
  };

  const handleSaveBatch = async (batchData) => {
    try {
      console.log('Saving batch data:', batchData);
      console.log('Editing batch:', editingBatch);
      
      let response;
      if (editingBatch) {
        console.log('Updating batch with ID:', editingBatch.id);
        response = await batchesAPI.update(editingBatch.id, batchData);
      } else {
        console.log('Creating new batch');
        response = await batchesAPI.create(batchData);
      }
      
      console.log('Batch save response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Save successful, closing modal and fetching batches');
        setShowModal(false);
        fetchBatches();
        alert(editingBatch ? 'Batch updated successfully!' : 'Batch added successfully!');
      } else {
        console.log('Save failed:', response.data);
        alert('Error saving batch: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Error saving batch. Please try again.');
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
              <h1 className="text-base sm:text-lg font-bold">Batches Management</h1>
              <p className="text-primary-100 text-xs">Manage academic batches</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm rounded px-3 py-1 text-white hover:bg-white/30 transition-colors flex items-center" onClick={handleAddBatch}>
              <Plus className="h-3 w-3 mr-1" />
              Add Batch
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded shadow p-2 mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-secondary-400" />
              <input
                type="text"
                placeholder="Search batches..."
                className="input pl-7 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input text-xs"
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
            <div className="flex items-center text-xs text-secondary-600">
              <Filter className="h-3 w-3 mr-1" />
              {filteredBatches.length} of {batches.length} batches
            </div>
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filteredBatches.map(batch => (
            <div key={batch.id} className="bg-white rounded shadow hover:shadow-md transition-shadow p-3 border border-secondary-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-2">
                    <h3 className="font-semibold text-secondary-900 text-sm">{batch.batch_name}</h3>
                    <p className="text-xs text-secondary-500">{batch.batch_code}</p>
                  </div>
                </div>
                {getStatusBadge(batch.status)}
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center text-secondary-600">
                  <Building className="h-3 w-3 mr-1" />
                  {batch.department_name}
                </div>
                <div className="flex items-center text-secondary-600">
                  <Users className="h-3 w-3 mr-1" />
                  <span className="font-medium">Strength:</span> {batch.strength}
                </div>
                <div className="flex items-center text-secondary-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="font-medium">Duration:</span> {batch.start_date} - {batch.end_date}
                </div>
              </div>

              <div className="flex justify-end space-x-1 mt-3">
                <button 
                  className="text-blue-600 hover:text-blue-800 p-1"
                  onClick={() => handleEditBatch(batch)}
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button 
                  className="text-red-600 hover:text-red-800 p-1"
                  onClick={() => handleDeleteBatch(batch.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBatches.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-secondary-900 mb-1">No batches found</h3>
            <p className="text-xs text-secondary-500">Get started by adding a new batch.</p>
          </div>
        )}

        {/* Batch Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingBatch ? 'Edit Batch' : 'Add New Batch'}
              </h2>
              
              <BatchForm 
                batch={editingBatch}
                departments={departments}
                onSave={handleSaveBatch}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Batch Form Component
const BatchForm = ({ batch, departments, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    batch_name: batch?.batch_name || '',
    batch_code: batch?.batch_code || '',
    department_id: batch?.department_id || '',
    start_date: batch?.start_date || '',
    end_date: batch?.end_date || '',
    strength: batch?.strength || '',
    status: batch?.status || 'active'
  });

  // Update form data when batch prop changes (for editing)
  useEffect(() => {
    setFormData({
      batch_name: batch?.batch_name || '',
      batch_code: batch?.batch_code || '',
      department_id: batch?.department_id || '',
      start_date: batch?.start_date || '',
      end_date: batch?.end_date || '',
      strength: batch?.strength || '',
      status: batch?.status || 'active'
    });
  }, [batch]);

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
          <label className="block text-xs font-medium text-secondary-700 mb-1">Batch Name</label>
          <input
            type="text"
            name="batch_name"
            value={formData.batch_name}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., MBBS 2024"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Batch Code</label>
          <input
            type="text"
            name="batch_code"
            value={formData.batch_code}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., MBBS2024"
            required
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
          <label className="block text-xs font-medium text-secondary-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input text-xs"
            required
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="input text-xs"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="input text-xs"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Strength</label>
          <input
            type="number"
            name="strength"
            value={formData.strength}
            onChange={handleChange}
            className="input text-xs"
            placeholder="e.g., 50"
            min="1"
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
          {batch ? 'Update' : 'Save'} Batch
        </button>
      </div>
    </form>
  );
};

export default Batches;
