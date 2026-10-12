import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import LeaveBalance from './pages/LeaveBalance';
import LeaveDetails from './pages/LeaveDetails';
import LeaveRequests from './pages/LeaveRequests';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Profile from './pages/Profile';

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<RootRedirect />} />

            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRole="employee">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="apply-leave" element={<ApplyLeave />} />
              <Route path="leave-history" element={<LeaveHistory />} />
              <Route path="leave-balance" element={<LeaveBalance />} />
              <Route path="leave/:id" element={<LeaveDetails />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRole="manager">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="leave-requests/:id" element={<LeaveDetails />} />
              <Route path="employees" element={<Employees />} />
              <Route path="departments" element={<Departments />} />
              <Route path="leave-balance" element={<LeaveBalance />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
