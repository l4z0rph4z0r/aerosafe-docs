import React, { useState, useEffect } from 'react';
import { authClient as authService } from '../../utils/authClient';
import './AdminLogin.css';

interface AdminLoginProps {
  onLoginSuccess?: (token: string) => void;
  onLoginError?: (error: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (await authService.isAuthenticated()) {
        window.location.href = '/admin/dashboard';
      }
    };
    checkAuth();
  }, []);

  // Load attempt count from localStorage
  useEffect(() => {
    const attemptKey = `auth_attempts_${username}`;
    const storedAttempts = parseInt(localStorage.getItem(attemptKey) || '0');
    setAttempts(storedAttempts);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= 5) {
      setError('Account temporarily locked. Please try again later.');
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await authService.login(username.trim(), password);
      
      if (success) {
        setError('');
        setAttempts(0);
        
        if (onLoginSuccess) {
          onLoginSuccess('success');
        } else {
          // Redirect to admin dashboard
          window.location.href = '/admin/dashboard';
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError('Invalid username or password');
        
        if (onLoginError) {
          onLoginError('Authentication failed');
        }

        // Clear password field on failed attempt
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      if (onLoginError) {
        onLoginError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError(''); // Clear error when user starts typing
    };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img 
            src="/img/IST-srl_logo.png" 
            alt="AeroSafe" 
            className="admin-login-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1 className="admin-login-title">AeroSafe Admin Panel</h1>
          <p className="admin-login-subtitle">Documentation Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-username" className="admin-form-label">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={handleInputChange(setUsername)}
              className="admin-form-input"
              placeholder="Enter admin username"
              disabled={loading || attempts >= 5}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password" className="admin-form-label">
              Password
            </label>
            <div className="admin-password-input-container">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handleInputChange(setPassword)}
                className="admin-form-input"
                placeholder="Enter admin password"
                disabled={loading || attempts >= 5}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error-message" role="alert">
              <span className="admin-error-icon">⚠️</span>
              {error}
            </div>
          )}

          {attempts > 0 && attempts < 5 && (
            <div className="admin-warning-message">
              ⚠️ Warning: {5 - attempts} attempts remaining before account lock
            </div>
          )}

          <button
            type="submit"
            className={`admin-login-button ${loading ? 'loading' : ''}`}
            disabled={loading || attempts >= 5}
          >
            {loading ? (
              <>
                <span className="admin-spinner"></span>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="admin-login-footer">
            <p className="admin-security-notice">
              🔒 This is a secure admin area. All activities are logged and monitored.
            </p>
            <p className="admin-support-info">
              Need help? Contact your system administrator.
            </p>
          </div>
        </form>

        <div className="admin-login-info">
          <details className="admin-login-help">
            <summary>Security Information</summary>
            <div className="admin-help-content">
              <ul>
                <li>Maximum 5 login attempts before temporary lockout</li>
                <li>Sessions automatically expire after 8 hours of inactivity</li>
                <li>All admin actions are logged for security purposes</li>
                <li>Use strong passwords and keep credentials secure</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;