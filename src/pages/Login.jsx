import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateLoginForm } from '../utils/validation';
import {
  FiCalendar,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUserCheck,
  FiShield,
  FiArrowRight
} from 'react-icons/fi';

export const Login = () => {
  const { login, isAuthenticated, isManager } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const target = isManager ? '/manager/dashboard' : '/employee/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isManager, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        const redirectPath =
          res.user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        setAuthError(res.message || 'Invalid credentials.');
        showToast(res.message || 'Login failed', 'error');
      }
    } catch {
      setAuthError('An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="login-page-container">
      
      <div className="login-banner-side">
        <div className="login-banner-content">
          <div className="banner-logo-group">
            <div className="banner-logo-icon">
              <FiCalendar />
            </div>
            <div>
              <h1 className="banner-app-name">LeavePro</h1>
              <p className="banner-app-subtitle">Employee Leave Management System</p>
            </div>
          </div>

          <div className="banner-illustration-wrap">
            
            <svg
              className="banner-illustration-svg"
              viewBox="0 0 500 350"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              
              <rect x="50" y="270" width="400" height="12" rx="6" fill="#3b82f6" fillOpacity="0.2" />
              <rect x="70" y="282" width="20" height="60" rx="3" fill="#94a3b8" />
              <rect x="410" y="282" width="20" height="60" rx="3" fill="#94a3b8" />
              
              <rect x="330" y="60" width="100" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="330" y="60" width="100" height="28" rx="10" fill="#2563eb" />
              <circle cx="350" cy="74" r="3" fill="#ffffff" />
              <circle cx="410" cy="74" r="3" fill="#ffffff" />
              <rect x="345" y="105" width="20" height="10" rx="2" fill="#bfdbfe" />
              <rect x="375" y="105" width="20" height="10" rx="2" fill="#bfdbfe" />
              <rect x="405" y="105" width="15" height="10" rx="2" fill="#bfdbfe" />
              <rect x="345" y="125" width="20" height="10" rx="2" fill="#22c55e" />
              <rect x="375" y="125" width="20" height="10" rx="2" fill="#f59e0b" />
              <rect x="405" y="125" width="15" height="10" rx="2" fill="#bfdbfe" />
              
              <path d="M75 270 L85 220 L115 220 L125 270 Z" fill="#cbd5e1" />
              <circle cx="100" cy="195" r="28" fill="#10b981" fillOpacity="0.85" />
              <circle cx="85" cy="180" r="18" fill="#059669" />
              <circle cx="115" cy="180" r="18" fill="#34d399" />
              
              <circle cx="230" cy="120" r="30" fill="#fcd34d" />
              <path d="M210 115 Q230 90 250 115" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
              <path d="M190 270 C190 190 270 190 270 270 Z" fill="#2563eb" />
              
              <polygon points="170,270 290,270 280,240 180,240" fill="#475569" />
              <rect x="185" y="180" width="90" height="60" rx="5" fill="#1e293b" />
              <rect x="190" y="185" width="80" height="50" rx="3" fill="#60a5fa" />
              <circle cx="230" cy="210" r="8" fill="#ffffff" />
              
              <rect x="305" y="245" width="20" height="25" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M325 250 C332 250 332 260 325 260" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="banner-tagline">
            <p className="banner-quote">
              "Manage your leaves, track your balance and keep your work-life balance."
            </p>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-title">Welcome Back!</h2>
            <p className="login-subtitle">Login to your account to continue</p>
          </div>

          {authError && (
            <div className="login-error-banner" role="alert">
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className={`form-input has-icon ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input has-icon ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary w-full login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-loading-content">Logging in...</span>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="login-contact-hr">
            <span>Don't have an account? </span>
            <a
              href="#contact-hr"
              onClick={(e) => {
                e.preventDefault();
                showToast('Please contact HR Department at hr@company.com to register.', 'info');
              }}
              className="contact-hr-link"
            >
              Contact your HR
            </a>
          </div>

          {/* Demo Credentials Box */}
          <div className="demo-accounts-box">
            <div className="demo-accounts-header">
              <span className="demo-title">Demo Accounts</span>
              <span className="demo-hint text-xs text-slate-400">Click card to autofill</span>
            </div>

            <div className="demo-cards-grid">
              {/* Employee Demo Card */}
              <button
                type="button"
                className={`demo-card ${email === 'employee@company.com' ? 'demo-card-selected' : ''}`}
                onClick={() => handleFillDemo('employee@company.com', '123456')}
              >
                <div className="demo-card-icon emp-demo-icon overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                    alt="Denish"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center' }}
                  />
                </div>
                <div className="demo-card-text">
                  <div className="demo-role-title">Employee (Denish)</div>
                  <div className="demo-creds">employee@company.com / 123456</div>
                </div>
                <FiArrowRight className="demo-arrow" />
              </button>

              {/* Manager Demo Card */}
              <button
                type="button"
                className={`demo-card ${email === 'manager@company.com' ? 'demo-card-selected' : ''}`}
                onClick={() => handleFillDemo('manager@company.com', '123456')}
              >
                <div className="demo-card-icon mgr-demo-icon overflow-hidden">
                  <span className="boy-avatar-emoji" role="img" aria-label="Krish Virpariya">👦</span>
                </div>
                <div className="demo-card-text">
                  <div className="demo-role-title">Manager (Krish Virpariya)</div>
                  <div className="demo-creds">manager@company.com / 123456</div>
                </div>
                <FiArrowRight className="demo-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
