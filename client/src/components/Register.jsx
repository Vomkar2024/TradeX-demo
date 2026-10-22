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
      <div className="text-center mb-4">
        <div
          className="brand-logo-badge mx-auto mb-2.5"
          style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}
        >
          TX
        </div>
        <h3 className="fw-bold mb-1.5 fs-4 text-white">Create TradeX Account</h3>
        <p className="text-secondary small mb-0" style={{ fontSize: '0.88rem' }}>
          Create an account to start paper trading
        </p>
      </div>

      <div className="mb-4 text-start">
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

      <div className="mb-4 text-start">
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

      <div className="mb-4 text-start">
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

      <div className="pt-2 pb-1">
        <button
          type="submit"
          className="btn btn-primary w-100 py-3 fw-semibold shadow-sm mb-3.5 btn-auth-submit"
        >
          Create Account
        </button>
      </div>

      <p className="mt-1 text-center text-secondary small mb-0" style={{ fontSize: '0.88rem' }}>
        Already have an account?{' '}
        <span className="auth-switch-link" onClick={() => setIsLoginBox(true)}>
          Sign In
        </span>
      </p>
    </form>
  );
};

export default Register;

