import React, { useState, useMemo } from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';
import { validateEmployeeForm } from '../utils/validation';
import { isEmojiAvatar } from '../utils/leaveUtils';
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiMail,
  FiPhone,
  FiX,
  FiCheckCircle,
  FiBriefcase
} from 'react-icons/fi';

export const Employees = () => {
  const { users, departments, refreshData } = useLeaves();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_id: '',
    designation: '',
    phone: '',
    role: 'employee'
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredEmployees = useMemo(() => {
    return users.filter((u) => {
      
      if (selectedDept !== 'all' && u.department_id !== selectedDept) {
        return false;
      }
      
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(term);
        const matchesEmail = u.email.toLowerCase().includes(term);
        const matchesDesignation = (u.designation || '').toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesDesignation) return false;
      }
      return true;
    });
  }, [users, selectedDept, searchTerm]);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      department_id: departments[0]?.id || '',
      designation: '',
      phone: '',
      role: 'employee'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateEmployeeForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    try {
      const res = await apiService.createUser(formData);
      if (res.success) {
        showToast(`Employee ${res.data.name} added successfully!`, 'success');
        await refreshData();
        setModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeptName = (deptId) => {
    const d = departments.find((dept) => dept.id === deptId);
    return d ? d.name : 'General';
  };

  return (
    <div className="employees-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Employees</h1>
          <p className="page-subtitle">View and manage company personnel</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenModal}>
          <FiPlus className="mr-1" /> Add Employee
        </button>
      </div>

      <div className="content-card">
        
        <div className="filter-bar flex-col md:flex-row gap-3">
          <div className="search-input-wrap flex-1">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="filter-select"
              aria-label="Filter by department"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body-content p-0 mt-3">
          <div className="table-responsive">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="table-row hover:bg-slate-50 transition-colors">
                    <td className="td-employee">
                      <div className="emp-cell">
                        <div className="emp-avatar-wrap">
                          {isEmojiAvatar(emp.avatar) ? (
                            <span className="boy-avatar-emoji" role="img" aria-label={emp.name}>
                              {emp.avatar || '👦'}
                            </span>
                          ) : (
                            <img
                              src={
                                emp.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                              }
                              alt={emp.name}
                              className="emp-avatar"
                            />
                          )}
                        </div>
                        <div className="emp-meta">
                          <span className="emp-name">{emp.name}</span>
                          <span className="emp-role">{emp.designation || 'Staff'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-700 font-medium">
                      <span className="dept-tag">{getDeptName(emp.department_id)}</span>
                    </td>
                    <td className="text-slate-600 text-sm font-mono">{emp.email}</td>
                    <td className="text-slate-600 capitalize text-sm">{emp.role}</td>
                    <td>
                      <span className="badge-active">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
                <FiUsers className="text-blue-600" /> Add New Employee
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
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Rohini Gupta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="e.g. rohini@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={formData.department_id}
                      onChange={(e) =>
                        setFormData({ ...formData, department_id: e.target.value })
                      }
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.designation ? 'input-error' : ''}`}
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                  {formErrors.designation && (
                    <span className="field-error">{formErrors.designation}</span>
                  )}
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
                  {isSubmitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
