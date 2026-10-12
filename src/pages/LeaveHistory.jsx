import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import LeaveTable from '../components/LeaveTable';
import { filterLeaveRequests } from '../utils/leaveUtils';
import { FiFilter, FiRotateCcw, FiPlus } from 'react-icons/fi';

export const LeaveHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveRequests, leaveTypes, users, loading } = useLeaves();

  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredRequests = useMemo(() => {
    return filterLeaveRequests(
      leaveRequests,
      {
        leaveTypeId: selectedType,
        status: selectedStatus,
        employeeId: user?.id
      },
      users
    );
  }, [leaveRequests, selectedType, selectedStatus, user?.id, users]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleViewDetails = (requestId) => {
    navigate(`/employee/leave/${requestId}`);
  };

  return (
    <div className="leave-history-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">My Leave History</h1>
          <p className="page-subtitle">Track your past and upcoming leave requests</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/employee/apply-leave')}
        >
          <FiPlus className="mr-1" /> Apply Leave
        </button>
      </div>

      <div className="content-card">
        
        <div className="filter-bar">
          <div className="filter-group">
            
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="filter-select"
              aria-label="Filter by Leave Type"
            >
              <option value="all">All Leave Types</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="filter-select"
              aria-label="Filter by Status"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {(selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-clear-filter"
                title="Clear Filters"
              >
                <FiRotateCcw className="mr-1" /> Reset Filters
              </button>
            )}
          </div>

          <div className="filter-count text-sm text-slate-500">
            Showing {filteredRequests.length} record{filteredRequests.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="card-body-content p-0 mt-3">
          <LeaveTable
            requests={paginatedRequests}
            leaveTypes={leaveTypes}
            users={users}
            viewType="employee"
            isRecent={false}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            emptyMessage={
              selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No leave requests match the selected filters.'
                : 'You have not submitted any leave requests yet.'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
