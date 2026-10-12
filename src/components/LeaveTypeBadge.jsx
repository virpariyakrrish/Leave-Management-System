import React from 'react';

export const LeaveTypeBadge = ({ name, code, color }) => {
  const defaultColors = {
    CL: '#06b6d4',
    SL: '#10b981',
    EL: '#8b5cf6',
    PL: '#f59e0b'
  };

  const badgeColor = color || defaultColors[code] || '#3b82f6';

  return (
    <span
      className="leave-type-badge"
      style={{
        backgroundColor: `${badgeColor}15`,
        color: badgeColor,
        borderColor: `${badgeColor}30`
      }}
    >
      <span
        className="leave-type-indicator"
        style={{ backgroundColor: badgeColor }}
      />
      {name || code}
    </span>
  );
};

export default LeaveTypeBadge;
