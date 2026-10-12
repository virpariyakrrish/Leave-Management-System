
export const validateLeaveForm = (formData, availableBalances = []) => {
  const errors = {};

  if (!formData.leaveTypeId || formData.leaveTypeId === '') {
    errors.leaveTypeId = 'Please select a leave type.';
  }

  if (!formData.startDate) {
    errors.startDate = 'Start date is required.';
  }

  if (!formData.endDate) {
    errors.endDate = 'End date is required.';
  }

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date format.';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date format.';
    }

    if (!errors.startDate && !errors.endDate) {
      if (end < start) {
        errors.endDate = 'End date cannot be earlier than start date.';
      }

      if (formData.isHalfDay && formData.startDate !== formData.endDate) {
        errors.isHalfDay = 'Half day leave must be for a single date.';
      }
    }
  }

  if (!formData.reason || formData.reason.trim().length === 0) {
    errors.reason = 'Reason for leave is required.';
  } else if (formData.reason.trim().length < 5) {
    errors.reason = 'Reason must be at least 5 characters long.';
  }

  if (!errors.leaveTypeId && !errors.startDate && !errors.endDate && !errors.isHalfDay) {
    const selectedBalance = availableBalances.find((b) => b.typeId === formData.leaveTypeId);
    if (selectedBalance) {
      const requestedDays = formData.isHalfDay ? 0.5 : getDaysBetween(formData.startDate, formData.endDate);
      if (requestedDays > selectedBalance.remaining) {
        errors.leaveTypeId = `Requested duration (${requestedDays} day${requestedDays > 1 ? 's' : ''}) exceeds your remaining balance (${selectedBalance.remaining} day${selectedBalance.remaining !== 1 ? 's' : ''} available).`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginForm = (credentials) => {
  const errors = {};

  if (!credentials.email || credentials.email.trim() === '') {
    errors.email = 'Email address is required.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  if (!credentials.password || credentials.password.trim() === '') {
    errors.password = 'Password is required.';
  } else if (credentials.password.length < 4) {
    errors.password = 'Password must be at least 4 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmployeeForm = (data) => {
  const errors = {};
  if (!data.name || data.name.trim() === '') errors.name = 'Full name is required.';
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Invalid email address format.';
  }
  if (!data.department_id) errors.department_id = 'Department is required.';
  if (!data.designation || data.designation.trim() === '') errors.designation = 'Designation is required.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

function getDaysBetween(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const sUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const eUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  if (eUtc < sUtc) return 0;
  return Math.floor((eUtc - sUtc) / (1000 * 60 * 60 * 24)) + 1;
}
