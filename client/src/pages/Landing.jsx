import React, { useState, useContext, useEffect } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import TickerTape from '../components/TickerTape';
import { GeneralContext } from '../context/GeneralContext';

const Landing = () => {
  const [isLoginBox, setIsLoginBox] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const { loginDemo, showAuthModal, setShowAuthModal } = useContext(GeneralContext);

  // Reset auth modal & forgot mode when leaving Landing page
  useEffect(() => {
    return () => {
      setShowAuthModal(false);
      setIsForgotMode(false);
    };
  }, [setShowAuthModal]);

  const handleClaimDemo = () => {
    loginDemo('customer');
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
                  <div className="auth-top-nav-bar d-flex align-items-center mb-2.5">
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
                        }}
                        title="Return to TradeX overview"
                      >
                        <span>←</span>
                        <span>Back to Overview</span>
                      </button>
                    )}
                  </div>

                  <div className="auth-form-embed-wrapper">
                    {isLoginBox ? (
                      <Login
                        setIsLoginBox={setIsLoginBox}
                        isForgotMode={isForgotMode}
                        setIsForgotMode={setIsForgotMode}
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
