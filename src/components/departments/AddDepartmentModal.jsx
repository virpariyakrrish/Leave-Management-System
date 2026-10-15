import React, { useState } from 'react';
import { FiX, FiLayers, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';

export const AddDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Engineering & Tech'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Department name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await apiService.createDepartment({
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      if (res.success) {
        showToast(`Department "${res.data.name}" created successfully!`, 'success');
        if (onSuccess) await onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              <FiLayers />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Add New Department
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Set up a new organizational unit and team section
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dept-name">
                Department Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="dept-name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Design, Mobile Development, Security"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
              {errors.name && (
                <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiAlertCircle /> {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dept-desc">
                Scope & Description
              </label>
              <textarea
                id="dept-desc"
                rows={3}
                className="form-textarea"
                placeholder="Brief description of department scope, responsibilities, and deliverables..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
