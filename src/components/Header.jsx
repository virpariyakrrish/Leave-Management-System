import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { isEmojiAvatar } from '../utils/leaveUtils';

export const Header = ({ onToggleSidebar, pendingCount = 0 }) => {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }; 
 
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="header-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <FiMenu className="toggle-icon" />
        </button>
      </div>

      <div className="header-right">
        
        <div className="header-notif-wrap" title={`${pendingCount} pending notifications`}>
          <button type="button" className="notif-btn" aria-label="Notifications">
            <FiBell className="notif-icon" />
            {pendingCount > 0 && <span className="notif-badge">{pendingCount}</span>}
          </button>
        </div>

        <div className="header-profile-wrap">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="profile-btn"
            aria-expanded={dropdownOpen}
          >
            <div className="profile-avatar-wrap-header">
              {isEmojiAvatar(user?.avatar) ? (
                <span className="boy-avatar-emoji" role="img" aria-label={user?.name || 'User Avatar'}>
                  {user?.avatar || '👦'}
                </span>
              ) : (
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                  }
                  alt={user?.name || 'User Avatar'}
                  className="profile-avatar"
                />
              )}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'User'}</span>
              <span className="profile-role">
                {isManager ? 'Manager' : 'Employee'}
              </span>
            </div>
            <FiChevronDown className="profile-chevron" />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-header">
                <p className="dropdown-user-name">{user?.name}</p>
                <p className="dropdown-user-email">{user?.email}</p>
                <span className="dropdown-badge">{user?.designation || (isManager ? 'Manager' : 'Employee')}</span>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(isManager ? '/manager/profile' : '/employee/profile');
                }}
              >
                <FiUser className="dropdown-item-icon" /> Profile Details
              </button>
              <button
                type="button"
                className="dropdown-item text-rose-600 hover:bg-rose-50"
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
              >
                <FiLogOut className="dropdown-item-icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
