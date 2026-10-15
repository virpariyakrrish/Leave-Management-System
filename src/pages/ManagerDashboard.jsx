import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import LeaveCard from '../components/LeaveCard';
import LeaveTable from '../components/LeaveTable';
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiLayers,
  FiCalendar,
  FiArrowRight,
  FiX,
  FiAlertTriangle,
  FiShield
} from 'react-icons/fi';
import { getDepartmentMeta } from '../utils/departmentUtils';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    leaveRequests,
    leaveTypes,
    users,
    departments,
    stats,
    approveLeave,
    rejectLeave,
    actionLoading
  } = useLeaves();

  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const firstName = user?.name ? user.name.split(' ')[0] : 'Manager';

  // Format today's date for display
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Filter requests based on status tab or metric card selection
  const filteredRecentRequests = useMemo(() => {
    let list = leaveRequests || [];
    if (statusFilter !== 'all') {
      list = list.filter((r) => (r.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    return list.slice(0, 6);
  }, [leaveRequests, statusFilter]);

  const handleApprove = async (id) => {
    await approveLeave(id);
  };

  const handleReject = (id) => {
    setActiveRejectId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!activeRejectId) return;
    const res = await rejectLeave(activeRejectId, rejectReason);
    if (res?.success) {
      setRejectModalOpen(false);
      setActiveRejectId(null);
      setRejectReason('');
    }
  };

  const handleView = (id) => {
    navigate(`/manager/leave-requests/${id}`);
  };

  return (
    <div className="manager-dashboard-page">
      {/* 1. Dashboard Welcome & Status Banner */}
      <div className="dashboard-welcome-banner">
        <div className="dashboard-welcome-text">
          <div className="dashboard-badge-pill">
            <FiShield className="badge-shield-icon" />
            <span>Management Workspace</span>
          </div>
          <h1 className="page-main-title">Manager Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {firstName}! Overview of team leaves, operations, and pending reviews.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <div className="dashboard-date-badge">
            <FiCalendar />
            <span>{todayFormatted}</span>
          </div>
          {stats?.pendingRequests > 0 && (
            <button
              type="button"
              className="dashboard-alert-btn"
              onClick={() => setStatusFilter('Pending')}
              title="Click to view pending requests"
            >
              <FiClock />
              <span>{stats.pendingRequests} Needs Review</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Top Metric Cards */}
      <div className="metrics-grid">
        <LeaveCard
          title="Total Requests"
          count={stats?.totalRequests ?? 0}
          variant="blue"
          icon={FiFileText}
          subtitle="All submitted applications"
          onClick={() => setStatusFilter('all')}
          isActive={statusFilter === 'all'}
        />
        <LeaveCard
          title="Pending Requests"
          count={stats?.pendingRequests ?? 0}
          variant="amber"
          icon={FiClock}
          subtitle="Awaiting management review"
          badge={stats?.pendingRequests > 0 ? `${stats.pendingRequests} Action` : null}
          onClick={() => setStatusFilter('Pending')}
          isActive={statusFilter === 'Pending'}
        />
        <LeaveCard
          title="Approved Requests"
          count={stats?.approvedRequests ?? 0}
          variant="green"
          icon={FiCheckCircle}
          subtitle="Successfully granted"
          onClick={() => setStatusFilter('Approved')}
          isActive={statusFilter === 'Approved'}
        />
        <LeaveCard
          title="Rejected Requests"
          count={stats?.rejectedRequests ?? 0}
          variant="red"
          icon={FiXCircle}
          subtitle="Declined applications"
          onClick={() => setStatusFilter('Rejected')}
          isActive={statusFilter === 'Rejected'}
        />
      </div>

      {/* 3. Quick Navigation / Overview Grid (1 Compact 3-Column Row) */}
      <div className="quick-nav-grid">
        <div
          className="quick-nav-card quick-nav-blue"
          onClick={() => navigate('/manager/leave-requests')}
        >
          <div className="quick-nav-card-left">
            <div className="quick-nav-icon-box icon-blue">
              <FiCalendar />
            </div>
            <div className="quick-nav-meta">
              <div className="quick-nav-title-group">
                <span className="quick-nav-title">Leave Requests</span>
                <span className={`quick-nav-pill ${stats?.pendingRequests > 0 ? 'pill-amber' : 'pill-blue'}`}>
                  {stats?.pendingRequests || 0} Pending
                </span>
              </div>
              <p className="quick-nav-desc">Review and manage team leave applications</p>
            </div>
          </div>
          <div className="quick-nav-card-action">
            <span>Manage</span>
            <FiArrowRight />
          </div>
        </div>

        <div
          className="quick-nav-card quick-nav-emerald"
          onClick={() => navigate('/manager/employees')}
        >
          <div className="quick-nav-card-left">
            <div className="quick-nav-icon-box icon-emerald">
              <FiUsers />
            </div>
            <div className="quick-nav-meta">
              <div className="quick-nav-title-group">
                <span className="quick-nav-title">Employees</span>
                <span className="quick-nav-pill pill-emerald">
                  {users.length} Active
                </span>
              </div>
              <p className="quick-nav-desc">Team directory, records & balances</p>
            </div>
          </div>
          <div className="quick-nav-card-action">
            <span>Directory</span>
            <FiArrowRight />
          </div>
        </div>

        <div
          className="quick-nav-card quick-nav-purple"
          onClick={() => navigate('/manager/departments')}
        >
          <div className="quick-nav-card-left">
            <div className="quick-nav-icon-box icon-purple">
              <FiLayers />
            </div>
            <div className="quick-nav-meta">
              <div className="quick-nav-title-group">
                <span className="quick-nav-title">Departments</span>
                <span className="quick-nav-pill pill-purple">
                  {departments.length} Units
                </span>
              </div>
              <p className="quick-nav-desc">Department structures & allocations</p>
            </div>
          </div>
          <div className="quick-nav-card-action">
            <span>Explore</span>
            <FiArrowRight />
          </div>
        </div>
      </div>

      {/* 4. Recent Requests Table Card */}
      <div className="content-card">
        <div className="card-header-bar">
          <div>
            <h2 className="card-heading">
              {statusFilter === 'all'
                ? 'Recent Leave Requests'
                : `${statusFilter} Leave Requests`}
            </h2>
            <p className="page-subtitle">
              {statusFilter === 'all'
                ? 'Latest submitted applications across all departments'
                : `Showing ${statusFilter.toLowerCase()} applications`}
            </p>
          </div>

          <div className="table-header-controls">
            <div className="dashboard-filter-tabs">
              <button
                type="button"
                className={`dashboard-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({leaveRequests.length})
              </button>
              <button
                type="button"
                className={`dashboard-tab-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Pending')}
              >
                Pending ({stats?.pendingRequests || 0})
              </button>
              <button
                type="button"
                className={`dashboard-tab-btn ${statusFilter === 'Approved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Approved')}
              >
                Approved ({stats?.approvedRequests || 0})
              </button>
              <button
                type="button"
                className={`dashboard-tab-btn ${statusFilter === 'Rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Rejected')}
              >
                Rejected ({stats?.rejectedRequests || 0})
              </button>
            </div>

            <button
              type="button"
              className="text-link-btn"
              onClick={() => navigate('/manager/leave-requests')}
            >
              View Full History ({leaveRequests.length}) →
            </button>
          </div>
        </div>

        <div className="card-body-content p-0 mt-2">
          <LeaveTable
            requests={filteredRecentRequests}
            leaveTypes={leaveTypes}
            users={users}
            viewType="manager"
            isRecent={false}
            onViewDetails={handleView}
            onApprove={handleApprove}
            onReject={handleReject}
            emptyMessage={
              statusFilter === 'all'
                ? 'No leave requests available.'
                : `No ${statusFilter.toLowerCase()} requests found.`
            }
          />
        </div>
      </div>

      {/* 5. Team & Department Insights Row */}
      <div className="dashboard-insights-grid">
        {/* Department Distribution */}
        <div className="content-card">
          <div className="card-header-bar">
            <div>
              <h2 className="card-heading">Department Distribution</h2>
              <p className="page-subtitle">{departments.length} Active company units</p>
            </div>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => navigate('/manager/departments')}
            >
              All Departments →
            </button>
          </div>
          <div className="dept-mini-list">
            {departments.slice(0, 5).map((dept) => {
              const meta = getDepartmentMeta(dept.name);
              const DeptIcon = meta.icon;
              const deptUsersCount = users.filter((u) => u.department_id === dept.id).length;
              const pct = users.length > 0 ? Math.round((deptUsersCount / users.length) * 100) : 0;

              return (
                <div
                  key={dept.id}
                  className="dept-mini-item"
                  onClick={() => navigate('/manager/departments')}
                >
                  <div className="dept-mini-left">
                    <div
                      className="dept-mini-icon"
                      style={{ backgroundColor: meta.bgLight, color: meta.color }}
                    >
                      <DeptIcon />
                    </div>
                    <div>
                      <div className="dept-mini-name">{dept.name}</div>
                      <div className="dept-mini-count">
                        {deptUsersCount} {deptUsersCount === 1 ? 'member' : 'members'} ({pct}%)
                      </div>
                    </div>
                  </div>
                  <div className="dept-mini-right">
                    <span className="badge-active">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Operations & Quick Actions */}
        <div className="content-card">
          <div className="card-header-bar">
            <div>
              <h2 className="card-heading">Team Overview</h2>
              <p className="page-subtitle">Workforce status and operations</p>
            </div>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => navigate('/manager/employees')}
            >
              Employee Directory →
            </button>
          </div>

          <div className="team-overview-metrics">
            <div className="team-stat-box">
              <span className="team-stat-num">{users.length}</span>
              <span className="team-stat-label">Total Employees</span>
            </div>
            <div className="team-stat-box">
              <span className="team-stat-num text-amber">
                {stats?.pendingRequests || 0}
              </span>
              <span className="team-stat-label">Pending Review</span>
            </div>
            <div className="team-stat-box">
              <span className="team-stat-num text-emerald">
                {stats?.approvedRequests || 0}
              </span>
              <span className="team-stat-label">Approved YTD</span>
            </div>
          </div>

          <div className="team-quick-shortcuts">
            <h4 className="shortcuts-title">Quick Actions</h4>
            <div className="shortcuts-list">
              <button
                type="button"
                className="shortcut-btn"
                onClick={() => navigate('/manager/leave-requests')}
              >
                <div className="shortcut-icon-box bg-blue-light text-blue">
                  <FiCalendar />
                </div>
                <div className="shortcut-meta">
                  <span className="shortcut-name">Review Pending Queue</span>
                  <span className="shortcut-desc">{stats?.pendingRequests || 0} requests awaiting decision</span>
                </div>
                <FiArrowRight className="shortcut-arrow" />
              </button>
              <button
                type="button"
                className="shortcut-btn"
                onClick={() => navigate('/manager/employees')}
              >
                <div className="shortcut-icon-box bg-emerald-light text-emerald">
                  <FiUsers />
                </div>
                <div className="shortcut-meta">
                  <span className="shortcut-name">Manage Employees</span>
                  <span className="shortcut-desc">View staff directory & leave balances</span>
                </div>
                <FiArrowRight className="shortcut-arrow" />
              </button>
              <button
                type="button"
                className="shortcut-btn"
                onClick={() => navigate('/manager/departments')}
              >
                <div className="shortcut-icon-box bg-purple-light text-purple">
                  <FiLayers />
                </div>
                <div className="shortcut-meta">
                  <span className="shortcut-name">Manage Departments</span>
                  <span className="shortcut-desc">{departments.length} departments configured</span>
                </div>
                <FiArrowRight className="shortcut-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-group text-danger">
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
                Please enter a reason for rejecting this leave request. This reason will be visible to the employee:
              </p>
              <textarea
                rows={3}
                className="form-textarea w-full"
                placeholder="Reason for rejection (e.g. key project deliverable deadline, team coverage)..."
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

export default ManagerDashboard;
