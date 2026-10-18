import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext';

const Navbar = () => {
  const { logout } = useContext(GeneralContext);
  const navigate = useNavigate();

  const userType = localStorage.getItem('userType');
  const username = localStorage.getItem('username');
  const balance = localStorage.getItem('balance');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar-custom">
      <div className="d-flex align-items-center gap-4">
        <Link to={userType === 'admin' ? '/admin' : userType === 'customer' ? '/home' : '/'} className="navbar-brand-custom">
          Trade<span>X</span> Stocks
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
                Balance: ${Number(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
            <span className="user-badge">
              {username} ({userType})
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <span className="text-secondary small">Welcome to TradeX</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
