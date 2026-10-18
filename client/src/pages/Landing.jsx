import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const Landing = () => {
  const [isLoginBox, setIsLoginBox] = useState(true);

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-hero">
          <h1>Next Generation Stock Trading</h1>
          <p>
            Experience seamless, real-time market data, transparent ledger accounting,
            and fast order execution. Manage your portfolio with institutional-grade precision.
          </p>
          <div className="landing-badges">
            <span className="landing-badge">⚡ Real-time Market Analytics</span>
            <span className="landing-badge">🔒 Bank-grade Ledger</span>
            <span className="landing-badge">📈 Instant Portfolio Insights</span>
          </div>
        </div>

        <div className="landing-auth-wrapper">
          {isLoginBox ? (
            <Login setIsLoginBox={setIsLoginBox} />
          ) : (
            <Register setIsLoginBox={setIsLoginBox} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
