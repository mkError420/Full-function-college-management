import React, { useState, useEffect } from 'react';
import { batchesAPI, departmentsAPI } from '../services/api';
import { Calendar, Plus, Edit, Trash2, Search, Users } from 'lucide-react';

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

  const fetchBatches = async () => {
    try {
      const response = await batchesAPI.getAll();
      setBatches(response.data);
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
      console.error('Error fetching departments:', error);
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
      active: 'badge-success',
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
        await batchesAPI.delete(batchId);
        fetchBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
  };

  const handleSaveBatch = async (batchData) => {
    try {
      if (editingBatch) {
        await batchesAPI.update(editingBatch.id, batchData);
      } else {
        await batchesAPI.create(batchData);
      }
      setShowModal(false);
      fetchBatches();
    } catch (error) {
      console.error('Error saving batch:', error);
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
        <h1 className="text-2xl font-bold text-secondary-900">Batches Management</h1>
        <button className="btn btn-primary flex items-center" onClick={handleAddBatch}>
          <Plus className="h-4 w-4 mr-2" />
          Add Batch
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search batches..."
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
            <Users className="h-4 w-4 mr-2" />
            {filteredBatches.length} of {batches.length} batches
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Code</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Strength</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(batch => (
                <tr key={batch.id}>
                  <td className="font-medium">{batch.batch_name}</td>
                  <td>{batch.batch_code}</td>
                  <td>{batch.department_name}</td>
                  <td>{batch.start_date} to {batch.end_date}</td>
                  <td>{batch.strength}</td>
                  <td>{getStatusBadge(batch.status)}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditBatch(batch)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteBatch(batch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No batches found</h3>
          <p className="text-secondary-500">Get started by adding a new batch.</p>
        </div>
      )}

      {/* Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
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
          <label className="block text-sm font-medium text-secondary-700 mb-1">Batch Name</label>
          <input
            type="text"
            name="batch_name"
            value={formData.batch_name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., MBBS 2024"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Batch Code</label>
          <input
            type="text"
            name="batch_code"
            value={formData.batch_code}
            onChange={handleChange}
            className="input"
            placeholder="e.g., MBBS2024"
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
          <label className="block text-sm font-medium text-secondary-700 mb-1">Strength</label>
          <input
            type="number"
            name="strength"
            value={formData.strength}
            onChange={handleChange}
            className="input"
            placeholder="Number of students"
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
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
          {batch ? 'Update' : 'Save'} Batch
        </button>
      </div>
    </form>
  );
};

export default Batches;
