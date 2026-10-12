import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => apiService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    const stored = apiService.getCurrentUser();
    if (stored && (!user || stored.id !== user.id)) {
      setUser(stored);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        setUser(response.data);
        return { success: true, user: response.data };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee',
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
