import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext';

const Navbar = () => {
  const { logout, resetDemoData, loginDemo, balance } = useContext(GeneralContext);

  const userType = localStorage.getItem('userType');
  const rawUsername = localStorage.getItem('username');
  const username = userType === 'admin' && (!rawUsername || rawUsername === 'Demo Administrator') 
    ? 'Administrator' 
    : rawUsername;
  const isDemo = localStorage.getItem('isDemoMode') === 'true' && userType !== 'admin';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar-custom">
      <div className="d-flex align-items-center gap-4">
        <Link to={userType === 'admin' ? '/admin' : userType === 'customer' ? '/home' : '/'} className="navbar-brand-custom">
          <div className="brand-logo-badge">TX</div>
          <div className="brand-text-container">
            <span className="brand-title">TradeX</span>
            {isDemo && <span className="brand-demo-sub">DEMO</span>}
          </div>
        </Link>

        {userType === 'customer' && (
          <ul className="navbar-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/history">History</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        )}

        {userType === 'admin' && (
          <ul className="navbar-links">
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/all-orders">All Orders</Link></li>
            <li><Link to="/all-transactions">All Transactions</Link></li>
          </ul>
        )}
      </div>

      <div className="navbar-actions">
        {userType ? (
          <>
            {userType === 'customer' && (
              <span className="balance-badge">
                Balance: ₹{Number(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}

            <div className="user-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-dropdown-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                title="Account Settings & Options"
              >
                <div className="user-dropdown-avatar">
                  {username ? username.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="user-dropdown-name">{username}</span>
                <span className="user-dropdown-caret">{dropdownOpen ? '▴' : '▾'}</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="dropdown-username">{username}</div>
                    <div className="dropdown-role">
                      {userType === 'admin'
                        ? 'System Administrator'
                        : isDemo
                        ? '⚡ Simulated Demo Account'
                        : `${userType.toUpperCase()} Account`}
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  {isDemo && (
                    <button
                      type="button"
                      className="user-dropdown-item item-reset"
                      onClick={() => {
                        setDropdownOpen(false);
                        resetDemoData();
                      }}
                      title="Reset demo capital to ₹25,000 and restore initial portfolio"
                    >
                      <span className="dropdown-icon">🔄</span>
                      <span>Reset Demo</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="user-dropdown-item item-logout"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <span className="dropdown-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn-try-demo-nav"
              onClick={() => loginDemo('customer')}
              title="Launch instant simulated trading desk"
            >
              <span className="demo-nav-icon">⚡</span>
              <span>Try Demo Mode</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


