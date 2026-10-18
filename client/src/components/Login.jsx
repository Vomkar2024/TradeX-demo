import React, { useContext, useState } from 'react';
import { GeneralContext } from '../context/GeneralContext';

const Login = ({ setIsLoginBox }) => {
  const { setEmail, setPassword, login, loginDemo } = useContext(GeneralContext);
  const [localEmail, setLocalEmail] = useState('');
  const [localPassword, setLocalPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    await login();
  };

  const fillCredentials = (emailVal, passVal) => {
    setLocalEmail(emailVal);
    setLocalPassword(passVal);
    setEmail(emailVal);
    setPassword(passVal);
  };

  return (
    <form className="authForm card shadow-lg border-0 p-4 p-md-5" onSubmit={handleLogin}>
      <div className="text-center mb-4">
        <div className="brand-logo-badge mx-auto mb-2" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>TX</div>
        <h2 className="fw-bold mb-1">Sign In to TradeX</h2>
        <p className="text-secondary small mb-0">Access your professional trading terminal</p>
      </div>
      
      {/* Email Input Field */}
      <div className="mb-3 text-start">
        <label htmlFor="loginEmailInput" className="auth-form-label">
          Email Address
        </label>
        <input
          type="email"
          className="form-control auth-input-clean w-100"
          id="loginEmailInput"
          placeholder="e.g. demo@tradex.com"
          value={localEmail}
          onChange={(e) => {
            setLocalEmail(e.target.value);
            setEmail(e.target.value);
          }}
          required
          autoComplete="email"
        />
      </div>

      {/* Password Input Field */}
      <div className="mb-4 text-start">
        <label htmlFor="loginPasswordInput" className="auth-form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control auth-input-clean w-100"
          id="loginPasswordInput"
          placeholder="Enter account password"
          value={localPassword}
          onChange={(e) => {
            setLocalPassword(e.target.value);
            setPassword(e.target.value);
          }}
          required
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn btn-primary w-100 py-3 fw-semibold shadow-sm mb-3 btn-auth-submit">
        Sign In with Credentials
      </button>

      {/* Demo Mode Quick Access Section */}
      <div className="demo-access-section">
        <div className="demo-divider">
          <span>OR EXPLORE INSTANTLY</span>
        </div>

        <button
          type="button"
          className="demo-action-btn-enhanced w-100"
          onClick={() => loginDemo('customer')}
        >
          <div className="demo-action-content">
            <div className="demo-action-icon-wrap">
              <span className="demo-action-bolt">⚡</span>
            </div>
            <div className="demo-action-text text-start">
              <div className="demo-action-heading">Launch ₹500 Demo Desk</div>
              <div className="demo-action-sub">Instant risk-free equity simulation • No password needed</div>
            </div>
            <div className="demo-action-arrow">→</div>
          </div>
        </button>

        {/* Quick Fill Options for Trader and Admin */}
        <div className="demo-quick-fill mt-3 text-center">
          <span className="text-secondary small d-block mb-2">Quick Auto-Fill Credentials:</span>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => fillCredentials('demo@tradex.com', 'demo123')}
              title="Auto-fill Demo Trader credentials"
            >
              <span>👤 Trader:</span>
              <code>demo@tradex.com</code>
            </button>
            <button
              type="button"
              className="btn-quick-fill btn-quick-fill-admin"
              onClick={() => fillCredentials('admin@tradex.com', 'admin123')}
              title="Auto-fill System Admin credentials"
            >
              <span>🛡️ Admin:</span>
              <code>admin@tradex.com</code>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-secondary small mb-0">
        Don't have an account?{' '}
        <span className="auth-switch-link" onClick={() => setIsLoginBox(false)}>
          Create an account
        </span>
      </p>
    </form>
  );
};

export default Login;


