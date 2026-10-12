
import initialMockData from '../data/mockData.json';
import {
  calculateLeaveBalances,
  calculateEmployeeStats,
  calculateManagerStats,
  calculateTotalDays,
  isValidStatusTransition
} from '../utils/leaveUtils';

const CURRENT_DATA_VERSION = 'leavepro_v6_data';

const STORAGE_KEYS = {
  USERS: 'leavepro_v6_users',
  DEPARTMENTS: 'leavepro_v6_departments',
  LEAVE_TYPES: 'leavepro_v6_leave_types',
  LEAVE_REQUESTS: 'leavepro_v6_leave_requests',
  AUTH_USER: 'leavepro_v6_auth_user'
};

const initStorage = () => {
  const version = localStorage.getItem('leavepro_data_version');
  if (version !== CURRENT_DATA_VERSION) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialMockData.users));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(initialMockData.departments));
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(initialMockData.leave_types));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(initialMockData.leave_requests));
    localStorage.setItem('leavepro_data_version', CURRENT_DATA_VERSION);
    
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  } else {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialMockData.users));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(initialMockData.departments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVE_TYPES)) {
      localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(initialMockData.leave_types));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(initialMockData.leave_requests));
    }
  }
};

initStorage();

const getStored = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return [];
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  
  async login(email, password) {
    await delay();
    const users = getStored(STORAGE_KEYS.USERS);
    const emailNormalized = (email || '').toLowerCase().trim();
    const user = users.find((u) => {
      const uEmail = u.email.toLowerCase();
      if (uEmail === emailNormalized) return true;
      if (emailNormalized === 'krish@company.com' && u.role === 'manager') return true;
      if (emailNormalized === 'denish@company.com' && u.id === 'emp-1') return true;
      return false;
    });

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    if (user.status !== 'Active') {
      throw new Error('Your account is currently inactive. Contact HR.');
    }

    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    return { success: true, data: user };
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    return { success: true };
  },

  async getUsers() {
    await delay();
    const users = getStored(STORAGE_KEYS.USERS);
    return { success: true, data: users };
  },

  async getUserById(id) {
    await delay();
    const users = getStored(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error(`User not found with ID: ${id}`);
    return { success: true, data: user };
  },

  async createUser(userData) {
    await delay();
    const users = getStored(STORAGE_KEYS.USERS);
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === (userData.email || '').toLowerCase().trim()
    );
    if (emailExists) {
      throw new Error('An employee with this email address already exists.');
    }

    const newUser = {
      id: `emp-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password || '123456',
      role: userData.role || 'employee',
      department_id: userData.department_id,
      designation: userData.designation || 'Specialist',
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: userData.status || 'Active',
      phone: userData.phone || '+91 98000 00000',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return { success: true, data: newUser };
  },

  async getDepartments() {
    await delay();
    const depts = getStored(STORAGE_KEYS.DEPARTMENTS);
    const users = getStored(STORAGE_KEYS.USERS);

    const deptsWithCounts = depts.map((d) => ({
      ...d,
      employee_count: users.filter((u) => u.department_id === d.id).length
    }));

    return { success: true, data: deptsWithCounts };
  },

  async createDepartment(deptData) {
    await delay();
    const depts = getStored(STORAGE_KEYS.DEPARTMENTS);
    const exists = depts.some(
      (d) => d.name.toLowerCase() === (deptData.name || '').toLowerCase().trim()
    );
    if (exists) {
      throw new Error('Department with this name already exists.');
    }

    const newDept = {
      id: `dept-${Date.now()}`,
      name: deptData.name,
      description: deptData.description || '',
      status: 'Active',
      created_at: new Date().toISOString()
    };

    depts.push(newDept);
    setStored(STORAGE_KEYS.DEPARTMENTS, depts);
    return { success: true, data: newDept };
  },

  async getLeaveTypes() {
    await delay();
    const types = getStored(STORAGE_KEYS.LEAVE_TYPES);
    return { success: true, data: types };
  },

  async getLeaveRequests(employeeId = null) {
    await delay();
    let requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);
    if (employeeId) {
      requests = requests.filter((r) => r.employee_id === employeeId);
    }
    
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { success: true, data: requests };
  },

  async getLeaveRequestById(id) {
    await delay();
    const requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);
    const request = requests.find((r) => r.id === id);
    if (!request) {
      throw new Error(`Leave request not found with ID: ${id}`);
    }
    return { success: true, data: request };
  },

  async createLeaveRequest(requestPayload) {
    await delay();
    const requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);
    const leaveTypes = getStored(STORAGE_KEYS.LEAVE_TYPES);

    const leaveType = leaveTypes.find((lt) => lt.id === requestPayload.leave_type_id);
    if (!leaveType) {
      throw new Error('Selected leave type does not exist.');
    }

    const totalDays = calculateTotalDays(
      requestPayload.start_date,
      requestPayload.end_date,
      requestPayload.is_half_day
    );

    if (totalDays <= 0) {
      throw new Error('Invalid leave duration calculated from dates.');
    }

    const balances = calculateLeaveBalances(leaveTypes, requests, requestPayload.employee_id);
    const currentBalance = balances.find((b) => b.typeId === requestPayload.leave_type_id);
    if (currentBalance && totalDays > currentBalance.remaining) {
      throw new Error(
        `Requested leave (${totalDays} day${totalDays > 1 ? 's' : ''}) exceeds your remaining balance (${currentBalance.remaining} day${currentBalance.remaining !== 1 ? 's' : ''}).`
      );
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      employee_id: requestPayload.employee_id,
      leave_type_id: requestPayload.leave_type_id,
      start_date: requestPayload.start_date,
      end_date: requestPayload.end_date,
      total_days: totalDays,
      is_half_day: Boolean(requestPayload.is_half_day),
      reason: requestPayload.reason.trim(),
      status: 'Pending',
      approved_by: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    requests.unshift(newRequest);
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);
    return { success: true, data: newRequest };
  },

  async approveLeaveRequest(id, managerId) {
    await delay();
    const requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Leave request not found.');
    }

    const currentReq = requests[index];
    if (!isValidStatusTransition(currentReq.status, 'Approved')) {
      throw new Error(`Cannot approve request that is already ${currentReq.status}.`);
    }

    requests[index] = {
      ...currentReq,
      status: 'Approved',
      approved_by: managerId,
      updated_at: new Date().toISOString()
    };

    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);
    return { success: true, data: requests[index] };
  },

  async rejectLeaveRequest(id, managerId, reason = '') {
    await delay();
    const requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Leave request not found.');
    }

    const currentReq = requests[index];
    if (!isValidStatusTransition(currentReq.status, 'Rejected')) {
      throw new Error(`Cannot reject request that is already ${currentReq.status}.`);
    }

    requests[index] = {
      ...currentReq,
      status: 'Rejected',
      approved_by: managerId,
      rejection_reason: reason || 'Request declined by manager.',
      updated_at: new Date().toISOString()
    };

    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);
    return { success: true, data: requests[index] };
  },

  async getLeaveBalance(employeeId) {
    await delay();
    const leaveTypes = getStored(STORAGE_KEYS.LEAVE_TYPES);
    const requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);
    const balances = calculateLeaveBalances(leaveTypes, requests, employeeId);
    return { success: true, data: balances };
  },

  async getDashboardStats(employeeId, role = 'employee') {
    await delay();
    const leaveTypes = getStored(STORAGE_KEYS.LEAVE_TYPES);
    const requests = getStored(STORAGE_KEYS.LEAVE_REQUESTS);

    if (role === 'manager') {
      const stats = calculateManagerStats(requests);
      return { success: true, data: stats };
    } else {
      const stats = calculateEmployeeStats(leaveTypes, requests, employeeId);
      return { success: true, data: stats };
    }
  },

  resetData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialMockData.users));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(initialMockData.departments));
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(initialMockData.leave_types));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(initialMockData.leave_requests));
    return { success: true };
  }
};
