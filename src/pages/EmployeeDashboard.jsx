import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import LeaveCard from '../components/LeaveCard';
import LeaveBalanceCard from '../components/LeaveBalanceCard';
import LeaveTable from '../components/LeaveTable';
import { FiPlus, FiClock, FiCheckSquare, FiCalendar } from 'react-icons/fi';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    leaveRequests,
    leaveTypes,
    balances,
    stats,
    users,
    loading
  } = useLeaves();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Employee';

  const recentRequests = leaveRequests.slice(0, 4);

  if (loading && !stats) {
    return (
      <div className="page-loading-state">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {firstName}!</p>
        </div>
      </div>

      <div className="metrics-grid">
        <LeaveCard
          title="Total Leaves"
          count={stats?.totalAnnual ?? 27}
          variant="blue"
          icon={FiCalendar}
        />
        <LeaveCard
          title="Used Leaves"
          count={stats?.totalUsed ?? 0}
          variant="green"
          icon={FiCheckSquare}
        />
        <LeaveCard
          title="Remaining Leaves"
          count={stats?.totalRemaining ?? 0}
          variant="purple"
          icon={FiClock}
        />
        <LeaveCard
          title="Pending Requests"
          count={stats?.pendingCount ?? 0}
          variant="amber"
          icon={FiPlus}
        />
      </div>

      <div className="dashboard-two-col">
        
        <div className="content-card">
          <div className="card-header-bar">
            <h2 className="card-heading">Leave Balance (Current Year)</h2>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => navigate('/employee/leave-balance')}
            >
              View All
            </button>
          </div>
          <div className="card-body-content">
            <div className="balance-compact-list">
              {balances.map((item) => (
                <LeaveBalanceCard
                  key={item.typeId}
                  name={item.name}
                  code={item.code}
                  used={item.used}
                  remaining={item.remaining}
                  annualLimit={item.annualLimit}
                  color={item.color}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header-bar">
            <h2 className="card-heading">Recent Leave Requests</h2>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => navigate('/employee/leave-history')}
            >
              View History
            </button>
          </div>
          <div className="card-body-content p-0">
            <LeaveTable
              requests={recentRequests}
              leaveTypes={leaveTypes}
              users={users}
              viewType="employee"
              isRecent={true}
              emptyMessage="You have not submitted any leave requests yet."
            />
          </div>
        </div>
      </div>

      <div className="content-card quick-actions-card">
        <h2 className="card-heading mb-4">Quick Actions</h2>
        <div className="quick-actions-btns">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/employee/apply-leave')}
          >
            Apply Leave
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/employee/leave-history')}
          >
            View Leave History
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
