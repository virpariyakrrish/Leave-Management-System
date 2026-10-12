import React from 'react';

export const StatusBadge = ({ status }) => {
  const normStatus = (status || '').toLowerCase();

  let badgeClass = 'status-pending';
  let label = 'Pending';

  if (normStatus === 'approved') {
    badgeClass = 'status-approved';
    label = 'Approved';
  } else if (normStatus === 'rejected') {
    badgeClass = 'status-rejected';
    label = 'Rejected';
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="status-dot"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
