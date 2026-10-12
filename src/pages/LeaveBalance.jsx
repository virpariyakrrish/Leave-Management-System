import React from 'react';
import { useLeaves } from '../hooks/useLeaves';
import LeaveBalanceCard from '../components/LeaveBalanceCard';
import { FiInfo, FiCheckCircle, FiCalendar, FiShield } from 'react-icons/fi';

export const LeaveBalance = () => {
  const { balances, leaveTypes, loading } = useLeaves();

  const totalEntitlement = leaveTypes.reduce((sum, lt) => sum + (Number(lt.annual_limit) || 0), 0);
  const totalApprovedUsed = balances.reduce((sum, b) => sum + (Number(b.used) || 0), 0);
  const totalRemaining = balances.reduce((sum, b) => sum + (Number(b.remaining) || 0), 0);

  if (loading && !balances.length) {
    return (
      <div className="page-loading-state">
        <div className="spinner"></div>
        <p>Loading leave balances...</p>
      </div>
    );
  }

  return (
    <div className="leave-balance-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Leave Balance</h1>
          <p className="page-subtitle">Your current leave balance</p>
        </div>
      </div>

      <div className="balance-cards-grid mb-6">
        {balances.map((item) => (
          <LeaveBalanceCard
            key={item.typeId}
            name={item.name}
            code={item.code}
            used={item.used}
            remaining={item.remaining}
            annualLimit={item.annualLimit}
            color={item.color}
            variant="card"
          />
        ))}
      </div>

      <div className="content-card mb-6">
        <div className="card-header-bar">
          <h2 className="card-heading">Leave Balance Policy</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            Total Entitlement: {totalEntitlement} Days/Year
          </span>
        </div>
        <div className="card-body-content">
          <div className="policy-list-grid">
            {leaveTypes.map((lt) => (
              <div key={lt.id} className="policy-item-row">
                <div className="policy-item-left">
                  <span
                    className="policy-bullet-dot"
                    style={{ backgroundColor: lt.color || '#2563eb' }}
                  />
                  <span className="font-medium text-slate-800">
                    {lt.name} ({lt.code})
                  </span>
                </div>
                <div className="policy-item-right font-semibold text-slate-700">
                  {lt.annual_limit} per year
                </div>
              </div>
            ))}
          </div>

          <div className="policy-summary-strip mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-sm text-slate-600 gap-2">
            <span>
              Total Approved Days Used: <strong>{totalApprovedUsed} days</strong>
            </span>
            <span>
              Total Available Remaining: <strong>{totalRemaining} days</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="policy-note-banner">
        <FiInfo className="policy-note-icon" />
        <div className="policy-note-text">
          <strong>Note:</strong> Leave balance will be updated after approval of your leave request.
          Pending requests do not deduct from your available balance until approved by management.
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
