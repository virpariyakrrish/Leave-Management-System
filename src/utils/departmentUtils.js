import React from 'react';
import {
  FiLayout,
  FiCode,
  FiCheckCircle,
  FiUsers,
  FiDollarSign,
  FiBriefcase
} from 'react-icons/fi';

/**
 * Rich metadata configuration for departments
 */
export const getDepartmentMeta = (name = '') => {
  const lower = name.toLowerCase();

  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('creative')) {
    return {
      theme: 'design',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      heroGradient: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)',
      color: '#8b5cf6',
      accentColor: '#ec4899',
      bgLight: '#faf5ff',
      borderLight: '#f3e8ff',
      badge: 'UI/UX & Product Design',
      icon: FiLayout,
      tags: ['UI/UX Design', 'Design Systems', 'Figma', 'Prototyping', 'User Research'],
      mission: 'Crafting user-centric digital experiences, elegant design systems, responsive interfaces, and interactive prototypes for web and mobile.'
    };
  }

  if (lower.includes('dev') || lower.includes('engineer') || lower.includes('software') || lower.includes('tech')) {
    return {
      theme: 'development',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      heroGradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #4f46e5 100%)',
      color: '#2563eb',
      accentColor: '#4f46e5',
      bgLight: '#eff6ff',
      borderLight: '#dbeafe',
      badge: 'Engineering & Tech',
      icon: FiCode,
      tags: ['Frontend', 'Backend', 'Full Stack', 'Cloud & APIs', 'DevOps & CI/CD'],
      mission: 'Architecting robust, scalable software applications, high-throughput microservices, and reliable cloud infrastructure.'
    };
  }

  if (lower.includes('qa') || lower.includes('quality') || lower.includes('test')) {
    return {
      theme: 'qa',
      gradient: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
      heroGradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #0d9488 100%)',
      color: '#10b981',
      accentColor: '#0d9488',
      bgLight: '#ecfdf5',
      borderLight: '#d1fae5',
      badge: 'Quality Assurance & Testing',
      icon: FiCheckCircle,
      tags: ['Automated Testing', 'Cypress', 'Regression', 'API Testing', 'Performance QA'],
      mission: 'Ensuring world-class product stability, zero-regression software deliveries, comprehensive test automation, and security.'
    };
  }

  if (lower.includes('hr') || lower.includes('human') || lower.includes('people') || lower.includes('talent')) {
    return {
      theme: 'hr',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
      heroGradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)',
      color: '#f43f5e',
      accentColor: '#fb7185',
      bgLight: '#fff1f2',
      borderLight: '#ffe4e6',
      badge: 'People & Culture',
      icon: FiUsers,
      tags: ['Talent Acquisition', 'Employee Experience', 'Team Culture', 'HR Operations', 'Wellness'],
      mission: 'Empowering organizational culture, talent recruitment, employee well-being, engagement initiatives, and workplace excellence.'
    };
  }

  if (lower.includes('finan') || lower.includes('account') || lower.includes('payroll') || lower.includes('billing')) {
    return {
      theme: 'finance',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      heroGradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)',
      color: '#f59e0b',
      accentColor: '#d97706',
      bgLight: '#fffbeb',
      borderLight: '#fef3c7',
      badge: 'Finance & Accounts',
      icon: FiDollarSign,
      tags: ['Financial Planning', 'Payroll', 'Budget Audits', 'Tax Compliance', 'Fiscal Analytics'],
      mission: 'Managing company fiscal health, operational budgeting, automated employee payroll, and financial compliance standards.'
    };
  }

  return {
    theme: 'general',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
    heroGradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #4f46e5 100%)',
    color: '#0284c7',
    accentColor: '#4f46e5',
    bgLight: '#f0f9ff',
    borderLight: '#e0f2fe',
    badge: 'Operations & Strategy',
    icon: FiBriefcase,
    tags: ['Strategic Planning', 'Cross-functional', 'Delivery', 'Operational Focus'],
    mission: 'Core organizational department driving business excellence, strategic execution, and sustainable company development.'
  };
};

/**
 * Checks an employee's current real-time presence/leave status
 */
export const getEmployeePresenceStatus = (employeeId, leaveRequests = []) => {
  if (!employeeId || !leaveRequests.length) {
    return {
      isAway: false,
      statusLabel: 'Active & Present',
      statusType: 'active',
      returnDate: null,
      activeRequest: null
    };
  }

  const empRequests = leaveRequests.filter((r) => r.employee_id === employeeId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check approved leaves that cover today
  const activeApproved = empRequests.find((r) => {
    if (r.status !== 'Approved') return false;
    const s = new Date(r.start_date);
    s.setHours(0, 0, 0, 0);
    const e = new Date(r.end_date);
    e.setHours(23, 59, 59, 999);
    return today >= s && today <= e;
  });

  if (activeApproved) {
    return {
      isAway: true,
      statusLabel: `On Leave (Until ${activeApproved.end_date})`,
      statusType: 'leave',
      returnDate: activeApproved.end_date,
      activeRequest: activeApproved
    };
  }

  // Check upcoming approved leave
  const upcomingApproved = empRequests.find((r) => {
    if (r.status !== 'Approved') return false;
    const s = new Date(r.start_date);
    s.setHours(0, 0, 0, 0);
    return s > today;
  });

  if (upcomingApproved) {
    return {
      isAway: false,
      statusLabel: `Leave scheduled (${upcomingApproved.start_date})`,
      statusType: 'upcoming',
      returnDate: upcomingApproved.end_date,
      activeRequest: upcomingApproved
    };
  }

  // Check pending leave request
  const pendingReq = empRequests.find((r) => r.status === 'Pending');
  if (pendingReq) {
    return {
      isAway: false,
      statusLabel: `Leave Request Pending (${pendingReq.total_days}d)`,
      statusType: 'pending',
      returnDate: pendingReq.end_date,
      activeRequest: pendingReq
    };
  }

  return {
    isAway: false,
    statusLabel: 'Active & Present',
    statusType: 'active',
    returnDate: null,
    activeRequest: null
  };
};

/**
 * Calculates metrics for a specific department
 */
export const calculateDepartmentStats = (deptId, users = [], leaveRequests = []) => {
  const deptMembers = users.filter((u) => u.department_id === deptId);
  const memberIds = deptMembers.map((u) => u.id);
  const deptRequests = leaveRequests.filter((r) => memberIds.includes(r.employee_id));

  let awayCount = 0;
  let activeCount = 0;

  deptMembers.forEach((member) => {
    const presence = getEmployeePresenceStatus(member.id, deptRequests);
    if (presence.isAway) {
      awayCount++;
    } else {
      activeCount++;
    }
  });

  const approvedRequests = deptRequests.filter((r) => r.status === 'Approved');
  const pendingRequests = deptRequests.filter((r) => r.status === 'Pending');
  const totalDaysTaken = approvedRequests.reduce((sum, r) => sum + (Number(r.total_days) || 0), 0);

  // Identify department lead or manager
  const departmentLead = deptMembers.find(
    (u) =>
      u.role === 'manager' ||
      (u.designation && (u.designation.toLowerCase().includes('lead') || u.designation.toLowerCase().includes('manager')))
  ) || deptMembers[0] || null;

  return {
    totalMembers: deptMembers.length,
    activeCount,
    awayCount,
    pendingRequestsCount: pendingRequests.length,
    totalApprovedCount: approvedRequests.length,
    totalDaysTaken,
    departmentLead,
    deptMembers,
    deptRequests
  };
};
