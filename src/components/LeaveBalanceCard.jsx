import React from 'react';

export const LeaveBalanceCard = ({
  name,
  code,
  used,
  remaining,
  annualLimit,
  color = '#2563eb',
  variant = 'card' 
}) => {
  
  const percentUsed = annualLimit > 0 ? Math.min(100, Math.round((used / annualLimit) * 100)) : 0;
  const percentRemaining = annualLimit > 0 ? Math.min(100, Math.round((remaining / annualLimit) * 100)) : 0;

  if (variant === 'compact') {
    return (
      <div className="balance-compact-row">
        <div className="balance-compact-info">
          <div className="balance-compact-title">
            <span className="balance-dot" style={{ backgroundColor: color }}></span>
            <span className="font-medium text-slate-700">
              {name} ({code})
            </span>
          </div>
          <div className="balance-compact-value">
            <span className="font-semibold text-slate-900">{remaining}</span>
            <span className="text-slate-400 text-xs"> / {annualLimit}</span>
          </div>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentRemaining}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="balance-card">
      <div className="balance-card-header">
        <div className="balance-card-title-group">
          <div className="balance-card-title">
            {name} ({code})
          </div>
        </div>
        <span
          className="balance-card-indicator"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="balance-card-body">
        <div className="balance-card-metric">
          <span className="balance-card-number">{remaining}</span>
          <span className="balance-card-total">/ {annualLimit}</span>
        </div>
        <span className="balance-card-caption">Days Remaining</span>

        <div className="progress-bar-bg mt-4">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentRemaining}%`,
              backgroundColor: color
            }}
          />
        </div>

        <div className="balance-card-footer">
          <span>{used} days used</span>
          <span>{remaining} available</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
