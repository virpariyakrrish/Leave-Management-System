
export const calculateTotalDays = (startDate, endDate, isHalfDay = false) => {
  if (isHalfDay) return 0.5;
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  if (endUtc < startUtc) return 0;

  const diffMs = endUtc - startUtc;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 0;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return '-';
  if (!endDate || startDate === endDate) {
    const d = new Date(startDate);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]}`;
  }

  const s = new Date(startDate);
  const e = new Date(endDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const sStr = `${String(s.getDate()).padStart(2, '0')} ${months[s.getMonth()]}`;
  const eStr = `${String(e.getDate()).padStart(2, '0')} ${months[e.getMonth()]}`;
  return `${sStr} - ${eStr}`;
};

export const calculateLeaveBalances = (leaveTypes = [], leaveRequests = [], employeeId) => {
  if (!leaveTypes || !leaveTypes.length) return [];

  const empRequests = employeeId
    ? leaveRequests.filter((req) => req.employee_id === employeeId)
    : leaveRequests;

  return leaveTypes.map((lt) => {
    
    const approvedRequests = empRequests.filter(
      (req) => req.leave_type_id === lt.id && req.status === 'Approved'
    );

    const used = approvedRequests.reduce((sum, req) => sum + Number(req.total_days || 0), 0);
    const annualLimit = Number(lt.annual_limit) || 0;
    const remaining = Math.max(0, annualLimit - used);
    const percentUsed = annualLimit > 0 ? Math.min(100, Math.round((used / annualLimit) * 100)) : 0;

    return {
      typeId: lt.id,
      name: lt.name,
      code: lt.code,
      annualLimit,
      used,
      remaining,
      percentUsed,
      color: lt.color || '#2563eb',
      status: lt.status || 'Active'
    };
  });
};

export const calculateEmployeeStats = (leaveTypes = [], leaveRequests = [], employeeId) => {
  const balances = calculateLeaveBalances(leaveTypes, leaveRequests, employeeId);
  const empRequests = employeeId
    ? leaveRequests.filter((req) => req.employee_id === employeeId)
    : [];

  const totalAnnual = balances.reduce((sum, b) => sum + b.annualLimit, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalRemaining = Math.max(0, totalAnnual - totalUsed);
  const pendingCount = empRequests.filter((r) => r.status === 'Pending').length;

  return {
    totalAnnual,
    totalUsed,
    totalRemaining,
    pendingCount
  };
};

export const calculateManagerStats = (leaveRequests = []) => {
  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter((r) => r.status === 'Pending').length;
  const approvedRequests = leaveRequests.filter((r) => r.status === 'Approved').length;
  const rejectedRequests = leaveRequests.filter((r) => r.status === 'Rejected').length;

  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests
  };
};

export const filterLeaveRequests = (requests = [], filters = {}, users = []) => {
  const { search = '', leaveTypeId = 'all', status = 'all', employeeId } = filters;

  return requests.filter((req) => {
    
    if (employeeId && req.employee_id !== employeeId) {
      return false;
    }

    if (status && status !== 'all' && req.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }

    if (leaveTypeId && leaveTypeId !== 'all' && req.leave_type_id !== leaveTypeId) {
      return false;
    }

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      const user = users.find((u) => u.id === req.employee_id);
      const userName = user ? user.name.toLowerCase() : '';
      const userDesignation = user?.designation ? user.designation.toLowerCase() : '';
      const reason = (req.reason || '').toLowerCase();

      const matchesName = userName.includes(term);
      const matchesDesignation = userDesignation.includes(term);
      const matchesReason = reason.includes(term);

      if (!matchesName && !matchesDesignation && !matchesReason) {
        return false;
      }
    }

    return true;
  });
};

export const isValidStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus !== 'Pending') {
    return false; 
  }
  return newStatus === 'Approved' || newStatus === 'Rejected';
};

export const isEmojiAvatar = (avatar) => {
  if (!avatar) return false;
  return (
    avatar === '👦' ||
    avatar.includes('👦') ||
    avatar === '/boy-avatar.svg' ||
    (!avatar.startsWith('http://') && !avatar.startsWith('https://') && !avatar.startsWith('/') && !avatar.startsWith('data:'))
  );
};
