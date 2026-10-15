import React, { useState, useMemo } from 'react';
import {
  FiArrowLeft,
  FiUsers,
  FiCalendar,
  FiPieChart,
  FiSearch,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiGrid,
  FiList,
  FiShield
} from 'react-icons/fi';
import {
  getDepartmentMeta,
  calculateDepartmentStats,
  getEmployeePresenceStatus
} from '../../utils/departmentUtils';
import { isEmojiAvatar, formatDateRange } from '../../utils/leaveUtils';
import StatusBadge from '../StatusBadge';
import LeaveTypeBadge from '../LeaveTypeBadge';

export const DepartmentDetailView = ({
  department,
  allDepartments = [],
  users = [],
  leaveRequests = [],
  leaveTypes = [],
  onBack,
  onSelectDept
}) => {
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'leaves' | 'analytics'
  const [memberSearch, setMemberSearch] = useState('');
  const [presenceFilter, setPresenceFilter] = useState('all'); // 'all' | 'present' | 'leave'
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all'); // 'all' | 'Approved' | 'Pending' | 'Rejected'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const meta = getDepartmentMeta(department.name);
  const IconComponent = meta.icon;
  const stats = calculateDepartmentStats(department.id, users, leaveRequests);

  // Filtered members in this department
  const filteredMembers = useMemo(() => {
    return stats.deptMembers.filter((member) => {
      const presence = getEmployeePresenceStatus(member.id, stats.deptRequests);

      if (presenceFilter === 'present' && presence.isAway) return false;
      if (presenceFilter === 'leave' && !presence.isAway) return false;

      if (memberSearch.trim()) {
        const query = memberSearch.toLowerCase();
        const matchesName = (member.name || '').toLowerCase().includes(query);
        const matchesEmail = (member.email || '').toLowerCase().includes(query);
        const matchesRole = (member.designation || '').toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesRole) return false;
      }

      return true;
    });
  }, [stats.deptMembers, stats.deptRequests, presenceFilter, memberSearch]);

  // Filtered leave requests in this department
  const filteredRequests = useMemo(() => {
    return stats.deptRequests.filter((req) => {
      if (leaveStatusFilter !== 'all' && req.status !== leaveStatusFilter) {
        return false;
      }
      return true;
    });
  }, [stats.deptRequests, leaveStatusFilter]);

  // Department leave type breakdown
  const leaveBreakdown = useMemo(() => {
    return leaveTypes.map((type) => {
      const matchingReqs = stats.deptRequests.filter(
        (r) => r.leave_type_id === type.id && r.status === 'Approved'
      );
      const usedDays = matchingReqs.reduce((sum, r) => sum + (Number(r.total_days) || 0), 0);
      return {
        ...type,
        usedDays,
        requestsCount: matchingReqs.length
      };
    });
  }, [leaveTypes, stats.deptRequests]);

  const availabilityRate = stats.totalMembers > 0
    ? Math.round((stats.activeCount / stats.totalMembers) * 100)
    : 100;

  return (
    <div className="dept-detail-container">
      {/* Top Navigation & Department Switcher Bar */}
      <div className="dept-detail-nav">
        <button
          type="button"
          className="dept-back-btn"
          onClick={onBack}
          aria-label="Back to all departments"
        >
          <FiArrowLeft />
          <span>All Departments</span>
        </button>

        {/* Quick Department Switcher Pills */}
        <div className="dept-quick-switcher-row">
          <button
            type="button"
            className="dept-quick-pill"
            onClick={onBack}
          >
            Overview
          </button>
          {allDepartments.map((d) => {
            const isSelected = d.id === department.id;
            const count = users.filter((u) => u.department_id === d.id).length;
            return (
              <button
                key={d.id}
                type="button"
                className={`dept-quick-pill ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectDept(d.id)}
              >
                <span>{d.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Department Banner */}
      <div
        className="dept-hero-card"
        style={{ background: meta.heroGradient }}
      >
        <div className="dept-hero-top">
          <div className="dept-hero-info">
            <div className="dept-hero-icon-box">
              <IconComponent />
            </div>

            <div className="dept-hero-meta">
              <div className="dept-hero-badges-row">
                <span className="dept-hero-badge">
                  <FiCheckCircle style={{ fontSize: '11px' }} /> Active Unit
                </span>
                <span className="dept-hero-badge">
                  {meta.badge}
                </span>
                {stats.departmentLead && (
                  <span className="dept-hero-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.28)' }}>
                    <FiShield style={{ fontSize: '11px' }} /> Lead: {stats.departmentLead.name}
                  </span>
                )}
              </div>

              <h1 className="dept-hero-title">{department.name} Department</h1>
              <p className="dept-hero-desc">
                {department.description || meta.mission}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {meta.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item KPI Stats Bar in Hero */}
        <div className="dept-hero-stats-bar">
          <div className="dept-hero-stat-item">
            <span className="dept-hero-stat-val">{stats.totalMembers}</span>
            <span className="dept-hero-stat-label">Total Team Members</span>
          </div>

          <div className="dept-hero-stat-item">
            <span className="dept-hero-stat-val" style={{ color: '#86efac' }}>
              {stats.activeCount}
            </span>
            <span className="dept-hero-stat-label">Active & Present Today</span>
          </div>

          <div className="dept-hero-stat-item">
            <span className="dept-hero-stat-val" style={{ color: stats.awayCount > 0 ? '#fde047' : '#ffffff' }}>
              {stats.awayCount}
            </span>
            <span className="dept-hero-stat-label">Currently On Leave</span>
          </div>

          <div className="dept-hero-stat-item">
            <span className="dept-hero-stat-val">{stats.totalDaysTaken} Days</span>
            <span className="dept-hero-stat-label">Total Leave Taken</span>
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="dept-subnav-bar">
        <div className="dept-subnav-tabs">
          <button
            type="button"
            className={`dept-subnav-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <FiUsers />
            <span>Team Members</span>
            <span className="dept-tab-count">{stats.totalMembers}</span>
          </button>

          <button
            type="button"
            className={`dept-subnav-tab ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <FiCalendar />
            <span>Leave Activity & Requests</span>
            <span className="dept-tab-count">{stats.deptRequests.length}</span>
          </button>

          <button
            type="button"
            className={`dept-subnav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FiPieChart />
            <span>Department Analytics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEAM MEMBERS */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter and View Controls Toolbar */}
          <div className="dept-toolbar">
            <div className="dept-search-box">
              <FiSearch className="dept-search-icon" />
              <input
                type="text"
                placeholder={`Search ${department.name} team members...`}
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="dept-search-input"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={presenceFilter}
                onChange={(e) => setPresenceFilter(e.target.value)}
                className="filter-select"
                aria-label="Filter by presence"
              >
                <option value="all">All Members ({stats.totalMembers})</option>
                <option value="present">Present Today ({stats.activeCount})</option>
                <option value="leave">On Leave ({stats.awayCount})</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    background: viewMode === 'grid' ? '#2563eb' : '#ffffff',
                    color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px'
                  }}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    background: viewMode === 'table' ? '#2563eb' : '#ffffff',
                    color: viewMode === 'table' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px'
                  }}
                  title="Table View"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {/* Members Content: Grid View or Table View */}
          {filteredMembers.length === 0 ? (
            <div className="content-card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <FiUsers style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                No members found
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                {memberSearch || presenceFilter !== 'all'
                  ? 'Try adjusting your search query or presence filter.'
                  : `No employees currently assigned to ${department.name}.`}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="dept-members-grid">
              {filteredMembers.map((emp) => {
                const presence = getEmployeePresenceStatus(emp.id, stats.deptRequests);
                const empApprovedLeaves = stats.deptRequests.filter(
                  (r) => r.employee_id === emp.id && r.status === 'Approved'
                );
                const empDaysTaken = empApprovedLeaves.reduce(
                  (sum, r) => sum + (Number(r.total_days) || 0),
                  0
                );
                const isLead =
                  emp.role === 'manager' ||
                  (emp.designation &&
                    (emp.designation.toLowerCase().includes('lead') ||
                      emp.designation.toLowerCase().includes('manager')));

                return (
                  <div key={emp.id} className="dept-member-card">
                    <div className="dept-member-top">
                      <div className="dept-member-avatar-box">
                        {isEmojiAvatar(emp.avatar) ? (
                          <span
                            className="boy-avatar-emoji"
                            role="img"
                            aria-label={emp.name}
                            style={{ fontSize: '26px' }}
                          >
                            {emp.avatar || '👦'}
                          </span>
                        ) : (
                          <img
                            src={
                              emp.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                            }
                            alt={emp.name}
                          />
                        )}
                        <span
                          className={`dept-member-status-dot ${
                            presence.isAway ? 'dot-leave' : 'dot-active'
                          }`}
                          title={presence.isAway ? 'On Leave' : 'Present'}
                        />
                      </div>

                      <div className="dept-member-info">
                        <div className="dept-member-name" title={emp.name}>
                          {emp.name}
                        </div>
                        <div className="dept-member-role">{emp.designation || 'Specialist'}</div>

                        {isLead && (
                          <span className="dept-member-lead-badge">
                            <FiShield style={{ fontSize: '10px' }} /> Dept Lead
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="dept-member-contact-list">
                      <div className="dept-member-contact-item" title={emp.email}>
                        <FiMail style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <a href={`mailto:${emp.email}`}>{emp.email}</a>
                      </div>
                      {emp.phone && (
                        <div className="dept-member-contact-item">
                          <FiPhone style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <a href={`tel:${emp.phone}`}>{emp.phone}</a>
                        </div>
                      )}
                    </div>

                    {/* Member Footer */}
                    <div className="dept-member-footer">
                      <span
                        className={
                          presence.isAway
                            ? 'dept-leave-pill-away'
                            : 'dept-leave-pill-active'
                        }
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: presence.isAway ? '#f59e0b' : '#10b981'
                          }}
                        />
                        {presence.isAway ? presence.statusLabel : 'Present & Active'}
                      </span>

                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                        {empDaysTaken}d taken
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="content-card p-0" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Designation</th>
                      <th>Contact Info</th>
                      <th>Current Status</th>
                      <th>Leave Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((emp) => {
                      const presence = getEmployeePresenceStatus(emp.id, stats.deptRequests);
                      const empApprovedLeaves = stats.deptRequests.filter(
                        (r) => r.employee_id === emp.id && r.status === 'Approved'
                      );
                      const empDaysTaken = empApprovedLeaves.reduce(
                        (sum, r) => sum + (Number(r.total_days) || 0),
                        0
                      );

                      return (
                        <tr key={emp.id} className="table-row">
                          <td>
                            <div className="emp-cell">
                              <div className="emp-avatar-wrap">
                                {isEmojiAvatar(emp.avatar) ? (
                                  <span className="boy-avatar-emoji" role="img" aria-label={emp.name}>
                                    {emp.avatar || '👦'}
                                  </span>
                                ) : (
                                  <img
                                    src={
                                      emp.avatar ||
                                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                                    }
                                    alt={emp.name}
                                    className="emp-avatar"
                                  />
                                )}
                              </div>
                              <div className="emp-meta">
                                <span className="emp-name">{emp.name}</span>
                                <span className="emp-role">{emp.role === 'manager' ? 'Manager' : 'Employee'}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: '#334155', fontWeight: 500 }}>
                            {emp.designation || 'Specialist'}
                          </td>
                          <td>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                              <div>{emp.email}</div>
                              {emp.phone && <div style={{ fontSize: '11px' }}>{emp.phone}</div>}
                            </div>
                          </td>
                          <td>
                            <span
                              className={
                                presence.isAway
                                  ? 'dept-leave-pill-away'
                                  : 'dept-leave-pill-active'
                              }
                            >
                              {presence.isAway ? presence.statusLabel : 'Active & Present'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>
                            {empDaysTaken} Days
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEAVE ACTIVITY & REQUESTS */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Filter Bar */}
          <div className="dept-toolbar">
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              Department Leave Applications ({filteredRequests.length})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setLeaveStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: leaveStatusFilter === status ? '#2563eb' : '#e2e8f0',
                    background: leaveStatusFilter === status ? '#eff6ff' : '#ffffff',
                    color: leaveStatusFilter === status ? '#2563eb' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="content-card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <FiCalendar style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                No leave requests found
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                No leave requests recorded for this department matching the filter.
              </p>
            </div>
          ) : (
            <>
              {/* Laptop & Desktop View Table */}
              <div className="content-card p-0 dept-desktop-leaves-table" style={{ overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="leave-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => {
                        const emp = users.find((u) => u.id === req.employee_id) || {};
                        const leaveType = leaveTypes.find((lt) => lt.id === req.leave_type_id);

                        return (
                          <tr key={req.id} className="table-row">
                            <td>
                              <div className="emp-cell">
                                <div className="emp-avatar-wrap">
                                  {isEmojiAvatar(emp.avatar) ? (
                                    <span className="boy-avatar-emoji" role="img" aria-label={emp.name}>
                                      {emp.avatar || '👦'}
                                    </span>
                                  ) : (
                                    <img
                                      src={
                                        emp.avatar ||
                                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                                      }
                                      alt={emp.name}
                                      className="emp-avatar"
                                    />
                                  )}
                                </div>
                                <div className="emp-meta">
                                  <span className="emp-name">{emp.name || 'Staff'}</span>
                                  <span className="emp-role">{emp.designation || 'Employee'}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <LeaveTypeBadge leaveType={leaveType} />
                            </td>
                            <td style={{ fontSize: '13px', color: '#475569' }}>
                              {formatDateRange(req.start_date, req.end_date)}
                            </td>
                            <td style={{ fontWeight: 600, color: '#1e293b' }}>
                              {req.total_days} {req.total_days === 1 ? 'Day' : 'Days'}
                              {req.is_half_day && ' (Half Day)'}
                            </td>
                            <td style={{ fontSize: '13px', color: '#64748b', maxWidth: '240px' }}>
                              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {req.reason || 'No reason provided'}
                              </span>
                            </td>
                            <td>
                              <StatusBadge status={req.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View Cards Layout */}
              <div className="dept-mobile-leaves-list">
                {filteredRequests.map((req) => {
                  const emp = users.find((u) => u.id === req.employee_id) || {};
                  const leaveType = leaveTypes.find((lt) => lt.id === req.leave_type_id);

                  return (
                    <div key={req.id} className="dept-mobile-leave-card">
                      <div className="dept-mobile-leave-header">
                        <div className="emp-cell">
                          <div className="emp-avatar-wrap" style={{ width: '36px', height: '36px' }}>
                            {isEmojiAvatar(emp.avatar) ? (
                              <span className="boy-avatar-emoji" role="img" aria-label={emp.name} style={{ fontSize: '18px' }}>
                                {emp.avatar || '👦'}
                              </span>
                            ) : (
                              <img
                                src={
                                  emp.avatar ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                                }
                                alt={emp.name}
                                className="emp-avatar"
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{emp.designation}</div>
                          </div>
                        </div>

                        <StatusBadge status={req.status} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                        <LeaveTypeBadge leaveType={leaveType} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          {formatDateRange(req.start_date, req.end_date)} ({req.total_days}d)
                        </span>
                      </div>

                      <div className="dept-mobile-leave-reason">
                        "{req.reason || 'Personal work'}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: DEPARTMENT ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="dept-analytics-grid">
          {/* Leave Quota Utilization Card */}
          <div className="dept-analytics-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Leave Type Distribution
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Approved leave days utilized by {department.name} team members.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {leaveBreakdown.map((type) => {
                const totalLimit = (type.annual_limit || 10) * (stats.totalMembers || 1);
                const percent = Math.min(100, Math.round((type.usedDays / totalLimit) * 100));

                return (
                  <div key={type.id} className="dept-utilization-row">
                    <div className="dept-utilization-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: type.color || '#3b82f6'
                          }}
                        />
                        {type.name} ({type.code})
                      </span>
                      <span style={{ color: '#475569' }}>
                        {type.usedDays} Days ({percent}%)
                      </span>
                    </div>

                    <div className="progress-bar-bg" style={{ height: '7px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: type.color || '#3b82f6'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Health & Overview Card */}
          <div className="dept-analytics-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Operational Health & Availability
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Real-time workforce availability score and operational parameters.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                background: availabilityRate >= 80 ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${availabilityRate >= 80 ? '#bbf7d0' : '#fde68a'}`,
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: availabilityRate >= 80 ? '#15803d' : '#b45309',
                  lineHeight: 1
                }}
              >
                {availabilityRate}%
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Team Availability Index
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {stats.activeCount} of {stats.totalMembers} members currently active and on duty.
                </div>
              </div>
            </div>

            {/* Department Facts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#94a3b8' }}>Department ID:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{department.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#94a3b8' }}>Unit Category:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{meta.badge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#94a3b8' }}>Department Lead:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {stats.departmentLead ? stats.departmentLead.name : 'Unassigned'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Total Recorded Requests:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats.deptRequests.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetailView;
