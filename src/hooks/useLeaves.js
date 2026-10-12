
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const useLeaves = () => {
  const { user, isManager } = useAuth();
  const { showToast } = useToast();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      
      const [typesRes, usersRes, deptsRes] = await Promise.all([
        apiService.getLeaveTypes(),
        apiService.getUsers(),
        apiService.getDepartments()
      ]);

      setLeaveTypes(typesRes.data || []);
      setUsers(usersRes.data || []);
      setDepartments(deptsRes.data || []);

      if (isManager) {
        const [requestsRes, statsRes] = await Promise.all([
          apiService.getLeaveRequests(), 
          apiService.getDashboardStats(user.id, 'manager')
        ]);
        setLeaveRequests(requestsRes.data || []);
        setStats(statsRes.data || null);
      } else {
        const [requestsRes, balancesRes, statsRes] = await Promise.all([
          apiService.getLeaveRequests(user.id), 
          apiService.getLeaveBalance(user.id),
          apiService.getDashboardStats(user.id, 'employee')
        ]);
        setLeaveRequests(requestsRes.data || []);
        setBalances(balancesRes.data || []);
        setStats(statsRes.data || null);
      }
    } catch (err) {
      console.error('Failed to load leave data:', err);
      setError(err.message || 'Failed to load leave data');
      showToast(err.message || 'Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, isManager, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyLeave = async (formData) => {
    if (!user) return { success: false, message: 'User not logged in' };
    setActionLoading(true);
    try {
      const response = await apiService.createLeaveRequest({
        ...formData,
        employee_id: user.id
      });

      if (response.success) {
        showToast('Leave request submitted successfully!', 'success');
        await loadData();
        return { success: true, data: response.data };
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit leave request', 'error');
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const approveLeave = async (requestId) => {
    if (!isManager) {
      showToast('Unauthorized: Only managers can approve leave.', 'error');
      return { success: false };
    }
    setActionLoading(true);
    try {
      const response = await apiService.approveLeaveRequest(requestId, user.id);
      if (response.success) {
        showToast('Leave request approved successfully!', 'success');
        await loadData();
        return { success: true, data: response.data };
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve leave request', 'error');
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const rejectLeave = async (requestId, reason) => {
    if (!isManager) {
      showToast('Unauthorized: Only managers can reject leave.', 'error');
      return { success: false };
    }
    setActionLoading(true);
    try {
      const response = await apiService.rejectLeaveRequest(requestId, user.id, reason);
      if (response.success) {
        showToast('Leave request rejected.', 'info');
        await loadData();
        return { success: true, data: response.data };
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject leave request', 'error');
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    leaveRequests,
    leaveTypes,
    balances,
    stats,
    users,
    departments,
    loading,
    actionLoading,
    error,
    refreshData: loadData,
    applyLeave,
    approveLeave,
    rejectLeave
  };
};
