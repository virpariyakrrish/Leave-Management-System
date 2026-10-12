import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaves } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';
import { validateLeaveForm } from '../utils/validation';
import { calculateTotalDays } from '../utils/leaveUtils';
import { FiCalendar, FiClock, FiFileText, FiRotateCcw, FiSend } from 'react-icons/fi';

export const ApplyLeave = () => {
  const navigate = useNavigate();
  const { leaveTypes, balances, applyLeave, actionLoading } = useLeaves();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false
  });

  const [errors, setErrors] = useState({});

  const calculatedDays = calculateTotalDays(
    formData.startDate,
    formData.endDate,
    formData.isHalfDay
  );

  const selectedBalance = balances.find((b) => b.typeId === formData.leaveTypeId);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'isHalfDay' && checked && prev.startDate) {
        updated.endDate = prev.startDate;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setFormData({
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateLeaveForm(formData, balances);
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('Please fix the validation errors before submitting.', 'error');
      return;
    }

    setErrors({});

    const res = await applyLeave({
      leave_type_id: formData.leaveTypeId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      is_half_day: formData.isHalfDay
    });

    if (res.success) {
      navigate('/employee/leave-history');
    }
  };

  return (
    <div className="apply-leave-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Apply Leave</h1>
          <p className="page-subtitle">Fill in the details to request a leave</p>
        </div>
      </div>

      <div className="content-card max-w-3xl">
        <form onSubmit={handleSubmit} className="apply-leave-form" noValidate>
          
          <div className="form-group mb-5">
            <label htmlFor="leaveTypeId" className="form-label">
              Leave Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="leaveTypeId"
              name="leaveTypeId"
              className={`form-select ${errors.leaveTypeId ? 'input-error' : ''}`}
              value={formData.leaveTypeId}
              onChange={handleChange}
              disabled={actionLoading}
              required
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((lt) => {
                const bal = balances.find((b) => b.typeId === lt.id);
                const rem = bal ? bal.remaining : lt.annual_limit;
                return (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.code}) — {rem} days remaining
                  </option>
                );
              })}
            </select>
            {errors.leaveTypeId && <span className="field-error">{errors.leaveTypeId}</span>}
            {selectedBalance && (
              <span className="text-xs text-slate-500 mt-1 block">
                Available balance: <strong>{selectedBalance.remaining} days</strong> remaining out of{' '}
                {selectedBalance.annualLimit} annual entitlement.
              </span>
            )}
          </div>

          <div className="grid-two-cols mb-5">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className={`form-input ${errors.startDate ? 'input-error' : ''}`}
                value={formData.startDate}
                onChange={handleChange}
                disabled={actionLoading}
                required
              />
              {errors.startDate && <span className="field-error">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className={`form-input ${errors.endDate ? 'input-error' : ''}`}
                value={formData.endDate}
                onChange={handleChange}
                disabled={actionLoading || formData.isHalfDay}
                required
              />
              {errors.endDate && <span className="field-error">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group mb-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="checkbox-label cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isHalfDay"
                  checked={formData.isHalfDay}
                  onChange={handleChange}
                  disabled={actionLoading}
                  className="checkbox-input"
                />
                <span className="checkbox-text font-medium text-slate-700">
                  Half Day (Optional)
                </span>
              </label>

              {calculatedDays > 0 && (
                <div className="calculated-days-pill">
                  <FiClock className="mr-1 text-blue-600" />
                  <span>
                    Total Duration: <strong>{calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}</strong>
                  </span>
                </div>
              )}
            </div>
            {errors.isHalfDay && <span className="field-error">{errors.isHalfDay}</span>}
          </div>

          <div className="form-group mb-6">
            <label htmlFor="reason" className="form-label">
              Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              className={`form-textarea ${errors.reason ? 'input-error' : ''}`}
              placeholder="Enter reason for leave..."
              value={formData.reason}
              onChange={handleChange}
              disabled={actionLoading}
              required
            />
            {errors.reason && <span className="field-error">{errors.reason}</span>}
          </div>

          <div className="form-actions-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={actionLoading}
            >
              <FiRotateCcw className="mr-1" /> Reset
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="btn-loading-content">Submitting...</span>
              ) : (
                <>
                  <FiSend className="mr-1" /> Apply Leave
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
