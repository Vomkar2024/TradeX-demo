import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

const Register = ({ setIsLoginBox }) => {
  const { setUsername, setEmail, setPassword, register } = useContext(GeneralContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    await register();
  };

  return (
    <form className="authForm card shadow-lg border-0 p-4 p-md-5" onSubmit={handleRegister}>
      <div className="text-center mb-4">
        <div className="brand-logo-badge mx-auto mb-2" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>TX</div>
        <h2 className="fw-bold mb-1">Create TradeX Account</h2>
        <p className="text-secondary small mb-0">Join institutional traders on our simulated exchange</p>
      </div>

      {/* Trader Username Field */}
      <div className="mb-3 text-start">
        <label htmlFor="regUsernameInput" className="auth-form-label">
          Trader Username
        </label>
        <input
          type="text"
          className="form-control auth-input-clean w-100"
          id="regUsernameInput"
          placeholder="e.g. wallstreet_bull"
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
      </div>

      {/* Email Address Field */}
      <div className="mb-3 text-start">
        <label htmlFor="regEmailInput" className="auth-form-label">
          Email Address
        </label>
        <input
          type="email"
          className="form-control auth-input-clean w-100"
          id="regEmailInput"
          placeholder="e.g. trader@tradex.com"
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      {/* Password Field */}
      <div className="mb-3 text-start">
        <label htmlFor="regPasswordInput" className="auth-form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control auth-input-clean w-100"
          id="regPasswordInput"
          placeholder="Choose a secure password"
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {/* Account Designation (Customer Trader with ₹500 starting capital) */}
      <div className="mb-4 text-start">
        <label className="auth-form-label">
          Account Designation
        </label>
        <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.2rem' }}>📈</span>
              <div>
                <div className="text-white fw-semibold small">Customer Trader</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Simulated equity desk with live charting</div>
              </div>
            </div>
            <span className="badge text-bg-success px-2 py-1" style={{ fontSize: '0.75rem' }}>₹500 Balance</span>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-100 py-3 fw-semibold shadow-sm mb-3 btn-auth-submit">
        Complete Registration
      </button>

      <p className="mt-3 text-center text-secondary small mb-0">
        Already registered?{' '}
        <span className="auth-switch-link" onClick={() => setIsLoginBox(true)}>
          Sign In
        </span>
      </p>
    </form>
  );
};

export default Register;

