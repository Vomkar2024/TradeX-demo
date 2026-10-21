import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiUsers, FiUserCheck, FiShield, FiDollarSign } from 'react-icons/fi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/fetch-users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Compute User KPIs
  const totalAccounts = users.length;
  const customersList = users.filter((u) => (u.usertype || '').toLowerCase() === 'customer');
  const adminsList = users.filter((u) => (u.usertype || '').toLowerCase() === 'admin');
  const totalPlatformBalance = users.reduce((acc, u) => acc + Number(u.balance || 0), 0);

  const filteredUsers = users.filter((u) => {
    const name = String(u.username || '').toLowerCase();
    const email = String(u.email || '').toLowerCase();
    const role = String(u.usertype || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query);
    if (!matchesSearch) return false;

    if (roleFilter === 'customer') {
      return role === 'customer';
    }
    if (roleFilter === 'admin') {
      return role === 'admin';
    }
    return true;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="page-title mb-0">Platform User Directory</h1>
            <span className="badge-live-stream">
              <span className="live-dot"></span> DIRECTORY ACCESS
            </span>
          </div>
          <p className="page-subtitle mb-0">
            Institutional directory of all registered traders, portfolio customers, and security administrators
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={fetchUsers}
          disabled={loading}
          title="Refresh platform accounts"
        >
          <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          <span>Sync Directory</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiUsers />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Accounts</span>
            <div className="admin-kpi-value">{totalAccounts}</div>
            <span className="admin-kpi-sub">Registered platform identities</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiUserCheck />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Active Traders</span>
            <div className="admin-kpi-value text-success">{customersList.length}</div>
            <span className="admin-kpi-sub">Retail & high-net-worth users</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiShield />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Administrators</span>
            <div className="admin-kpi-value text-danger">{adminsList.length}</div>
            <span className="admin-kpi-sub">System surveillance officers</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Cumulative Capital</span>
            <div className="admin-kpi-value text-white">
              ₹{Number(totalPlatformBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="admin-kpi-sub">Total user wallets on deposit</span>
          </div>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Role Filter Tabs */}
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All Users ({users.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${roleFilter === 'customer' ? 'active' : ''}`}
              onClick={() => setRoleFilter('customer')}
            >
              👤 Traders ({customersList.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => setRoleFilter('admin')}
            >
              🛡️ Admins ({adminsList.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="position-relative" style={{ minWidth: '280px', maxWidth: '380px' }}>
            <BiSearch
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '1.1rem',
              }}
            />
            <input
              type="text"
              className="form-control form-control-sm"
              style={{
                paddingLeft: '2.4rem',
                backgroundColor: '#111726',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '0.55rem',
              }}
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Loading user accounts directory...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <p className="mb-2">No user accounts found matching your query.</p>
            {(search || roleFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Email Address</th>
                  <th>Permission Role</th>
                  <th>Liquid Wallet Balance</th>
                  <th>System Identifier</th>
                  <th>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isAdmin = (u.usertype || '').toLowerCase() === 'admin';
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="chip-avatar"
                            style={{
                              background: isAdmin
                                ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                                : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                              width: '32px',
                              height: '32px',
                              fontSize: '0.85rem',
                            }}
                          >
                            {(u.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold text-white">{u.username}</div>
                            <span className="text-secondary small">{isAdmin ? 'Super Admin' : 'Active Trader'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="text-secondary">{u.email}</td>

                      <td>
                        <span
                          className="badge fw-bold"
                          style={{
                            backgroundColor: isAdmin ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: isAdmin ? '#fb7185' : '#818cf8',
                            border: `1px solid ${isAdmin ? 'rgba(244, 63, 94, 0.35)' : 'rgba(99, 102, 241, 0.35)'}`,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                          }}
                        >
                          {isAdmin ? '🛡️ Administrator' : '👤 Customer'}
                        </span>
                      </td>

                      <td className="fw-bold text-white font-monospace fs-6">
                        ₹{Number(u.balance || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <span className="chip-mono" title={u._id}>
                          {u._id}
                        </span>
                      </td>

                      <td>
                        <span className="badge-status-settled">
                          ● Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
