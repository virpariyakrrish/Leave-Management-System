import React from 'react';
import { StatusBadge } from './StatusBadge';
import { LeaveTypeBadge } from './LeaveTypeBadge';
import { formatDate, formatDateRange, isEmojiAvatar } from '../utils/leaveUtils';
import { FiEye, FiCheck, FiX, FiCalendar, FiInbox } from 'react-icons/fi';

export const LeaveTable = ({
  requests = [],
  leaveTypes = [],
  users = [],
  viewType = 'employee', 
  isRecent = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onViewDetails,
  onApprove,
  onReject,
  emptyMessage = 'No leave requests found.'
}) => {
  
  const getType = (typeId) => leaveTypes.find((lt) => lt.id === typeId) || { name: 'Leave', code: 'LV', color: '#64748b' };

  const getUser = (empId) => users.find((u) => u.id === empId) || { name: 'Employee', designation: 'Staff', avatar: '' };

  if (!requests.length) {
    return (
      <div className="table-empty-state">
        <div className="empty-icon-wrap">
          <FiInbox className="empty-icon" />
        </div>
        <p className="empty-title">No Records Found</p>
        <p className="empty-subtitle">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="leave-table">
          <thead>
            <tr>
              
              {!isRecent && viewType === 'employee' && <th className="th-num">#</th>}
              {viewType === 'manager' && <th>Employee</th>}
              <th>Leave Type</th>
              {isRecent ? (
                <>
                  <th>Start Date</th>
                  <th>End Date</th>
                </>
              ) : viewType === 'manager' ? (
                <>
                  <th>Date Range</th>
                  <th>Total Days</th>
                </>
              ) : (
                <>
                  <th>Start Date</th>
                  <th>End Date</th>
                </>
              )}
              <th>Status</th>
              {!isRecent && <th>Applied On</th>}
              {!isRecent && <th className="th-actions">Action</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => {
              const lt = getType(req.leave_type_id);
              const emp = getUser(req.employee_id);
              const rowNumber = (currentPage - 1) * 10 + (idx + 1);

              return (
                <tr key={req.id} className="table-row hover:bg-slate-50 transition-colors">
                  
                  {!isRecent && viewType === 'employee' && (
                    <td className="td-num text-slate-500 font-medium">{rowNumber}</td>
                  )}

                  {viewType === 'manager' && (
                    <td className="td-employee">
                      <div className="emp-cell">
                        <div className="emp-avatar-wrap">
                          {isEmojiAvatar(emp.avatar) ? (
                            <span className="boy-avatar-emoji" role="img" aria-label={emp.name}>
                              {emp.avatar || '👦'}
                            </span>
                          ) : (
                            <img
                              src={emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
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
                  )}

                  <td className="td-type">
                    <LeaveTypeBadge name={lt.name} code={lt.code} color={lt.color} />
                  </td>

                  {isRecent ? (
                    <>
                      <td className="td-date text-slate-600">{formatDate(req.start_date)}</td>
                      <td className="td-date text-slate-600">{formatDate(req.end_date)}</td>
                    </>
                  ) : viewType === 'manager' ? (
                    <>
                      <td className="td-date-range text-slate-700 font-medium">
                        {formatDateRange(req.start_date, req.end_date)}
                      </td>
                      <td className="td-duration text-slate-600">
                        {req.total_days} {req.total_days === 1 ? 'Day' : 'Days'}
                        {req.is_half_day && ' (Half)'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="td-date text-slate-600">{formatDate(req.start_date)}</td>
                      <td className="td-date text-slate-600">{formatDate(req.end_date)}</td>
                    </>
                  )}

                  <td className="td-status">
                    <StatusBadge status={req.status} />
                  </td>

                  {!isRecent && (
                    <td className="td-applied text-slate-500 text-sm">
                      {formatDate(req.created_at)}
                    </td>
                  )}

                  {!isRecent && (
                    <td className="td-actions">
                      <div className="actions-cluster">
                        {viewType === 'manager' && req.status === 'Pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove && onApprove(req.id)}
                              className="btn-action-approve"
                              title="Approve Request"
                            >
                              <FiCheck /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject && onReject(req.id)}
                              className="btn-action-reject"
                              title="Reject Request"
                            >
                              <FiX /> Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => onViewDetails && onViewDetails(req.id)}
                              className="btn-action-view"
                              title="View Details"
                            >
                              <FiEye /> View
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onViewDetails && onViewDetails(req.id)}
                            className="btn-action-view"
                            title="View Details"
                          >
                            <FiEye /> View
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isRecent && totalPages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            aria-label="Previous Page"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            aria-label="Next Page"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;
