import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LeaveTypeBadge from '../components/LeaveTypeBadge';
import { formatDate, isEmojiAvatar } from '../utils/leaveUtils';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiUser,
  FiAlertTriangle
} from 'react-icons/fi';

export const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();
  const { showToast } = useToast();
  const {
    leaveRequests,
    leaveTypes,
    users,
    approveLeave,
    rejectLeave,
    actionLoading
  } = useLeaves();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const request = leaveRequests.find((r) => r.id === id);

  if (!request) {
    return (
      <div className="leave-details-page">
        <div className="content-card text-center py-12">
          <p className="text-slate-600 mb-4">Leave request not found or has been removed.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(isManager ? '/manager/leave-requests' : '/employee/leave-history')}
          >
            <FiArrowLeft className="mr-1" /> Back to List
          </button>
        </div>
      </div>
    );
  }

  const employee = users.find((u) => u.id === request.employee_id) || {
    name: 'Employee',
    designation: 'Staff',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
  };

  const leaveType = leaveTypes.find((lt) => lt.id === request.leave_type_id) || {
    name: 'Leave',
    code: 'LV',
    color: '#2563eb'
  };

  const approver = request.approved_by
    ? users.find((u) => u.id === request.approved_by)
    : users.find((u) => u.role === 'manager');

  const handleApprove = async () => {
    if (!isManager || request.status !== 'Pending') return;
    const res = await approveLeave(request.id);
    if (res.success) {
      showToast('Leave request approved successfully!', 'success');
    }
  };

  const handleConfirmReject = async () => {
    if (!isManager || request.status !== 'Pending') return;
    const res = await rejectLeave(request.id, rejectReason);
    if (res.success) {
      setRejectModalOpen(false);
      setRejectReason('');
      showToast('Leave request rejected.', 'info');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="leave-details-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Leave Request Details</h1>
          <p className="page-subtitle">View complete details of this leave application</p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleBack}>
          <FiArrowLeft className="mr-1" /> Back
        </button>
      </div>

      <div className="content-card max-w-4xl mx-auto">
        
        <div className="details-profile-strip">
          <div className="flex items-center gap-4">
            <div className="details-avatar-wrap">
              {isEmojiAvatar(employee.avatar) ? (
                <span className="boy-avatar-emoji" style={{ fontSize: '30px' }} role="img" aria-label={employee.name}>
                  {employee.avatar || '👦'}
                </span>
              ) : (
                <img
                  src={employee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                  alt={employee.name}
                  className="details-avatar"
                />
              )}
            </div>
            <div>
              <h2 className="details-emp-name">{employee.name}</h2>
              <p className="details-emp-role">{employee.designation || 'Staff'}</p>
              <p className="details-emp-email text-xs text-slate-400">{employee.email}</p>
            </div>
          </div>
          <div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="details-divider" />

        <div className="details-info-grid">
          <div className="details-field-item">
            <span className="field-label">Leave Type</span>
            <div className="field-value mt-1">
              <LeaveTypeBadge
                name={leaveType.name}
                code={leaveType.code}
                color={leaveType.color}
              />
            </div>
          </div>

          <div className="details-field-item">
            <span className="field-label">Date Range</span>
            <div className="field-value font-medium text-slate-800">
              {formatDate(request.start_date)} to {formatDate(request.end_date)}
            </div>
          </div>

          <div className="details-field-item">
            <span className="field-label">Total Days</span>
            <div className="field-value font-medium text-slate-800">
              {request.total_days} {request.total_days === 1 ? 'Day' : 'Days'}
              {request.is_half_day && ' (Half Day)'}
            </div>
          </div>

          <div className="details-field-item">
            <span className="field-label">Applied Date</span>
            <div className="field-value font-medium text-slate-800">
              {formatDate(request.created_at)}
            </div>
          </div>

          <div className="details-field-item col-span-full">
            <span className="field-label">Reason</span>
            <div className="field-value reason-box mt-1">
              {request.reason || 'No reason specified.'}
            </div>
          </div>

          {request.status === 'Rejected' && request.rejection_reason && (
            <div className="details-field-item col-span-full">
              <span className="field-label text-rose-600">Rejection Reason</span>
              <div className="field-value rejection-reason-box mt-1">
                {request.rejection_reason}
              </div>
            </div>
          )}
        </div>

        <div className="details-divider" />

        <div className="details-approver-section">
          <h3 className="section-subheading">Approved By</h3>
          <div className="approver-card-strip mt-3">
            <div className="flex items-center gap-3">
              <div className="approver-avatar-wrap">
                {isEmojiAvatar(approver?.avatar) ? (
                  <span className="boy-avatar-emoji" role="img" aria-label={approver?.name || 'Manager'}>
                    {approver?.avatar || '👦'}
                  </span>
                ) : (
                  <img
                    src={approver?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={approver?.name || 'Manager'}
                    className="approver-avatar"
                  />
                )}
              </div>
              <div>
                <p className="approver-name">{approver?.name || 'Krish Virpariya'}</p>
                <p className="approver-role">Manager</p>
              </div>
            </div>
            <div className="approver-status-col">
              <StatusBadge status={request.status} />
              {request.updated_at && request.status !== 'Pending' && (
                <span className="text-xs text-slate-400 block mt-1">
                  {formatDate(request.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {isManager && request.status === 'Pending' && (
          <div className="details-actions-section mt-8 pt-6 border-t border-slate-100">
            <h3 className="section-subheading mb-3">Action</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-approve-lg"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <FiCheck className="mr-1.5" /> Approve
              </button>
              <button
                type="button"
                className="btn-reject-lg"
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
              >
                <FiX className="mr-1.5" /> Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {rejectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-lg">
                <FiAlertTriangle /> Confirm Rejection
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRejectModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body py-4">
              <p className="text-slate-600 text-sm mb-4">
                Are you sure you want to reject this leave request for{' '}
                <strong>{employee.name}</strong>? Please provide a reason for the employee:
              </p>
              <textarea
                rows={3}
                className="form-textarea w-full"
                placeholder="Enter rejection reason (e.g., conflicting schedule, critical sprint)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmReject}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveDetails;
