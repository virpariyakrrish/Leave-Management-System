import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaves } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';
import LeaveTable from '../components/LeaveTable';
import { filterLeaveRequests } from '../utils/leaveUtils';
import {
  FiSearch,
  FiFilter,
  FiRotateCcw,
  FiCheck,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';

export const LeaveRequests = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    leaveRequests,
    leaveTypes,
    users,
    approveLeave,
    rejectLeave,
    actionLoading
  } = useLeaves();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = useMemo(() => {
    return filterLeaveRequests(
      leaveRequests,
      {
        search: searchTerm,
        leaveTypeId: selectedType,
        status: selectedStatus
      },
      users
    );
  }, [leaveRequests, searchTerm, selectedType, selectedStatus, users]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleViewDetails = (requestId) => {
    navigate(`/manager/leave-requests/${requestId}`);
  };

  const handleApprove = async (requestId) => {
    await approveLeave(requestId);
  };

  const handleOpenRejectModal = (requestId) => {
    setActiveRejectId(requestId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!activeRejectId) return;
    const res = await rejectLeave(activeRejectId, rejectReason);
    if (res.success) {
      setRejectModalOpen(false);
      setActiveRejectId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="leave-requests-page">
      
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-main-title">Leave Requests</h1>
          <p className="page-subtitle">Manage, approve, or reject employee leave requests</p>
        </div>
      </div>

      <div className="content-card">
        
        <div className="filter-bar flex-col md:flex-row gap-3">
          
          <div className="search-input-wrap flex-1">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, leave type, reason..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            
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

            {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-clear-filter"
                title="Reset All Filters"
              >
                <FiRotateCcw className="mr-1" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="card-body-content p-0 mt-3">
          <LeaveTable
            requests={paginatedRequests}
            leaveTypes={leaveTypes}
            users={users}
            viewType="manager"
            isRecent={false}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleOpenRejectModal}
            emptyMessage={
              searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No requests match your current search and filter criteria.'
                : 'No employee leave requests found.'
            }
          />
        </div>
      </div>

      {rejectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-lg">
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
                placeholder="Reason for rejection (e.g. key deliverable deadline, insufficient coverage)..."
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

export default LeaveRequests;
