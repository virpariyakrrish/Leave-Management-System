import React from 'react';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { getDepartmentMeta, calculateDepartmentStats } from '../../utils/departmentUtils';
import { isEmojiAvatar } from '../../utils/leaveUtils';

export const DepartmentCard = ({ dept, users = [], leaveRequests = [], onSelect }) => {
  const meta = getDepartmentMeta(dept.name);
  const IconComponent = meta.icon;
  const stats = calculateDepartmentStats(dept.id, users, leaveRequests);

  const previewMembers = stats.deptMembers.slice(0, 4);
  const overflowCount = stats.deptMembers.length - previewMembers.length;

  return (
    <div
      className="dept-card-container"
      onClick={() => onSelect(dept.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(dept.id);
        }
      }}
      aria-label={`View ${dept.name} department`}
    >
      {/* Top Accent Gradient Stripe */}
      <div
        className="dept-card-top-stripe"
        style={{ background: meta.gradient }}
      />

      <div className="dept-card-main">
        {/* Header with Icon and Status */}
        <div className="dept-card-header">
          <div
            className="dept-card-icon-wrap"
            style={{
              background: meta.bgLight,
              color: meta.color,
              border: `1px solid ${meta.borderLight}`
            }}
          >
            <IconComponent />
          </div>

          <span className="badge-active">
            <FiCheckCircle style={{ marginRight: '4px', fontSize: '11px' }} />
            Active
          </span>
        </div>

        {/* Title and Category */}
        <div className="dept-title-group">
          <h3 className="dept-card-title">{dept.name}</h3>
          <span className="dept-card-category">{meta.badge}</span>
        </div>

        {/* Description */}
        <p className="dept-card-desc">
          {dept.description || meta.mission}
        </p>

        {/* Tags */}
        <div className="dept-tags-row">
          {meta.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="dept-mini-tag">
              {tag}
            </span>
          ))}
        </div>

        {/* Avatars Stack & Presence */}
        <div className="dept-card-stats-row">
          <div className="dept-avatar-stack" title={`${stats.totalMembers} team members`}>
            {previewMembers.map((m) => (
              <div key={m.id} className="dept-avatar-item" title={m.name}>
                {isEmojiAvatar(m.avatar) ? (
                  <span role="img" aria-label={m.name}>
                    {m.avatar || '👦'}
                  </span>
                ) : (
                  <img
                    src={m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={m.name}
                  />
                )}
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="dept-avatar-overflow">
                +{overflowCount}
              </div>
            )}
            {previewMembers.length === 0 && (
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>No members</span>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              {stats.totalMembers} Member{stats.totalMembers !== 1 ? 's' : ''}
            </span>
            <div style={{ fontSize: '11px', color: stats.awayCount > 0 ? '#b45309' : '#15803d', fontWeight: 500 }}>
              {stats.awayCount > 0 ? `${stats.awayCount} On Leave` : 'All Present'}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="dept-card-footer">
        <span>Enter {dept.name} Section</span>
        <FiArrowRight style={{ fontSize: '15px' }} />
      </div>
    </div>
  );
};

export default DepartmentCard;
