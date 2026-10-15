import React from 'react';

export const LeaveCard = ({
  title,
  count,
  variant = 'blue',
  subtitle,
  icon: Icon,
  onClick,
  isActive = false,
  badge
}) => {
  const variantClasses = {
    blue: 'card-accent-blue',
    green: 'card-accent-green',
    purple: 'card-accent-purple',
    amber: 'card-accent-amber',
    red: 'card-accent-red'
  };

  return (
    <div
      className={`metric-card ${variantClasses[variant] || 'card-accent-blue'} ${
        onClick ? 'metric-card-interactive' : ''
      } ${isActive ? 'metric-card-selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {badge && <span className="metric-badge">{badge}</span>}
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
