import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiPlusCircle,
  FiClock,
  FiPieChart,
  FiUser,
  FiCalendar,
  FiUsers,
  FiLayers,
  FiLogOut,
  FiX
} from 'react-icons/fi';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: FiGrid },
    { name: 'Apply Leave', path: '/employee/apply-leave', icon: FiPlusCircle },
    { name: 'My Leave History', path: '/employee/leave-history', icon: FiClock },
    { name: 'Leave Balance', path: '/employee/leave-balance', icon: FiPieChart },
    { name: 'Profile', path: '/employee/profile', icon: FiUser }
  ];

  const managerLinks = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: FiGrid },
    { name: 'Leave Requests', path: '/manager/leave-requests', icon: FiCalendar },
    { name: 'Employees', path: '/manager/employees', icon: FiUsers },
    { name: 'Departments', path: '/manager/departments', icon: FiLayers },
    { name: 'Leave Balance', path: '/manager/leave-balance', icon: FiPieChart },
    { name: 'Profile', path: '/manager/profile', icon: FiUser }
  ];

  const navLinks = isManager ? managerLinks : employeeLinks;

  return (
    <>
      
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}>
        
        <div className="sidebar-header">
          <div className="brand-logo-group">
            <div className="brand-icon-box">
              <FiCalendar className="brand-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">LeavePro</span>
            </div>
          </div>
          
          <button
            type="button"
            className="sidebar-close-btn lg:hidden"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
