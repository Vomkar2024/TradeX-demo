import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext';

const Navbar = () => {
  const { logout, resetDemoData, loginDemo, balance, showAuthModal } = useContext(GeneralContext);

  const userType = localStorage.getItem('userType');
  const rawUsername = localStorage.getItem('username');
  const username = userType === 'admin' && (!rawUsername || rawUsername === 'Demo Administrator') 
    ? 'Administrator' 
    : rawUsername;
  const email = localStorage.getItem('email');
  const isDemo = localStorage.getItem('isDemoMode') === 'true' && userType !== 'admin' && email !== 'trader@tradex.com';

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

  if (showAuthModal) {
    return null;
  }

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
            <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
            <li><NavLink to="/portfolio" className={({ isActive }) => isActive ? 'active' : ''}>Portfolio</NavLink></li>
            <li><NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>History</NavLink></li>
            <li><NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink></li>
          </ul>
        )}

        {userType === 'admin' && (
          <ul className="navbar-links">
            <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
            <li><NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink></li>
            <li><NavLink to="/all-orders" className={({ isActive }) => isActive ? 'active' : ''}>All Orders</NavLink></li>
            <li><NavLink to="/all-transactions" className={({ isActive }) => isActive ? 'active' : ''}>All Transactions</NavLink></li>
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
                        ? 'Administrator'
                        : isDemo
                        ? '⚡ Demo Account'
                        : 'Trader Account'}
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
                      title="Reset demo balance and holdings"
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
              title="Try Demo Mode"
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
