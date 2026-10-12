import React, { useState } from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';
import {
  FiLayers,
  FiPlus,
  FiUsers,
  FiCheckCircle,
  FiX,
  FiBriefcase,
  FiArrowRight
} from 'react-icons/fi';

export const Departments = () => {
  const { departments, users, refreshData } = useLeaves();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Department name is required.' });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    try {
      const res = await apiService.createDepartment(formData);
      if (res.success) {
        showToast(`Department "${res.data.name}" added successfully!`, 'success');
        await refreshData();
        setModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="departments-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Departments</h1>
          <p className="page-subtitle">Organizational units and department team allocations</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenModal}>
          <FiPlus className="mr-1" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {departments.map((dept) => {
          const deptEmployees = users.filter((u) => u.department_id === dept.id);
          return (
            <div
              key={dept.id}
              className="content-card dept-card hover:border-blue-400 transition-all cursor-pointer"
              onClick={() => setSelectedDept(dept)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="dept-icon-box">
                  <FiBriefcase className="text-blue-600 text-xl" />
                </div>
                <span className="badge-active">Active</span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-1">{dept.name}</h2>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                {dept.description || 'Core organizational department.'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <FiUsers className="text-slate-400" />
                  {deptEmployees.length} Employee{deptEmployees.length !== 1 ? 's' : ''}
                </span>
                <span className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                  View Team <FiArrowRight />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDept && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg">
            <div className="modal-header">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <FiBriefcase className="text-blue-600" /> {selectedDept.name} Department
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedDept(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body py-4">
              <p className="text-sm text-slate-600 mb-4">{selectedDept.description}</p>
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Assigned Team Members (
                {users.filter((u) => u.department_id === selectedDept.id).length}):
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {users
                  .filter((u) => u.department_id === selectedDept.id)
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            emp.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                          }
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.designation}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{emp.email}</span>
                    </div>
                  ))}

                {users.filter((u) => u.department_id === selectedDept.id).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No employees assigned yet.</p>
                )}
              </div>
            </div>

            <div className="modal-footer flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedDept(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
                <FiPlus className="text-blue-600" /> Add New Department
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body py-4 space-y-4">
                <div className="form-group">
                  <label className="form-label">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Product Marketing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Brief description of department scope and operations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
