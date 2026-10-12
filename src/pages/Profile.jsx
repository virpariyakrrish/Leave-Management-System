import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import { formatDate, isEmojiAvatar } from '../utils/leaveUtils';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiShield,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';

export const Profile = () => {
  const { user, isManager } = useAuth();
  const { departments, stats } = useLeaves();

  const dept = departments.find((d) => d.id === user?.department_id);

  return (
    <div className="profile-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">User Profile</h1>
          <p className="page-subtitle">Your personal account details and company information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="content-card text-center py-8">
          <div className="profile-avatar-wrap mx-auto mb-4 relative inline-block">
            <div className="profile-photo-container">
              {isEmojiAvatar(user?.avatar) ? (
                <span
                  className="boy-avatar-emoji profile-emoji-large"
                  role="img"
                  aria-label={user?.name || 'User Avatar'}
                >
                  {user?.avatar || '👦'}
                </span>
              ) : (
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'
                  }
                  alt={user?.name}
                  className="profile-photo-img"
                />
              )}
            </div>
            <span className="profile-status-dot-active" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-blue-600 font-semibold mb-1">
            {user?.designation || (isManager ? 'Engineering Manager' : 'Frontend Developer')}
          </p>
          <span className="badge-active capitalize">{user?.role}</span>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <FiMail className="text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <FiPhone className="text-slate-400" />
              <span>{user?.phone || (isManager ? '+91 94273 85972' : '+91 98765 43210')}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <FiBriefcase className="text-slate-400" />
              <span>{dept?.name || 'Development'} Department</span>
            </div>
          </div>
        </div>

        <div className="content-card lg:col-span-2">
          <h2 className="card-heading mb-4">Account & Leave Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Employee ID
              </span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {user?.id?.toUpperCase()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Employment Status
              </span>
              <span className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
                <FiCheckCircle /> Active Regular
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Joined Date
              </span>
              <span className="text-base font-bold text-slate-800">
                {formatDate(user?.created_at || '2025-01-15')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Reporting Line
              </span>
              <span className="text-base font-bold text-slate-800">
                {isManager ? 'Director of Engineering' : 'Krish Virpariya (Manager)'}
              </span>
            </div>
          </div>

          <h3 className="section-subheading mb-3">Leave Entitlement Summary</h3>
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-sm text-slate-700 leading-relaxed">
            {isManager ? (
              <p>
                As a manager, you hold administrative approval privileges over leave requests
                submitted by members of the organization. You can review, approve, or reject
                applications in the Leave Requests tab.
              </p>
            ) : (
              <p>
                Your annual entitlement is <strong>27 days</strong> distributed across Casual Leave
                (7 days), Sick Leave (5 days), Earned Leave (10 days), and Privilege Leave (5 days).
                Approved leaves automatically deduct from your remaining pool.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
