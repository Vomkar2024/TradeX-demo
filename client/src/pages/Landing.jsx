import React, { useState, useContext } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import TickerTape from '../components/TickerTape';
import { GeneralContext } from '../context/GeneralContext';

const Landing = () => {
  const [isLoginBox, setIsLoginBox] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { loginDemo } = useContext(GeneralContext);

  const handleClaimDemo = () => {
    loginDemo('customer');
  };

  return (
    <div className="landing-page-v2">
      {/* Top Scrolling Market Ticker Tape */}
      <TickerTape />

      <div className="landing-content-wrap">
        <div className="container py-5">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-10 col-xl-9 text-center">
              {!showAuthModal ? (
                /* Hero Section - Fades out when Sign In is clicked */
                <div className="landing-hero-fade">
                  {/* Green Glow Pill Badge */}
                  <div className="mb-4">
                    <span className="live-engine-badge">
                      <span className="live-engine-dot"></span>
                      Real-Time Equity Simulation Engine
                    </span>
                  </div>

                  {/* Main Headline with Gradient */}
                  <h1 className="hero-heading-v2 mb-3">
                    Master the Markets with <span className="gradient-highlight">Zero Financial Risk</span>
                  </h1>

                  {/* Subheading */}
                  <p className="hero-lead-text mb-4 mx-auto">
                    TradeX gives you a professional simulated trading desk equipped with live charts,
                    instant market orders, portfolio analytics, and ₹25,000 in virtual demo balance.
                  </p>

                  {/* CTA Action Buttons */}
                  <div className="d-flex flex-wrap gap-3 justify-content-center">
                    <button
                      type="button"
                      className="btn-claim-demo-hero"
                      onClick={handleClaimDemo}
                    >
                      Claim ₹25,000 Demo Account →
                    </button>
                    <button
                      type="button"
                      className="btn-view-charts-hero"
                      onClick={() => {
                        setIsLoginBox(true);
                        setShowAuthModal(true);
                      }}
                    >
                      Sign In with Credentials
                    </button>
                  </div>
                </div>
              ) : (
                /* Auth Form View (Appears in place of Pic 2 Hero) */
                <div className="auth-view-fade py-2">
                  <div className="d-flex justify-content-center mb-3">
                    <button
                      type="button"
                      className="btn-back-to-overview"
                      onClick={() => setShowAuthModal(false)}
                      title="Return to TradeX overview"
                    >
                      <span>←</span>
                      <span>Back to Overview</span>
                    </button>
                  </div>

                  <div className="auth-form-embed-wrapper">
                    {isLoginBox ? (
                      <Login setIsLoginBox={setIsLoginBox} />
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
