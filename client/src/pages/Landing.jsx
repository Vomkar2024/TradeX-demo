import React, { useState, useContext, useEffect, useRef } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import TickerTape from '../components/TickerTape';
import { GeneralContext } from '../context/GeneralContext';
import toast from 'react-hot-toast';

const Landing = () => {
  const [isLoginBox, setIsLoginBox] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isQuickFillOpen, setIsQuickFillOpen] = useState(false);
  const [externalFill, setExternalFill] = useState(null);
  const dropdownRef = useRef(null);

  const { loginDemo, showAuthModal, setShowAuthModal, setEmail, setPassword } = useContext(GeneralContext);

  // Reset auth modal & forgot mode when leaving Landing page
  useEffect(() => {
    return () => {
      setShowAuthModal(false);
      setIsForgotMode(false);
      setIsQuickFillOpen(false);
    };
  }, [setShowAuthModal]);

  // Close Quick Fill dropdown when changing auth tabs or modes
  useEffect(() => {
    if (!isLoginBox || isForgotMode) {
      setIsQuickFillOpen(false);
    }
  }, [isLoginBox, isForgotMode]);

  // Close Quick Fill dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuickFillOpen(false);
      }
    };
    if (isQuickFillOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickFillOpen]);

  const handleClaimDemo = () => {
    loginDemo('customer');
  };

  const handleQuickFill = (emailVal, passVal, roleName = 'Trader') => {
    setIsLoginBox(true);
    setIsForgotMode(false);
    setEmail(emailVal);
    setPassword(passVal);
    setExternalFill({ email: emailVal, password: passVal, timestamp: Date.now() });
    toast.success(`${roleName} test credentials filled!`);
    setIsQuickFillOpen(false);
  };

  return (
    <div className={`landing-page-v2 ${showAuthModal ? 'landing-auth-mode' : ''}`}>
      {!showAuthModal && <TickerTape />}

      <div className={`landing-content-wrap ${showAuthModal ? 'landing-content-auth-active' : ''}`}>
        <div className={`container ${showAuthModal ? 'd-flex align-items-center justify-content-center my-auto p-0' : 'py-5'}`}>
          <div className={`row align-items-center justify-content-center ${showAuthModal ? 'w-100 m-0' : ''}`}>
            <div className={`${showAuthModal ? 'col-12 col-md-10 col-lg-8 col-xl-7 d-flex justify-content-center p-0' : 'col-lg-10 col-xl-9'} text-center`}>
              {!showAuthModal ? (
                <div className="landing-hero-fade">
                  <div className="mb-4">
                    <span className="live-engine-badge">
                      <span className="live-engine-dot"></span>
                      Live Paper Trading Desk
                    </span>
                  </div>

                  <h1 className="hero-heading-v2 mb-3">
                    Master the Markets with <span className="gradient-highlight">Zero Financial Risk</span>
                  </h1>

                  <p className="hero-lead-text mb-4 mx-auto">
                    TradeX gives you a realistic trading desk equipped with live charts,
                    instant market orders, portfolio analytics, and ₹25,000 in virtual funds.
                  </p>

                  <div className="d-flex flex-wrap gap-3 justify-content-center">
                    <button
                      type="button"
                      className="btn-claim-demo-hero"
                      onClick={handleClaimDemo}
                    >
                      Start Demo Trading (₹25,000) →
                    </button>
                    <button
                      type="button"
                      className="btn-view-charts-hero"
                      onClick={() => {
                        setIsLoginBox(true);
                        setIsForgotMode(false);
                        setShowAuthModal(true);
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-view-fade auth-layout-wrapper mx-auto">
                  <div className="auth-top-nav-bar d-flex justify-content-between align-items-center mb-2.5">
                    {isForgotMode ? (
                      <button
                        type="button"
                        className="btn-back-to-overview"
                        onClick={() => setIsForgotMode(false)}
                        title="Return to Sign In"
                      >
                        <span>←</span>
                        <span>Back to Sign In</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-back-to-overview"
                        onClick={() => {
                          setShowAuthModal(false);
                          setIsForgotMode(false);
                          setIsQuickFillOpen(false);
                        }}
                        title="Return to TradeX overview"
                      >
                        <span>←</span>
                        <span>Back to Overview</span>
                      </button>
                    )}

                    {/* Quick Fill Dropdown - Strictly displayed ONLY on the Sign In page */}
                    {isLoginBox && !isForgotMode && (
                      <div className="quick-credentials-dropdown-wrap position-relative" ref={dropdownRef}>
                        <button
                          type="button"
                          className={`btn-quick-fill-dropdown-toggle ${isQuickFillOpen ? 'active' : ''}`}
                          onClick={() => setIsQuickFillOpen(!isQuickFillOpen)}
                          title="Auto-fill test credentials"
                        >
                          <span className="quick-fill-bolt">⚡</span>
                          <span className="quick-fill-text">Quick Fill</span>
                          <span className="quick-fill-caret">{isQuickFillOpen ? '▲' : '▼'}</span>
                        </button>

                        {isQuickFillOpen && (
                          <div className="quick-fill-dropdown-form text-start shadow-lg">
                            <div className="dropdown-form-header d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary-subtle">
                              <div className="d-flex align-items-center gap-2">
                                <span className="quick-badge-icon">⚡</span>
                                <div>
                                  <div className="dropdown-form-title fw-bold text-white">Quick Fill Accounts</div>
                                  <div className="dropdown-form-sub text-secondary">1-Click Auto-Fill Credentials</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-close-dropdown text-secondary"
                                onClick={() => setIsQuickFillOpen(false)}
                                aria-label="Close"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="dropdown-form-body d-flex flex-column gap-2.5">
                              <div className="credential-card-item">
                                <div className="d-flex justify-content-between align-items-center mb-1.5">
                                  <span className="account-tag trader-badge">👤 Trader</span>
                                  <span className="account-pill-demo">₹25,000 Balance</span>
                                </div>
                                <div className="credential-input-group mb-1.5">
                                  <span className="cred-field-label">Email:</span>
                                  <code className="cred-field-code">trader@tradex.com</code>
                                </div>
                                <div className="credential-input-group mb-2.5">
                                  <span className="cred-field-label">Pass:</span>
                                  <code className="cred-field-code">trader123</code>
                                </div>
                                <button
                                  type="button"
                                  className="btn-fill-action w-100"
                                  onClick={() => handleQuickFill('trader@tradex.com', 'trader123', 'Trader')}
                                >
                                  Use Trader Login
                                </button>
                              </div>

                              <div className="credential-card-item admin-card-item">
                                <div className="d-flex justify-content-between align-items-center mb-1.5">
                                  <span className="account-tag admin-badge">🛡️ Administrator</span>
                                  <span className="account-pill-admin">Admin</span>
                                </div>
                                <div className="credential-input-group mb-1.5">
                                  <span className="cred-field-label">Email:</span>
                                  <code className="cred-field-code">admin@tradex.com</code>
                                </div>
                                <div className="credential-input-group mb-2.5">
                                  <span className="cred-field-label">Pass:</span>
                                  <code className="cred-field-code">admin123</code>
                                </div>
                                <button
                                  type="button"
                                  className="btn-fill-action btn-admin-fill-action w-100"
                                  onClick={() => handleQuickFill('admin@tradex.com', 'admin123', 'Admin')}
                                >
                                  Use Admin Login
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="auth-form-embed-wrapper">
                    {isLoginBox ? (
                      <Login
                        setIsLoginBox={setIsLoginBox}
                        isForgotMode={isForgotMode}
                        setIsForgotMode={setIsForgotMode}
                        externalFill={externalFill}
                      />
                    ) : (
                      <Register setIsLoginBox={setIsLoginBox} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
