import React from 'react';
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
  FiArrowRight
} from 'react-icons/fi';

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
    loading
  } = useLeaves();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Manager';
  const recentRequests = leaveRequests.slice(0, 5);

  const handleApprove = async (id) => {
    await approveLeave(id);
  };

  const handleReject = async (id) => {
    navigate(`/manager/leave-requests/${id}`);
  };

  const handleView = (id) => {
    navigate(`/manager/leave-requests/${id}`);
  };

  return (
    <div className="manager-dashboard-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Manager Dashboard</h1>
          <p className="page-subtitle">Welcome back, {firstName}! Overview of team leaves and operations</p>
        </div>
      </div>

      <div className="metrics-grid mb-6">
        <LeaveCard
          title="Total Requests"
          count={stats?.totalRequests ?? 0}
          variant="blue"
          icon={FiFileText}
          subtitle="All submitted applications"
        />
        <LeaveCard
          title="Pending Requests"
          count={stats?.pendingRequests ?? 0}
          variant="amber"
          icon={FiClock}
          subtitle="Awaiting management review"
        />
        <LeaveCard
          title="Approved Requests"
          count={stats?.approvedRequests ?? 0}
          variant="green"
          icon={FiCheckCircle}
          subtitle="Successfully granted"
        />
        <LeaveCard
          title="Rejected Requests"
          count={stats?.rejectedRequests ?? 0}
          variant="red"
          icon={FiXCircle}
          subtitle="Declined applications"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className="quick-nav-box cursor-pointer hover:border-blue-400"
          onClick={() => navigate('/manager/leave-requests')}
        >
          <div className="flex items-center gap-3">
            <div className="quick-nav-icon bg-blue-50 text-blue-600">
              <FiCalendar />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Leave Requests</h3>
              <p className="text-xs text-slate-500">
                {stats?.pendingRequests || 0} pending review
              </p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400" />
        </div>

        <div
          className="quick-nav-box cursor-pointer hover:border-emerald-400"
          onClick={() => navigate('/manager/employees')}
        >
          <div className="flex items-center gap-3">
            <div className="quick-nav-icon bg-emerald-50 text-emerald-600">
              <FiUsers />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Employees</h3>
              <p className="text-xs text-slate-500">
                {users.length} active team members
              </p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400" />
        </div>

        <div
          className="quick-nav-box cursor-pointer hover:border-purple-400"
          onClick={() => navigate('/manager/departments')}
        >
          <div className="flex items-center gap-3">
            <div className="quick-nav-icon bg-purple-50 text-purple-600">
              <FiLayers />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Departments</h3>
              <p className="text-xs text-slate-500">
                {departments.length} company departments
              </p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400" />
        </div>
      </div>

      <div className="content-card">
        <div className="card-header-bar">
          <div>
            <h2 className="card-heading">Recent Leave Requests</h2>
            <p className="text-xs text-slate-400">Applications across all departments</p>
          </div>
          <button
            type="button"
            className="text-link-btn"
            onClick={() => navigate('/manager/leave-requests')}
          >
            View All ({leaveRequests.length})
          </button>
        </div>

        <div className="card-body-content p-0 mt-2">
          <LeaveTable
            requests={recentRequests}
            leaveTypes={leaveTypes}
            users={users}
            viewType="manager"
            isRecent={false}
            onViewDetails={handleView}
            onApprove={handleApprove}
            onReject={handleReject}
            emptyMessage="No leave requests available."
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
