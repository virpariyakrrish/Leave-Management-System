import React from 'react';

export const LeaveCard = ({ title, count, variant = 'blue', subtitle, icon: Icon }) => {
  const variantClasses = {
    blue: 'card-accent-blue',
    green: 'card-accent-green',
    purple: 'card-accent-purple',
    amber: 'card-accent-amber',
    red: 'card-accent-red'
  };

  return (
    <div className={`metric-card ${variantClasses[variant] || 'card-accent-blue'}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-badge">
            <Icon />
          </div>
        )}
      </div>
      <div className="metric-count">{count}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );
};

export default LeaveCard;
