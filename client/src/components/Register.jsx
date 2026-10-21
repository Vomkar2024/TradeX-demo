import React, { useContext, useState } from 'react';
import { GeneralContext } from '../context/GeneralContext';

const Register = ({ setIsLoginBox }) => {
  const { setUsername, setEmail, setPassword, register } = useContext(GeneralContext);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    await register();
  };

  return (
    <form className="authForm card shadow-lg border-0" onSubmit={handleRegister}>
      <div className="text-center mb-3 mb-md-3.5">
        <div
          className="brand-logo-badge mx-auto mb-2"
          style={{ width: '40px', height: '40px', fontSize: '1.05rem' }}
        >
          TX
        </div>
        <h3 className="fw-bold mb-1 fs-4">Create TradeX Account</h3>
        <p className="text-secondary small mb-0" style={{ fontSize: '0.85rem' }}>
          Create an account to start paper trading
        </p>
      </div>

      <div className="mb-3 text-start">
        <label htmlFor="regUsernameInput" className="auth-form-label">
          Username
        </label>
        <input
          type="text"
          className="form-control auth-input-clean auth-input-compact w-100"
          id="regUsernameInput"
          placeholder="e.g. rahul_trader"
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
      </div>

      <div className="mb-3 text-start">
        <label htmlFor="regEmailInput" className="auth-form-label">
          Email Address
        </label>
        <input
          type="email"
          className="form-control auth-input-clean auth-input-compact w-100"
          id="regEmailInput"
          placeholder="e.g. trader@tradex.com"
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="mb-3 text-start">
        <label htmlFor="regPasswordInput" className="auth-form-label">
          Password
        </label>
        <div className="position-relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control auth-input-clean auth-input-compact w-100 pe-5"
            id="regPasswordInput"
            placeholder="Choose a password"
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="btn-toggle-eye"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <div className="mb-3.5 text-start">
        <label className="auth-form-label">Account Type</label>
        <div
          className="p-2.5 px-3 rounded-3"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.1rem' }}>📈</span>
              <div>
                <div className="text-white fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Trader Account
                </div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  Virtual trading with live charting
                </div>
              </div>
            </div>
            <span
              className="badge text-bg-success px-2 py-1"
              style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}
            >
              ₹500 Balance
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 py-2.5 fw-semibold shadow-sm mb-2.5 btn-auth-submit"
        style={{ fontSize: '0.98rem' }}
      >
        Create Account
      </button>

      <p className="mt-2.5 pt-1 text-center text-secondary small mb-0" style={{ fontSize: '0.86rem' }}>
        Already have an account?{' '}
        <span className="auth-switch-link" onClick={() => setIsLoginBox(true)}>
          Sign In
        </span>
      </p>
    </form>
  );
};

export default Register;

