import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiActivity } from 'react-icons/fi';
import { fetchUserRegistry, resolveUserIdentity } from '../utils/userLookup';

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchTransactionsAndUsers = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [txRes, usersReg] = await Promise.all([
        axiosInstance.get('/fetch-transactions'),
        fetchUserRegistry(axiosInstance),
      ]);
      setTransactions((txRes.data || []).reverse());
      setUserMap(usersReg || {});
    } catch (err) {
      console.error('Fetch transactions error:', err);
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialTransactions = async () => {
      try {
        const [txRes, usersReg] = await Promise.all([
          axiosInstance.get('/fetch-transactions'),
          fetchUserRegistry(axiosInstance),
        ]);
        if (!isMounted) return;
        setTransactions((txRes.data || []).reverse());
        setUserMap(usersReg || {});
      } catch (err) {
        if (!isMounted) return;
        console.error('Fetch transactions error:', err);
        toast.error('Failed to load transaction ledger');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Summary stats
  const totalCount = transactions.length;
  const depositsList = transactions.filter((t) => (t.type || '').toLowerCase() === 'deposit');
  const withdrawalsList = transactions.filter(
    (t) => (t.type || '').toLowerCase() === 'withdraw' || (t.type || '').toLowerCase() === 'withdrawal'
  );

  const grossDeposits = depositsList.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const grossWithdrawals = withdrawalsList.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const netLiquidity = grossDeposits - grossWithdrawals;

  // Filter transactions by search query and type filter
  const filteredTransactions = transactions.filter((t) => {
    const id = String(t._id || '').toLowerCase();
    const rawUser = String(t.user || '').toLowerCase();
    const trader = resolveUserIdentity(t.user, userMap);
    const traderName = trader.username.toLowerCase();
    const traderEmail = trader.email.toLowerCase();
    const payment = String(t.paymentMode || '').toLowerCase();
    const type = String(t.type || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      id.includes(query) ||
      rawUser.includes(query) ||
      traderName.includes(query) ||
      traderEmail.includes(query) ||
      payment.includes(query) ||
      type.includes(query);

    if (!matchesSearch) return false;

    if (typeFilter === 'deposit') {
      return type === 'deposit';
    }
    if (typeFilter === 'withdraw') {
      return type === 'withdraw' || type === 'withdrawal';
    }
    return true;
  });

  const getPaymentIcon = (mode) => {
    const m = (mode || '').toLowerCase();
    if (m.includes('upi')) return '⚡';
    if (m.includes('card')) return '💳';
    if (m.includes('net') || m.includes('bank')) return '🏦';
    return '💼';
  };

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="page-title mb-0">Platform Transactions</h1>
            <span className="badge-live-stream">
              <span className="live-dot"></span> LEDGER AUDIT
            </span>
          </div>
          <p className="page-subtitle mb-0">
            Overview of user deposits, withdrawals, and platform cash movements
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={() => fetchTransactionsAndUsers(true)}
          disabled={loading}
          title="Refresh transactions"
        >
          <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiActivity />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Transactions</span>
            <div className="admin-kpi-value">{totalCount}</div>
            <span className="admin-kpi-sub">Recorded on platform</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiArrowUpRight />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Deposits</span>
            <div className="admin-kpi-value text-success">
              ₹{Number(grossDeposits).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="admin-kpi-sub">{depositsList.length} deposit records</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiArrowDownRight />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Withdrawals</span>
            <div className="admin-kpi-value text-danger">
              ₹{Number(grossWithdrawals).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="admin-kpi-sub">{withdrawalsList.length} withdrawal records</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Net Cash Flow</span>
            <div className={`admin-kpi-value ${netLiquidity >= 0 ? 'text-white' : 'text-danger'}`}>
              ₹{Number(netLiquidity).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="admin-kpi-sub">Deposits minus withdrawals</span>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All ({transactions.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${typeFilter === 'deposit' ? 'active' : ''}`}
              onClick={() => setTypeFilter('deposit')}
            >
              Deposits ({depositsList.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${typeFilter === 'withdraw' ? 'active' : ''}`}
              onClick={() => setTypeFilter('withdraw')}
            >
              Withdrawals ({withdrawalsList.length})
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
              placeholder="Search by ID, user, or payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Loading transactions...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <p className="mb-2">No transactions match the selected criteria.</p>
            {(search || typeFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
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
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  const isDeposit = (t.type || '').toLowerCase() === 'deposit';
                  const trader = resolveUserIdentity(t.user, userMap);

                  return (
                    <tr key={t._id}>
                      <td>
                        <span className="chip-mono" title={t._id}>
                          #{t._id}
                        </span>
                      </td>

                      <td>
                        <span
                          className="badge fw-bold"
                          style={{
                            backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: isDeposit ? '#34d399' : '#fb7185',
                            border: `1px solid ${
                              isDeposit ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'
                            }`,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                          }}
                        >
                          {isDeposit ? 'Deposit' : 'Withdrawal'}
                        </span>
                      </td>

                      <td>
                        <span
                          className="fw-bold fs-6 font-monospace"
                          style={{ color: isDeposit ? '#34d399' : '#fb7185' }}
                        >
                          {isDeposit ? '+' : '-'}₹
                          {Number(t.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td>
                        <span className="badge-rail">
                          <span>{getPaymentIcon(t.paymentMode)}</span>
                          <span>{t.paymentMode || 'Net Banking'}</span>
                        </span>
                      </td>

                      <td>
                        <div className="chip-user">
                          <div className="chip-avatar">{trader.initial}</div>
                          <div>
                            <div className="fw-semibold text-white small">{trader.username}</div>
                            {trader.email && (
                              <span
                                className="text-secondary font-monospace"
                                style={{ fontSize: '0.72rem' }}
                                title={`Account ID: ${t.user}`}
                              >
                                {trader.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="text-secondary small font-monospace">
                        {t.time
                          ? new Date(t.time).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Settled'}
                      </td>

                      <td>
                        <span className="badge-status-settled">
                          ● Settled
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

export default AllTransactions;
