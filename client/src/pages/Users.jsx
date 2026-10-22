import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiUsers, FiUserCheck, FiShield, FiDollarSign } from 'react-icons/fi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [usersRes, stocksRes] = await Promise.all([
        axiosInstance.get('/fetch-users'),
        axiosInstance.get('/fetch-stocks').catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setStocks(stocksRes.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error('Failed to load users directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialUsers = async () => {
      try {
        const [usersRes, stocksRes] = await Promise.all([
          axiosInstance.get('/fetch-users'),
          axiosInstance.get('/fetch-stocks').catch(() => ({ data: [] })),
        ]);
        if (!isMounted) return;
        setUsers(usersRes.data || []);
        setStocks(stocksRes.data || []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Fetch users error:', err);
        toast.error('Failed to load users directory');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const isTraderRole = (role) => {
    const r = (role || '').toLowerCase();
    return r === 'customer' || r === 'trader';
  };

  const isAdminRole = (role) => {
    return (role || '').toLowerCase() === 'admin';
  };

  // Stats
  const totalAccounts = users.length;
  const tradersList = users.filter((u) => isTraderRole(u.usertype));
  const adminsList = users.filter((u) => isAdminRole(u.usertype));
  const totalPlatformBalance = users.reduce((acc, u) => acc + Number(u.balance || 0), 0);

  const filteredUsers = users.filter((u) => {
    const name = String(u.username || '').toLowerCase();
    const email = String(u.email || '').toLowerCase();
    const role = String(u.usertype || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query);
    if (!matchesSearch) return false;

    if (roleFilter === 'customer') {
      return isTraderRole(role);
    }
    if (roleFilter === 'admin') {
      return isAdminRole(role);
    }
    return true;
  });

  // Pin Administrator to the top of the table
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aAdmin = isAdminRole(a.usertype);
      const bAdmin = isAdminRole(b.usertype);
      if (aAdmin && !bAdmin) return -1;
      if (!aAdmin && bAdmin) return 1;
      return 0;
    });
  }, [filteredUsers]);

  return (
    <div className="page-container admin-user-directory-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="page-title mb-0">Users Directory</h1>
            <span className="badge-live-stream">
              <span className="live-dot"></span> ACCOUNTS
            </span>
          </div>
          <p className="page-subtitle mb-0">
            Overview of registered traders and administrator accounts
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={() => fetchData(true)}
          disabled={loading}
          title="Refresh users"
        >
          <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiUsers />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Users</span>
            <div className="admin-kpi-value">{totalAccounts}</div>
            <span className="admin-kpi-sub">Registered accounts</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiUserCheck />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Traders</span>
            <div className="admin-kpi-value text-success">{tradersList.length}</div>
            <span className="admin-kpi-sub">Standard user accounts</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiShield />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Admins</span>
            <div className="admin-kpi-value text-danger">{adminsList.length}</div>
            <span className="admin-kpi-sub">Admin accounts</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Wallet Balance</span>
            <div className="admin-kpi-value text-white">
              ₹{Number(totalPlatformBalance).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="admin-kpi-sub">Total balance across users</span>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
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
              Traders ({tradersList.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => setRoleFilter('admin')}
            >
              Admins ({adminsList.length})
            </button>
          </div>

          <div className="position-relative ms-auto" style={{ minWidth: '280px', maxWidth: '380px' }}>
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
            <div>Loading users...</div>
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
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Balance</th>
                  <th>Holdings</th>
                  <th>User ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => {
                  const isAdmin = isAdminRole(u.usertype);
                  const userHoldings = stocks.filter((s) => s.user === u._id);
                  const holdingsValue = userHoldings.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);

                  return (
                    <tr key={u._id} className={isAdmin ? 'pinned-admin-row' : ''}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="chip-avatar"
                            style={{
                              background: isAdmin
                                ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                                : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                              width: '34px',
                              height: '34px',
                              fontSize: '0.9rem',
                            }}
                          >
                            {(u.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold text-white d-flex align-items-center gap-2">
                              <span>{u.username}</span>
                              {isAdmin && (
                                <span
                                  className="badge px-2 py-0.5"
                                  style={{
                                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                    color: '#fb7185',
                                    border: '1px solid rgba(244, 63, 94, 0.35)',
                                    borderRadius: '9999px',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.04em',
                                    fontWeight: 700,
                                  }}
                                  title="Administrator Account"
                                >
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-secondary small">
                              {isAdmin ? 'Administrator' : 'Trader'}
                            </span>
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
                            border: `1px solid ${
                              isAdmin ? 'rgba(244, 63, 94, 0.35)' : 'rgba(99, 102, 241, 0.35)'
                            }`,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                          }}
                        >
                          {isAdmin ? 'Administrator' : 'Trader'}
                        </span>
                      </td>

                      <td className="fw-bold text-white font-monospace fs-6">
                        ₹{Number(u.balance || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        {userHoldings.length > 0 ? (
                          <div>
                            <span className="badge bg-success-subtle text-success fw-semibold px-2 py-1">
                              {userHoldings.length} {userHoldings.length === 1 ? 'Asset' : 'Assets'}
                            </span>
                            <div className="text-secondary small font-monospace mt-1" style={{ fontSize: '0.75rem' }}>
                              Val: ₹{Number(holdingsValue).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
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
