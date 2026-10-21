import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiActivity } from 'react-icons/fi';

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/fetch-transactions');
      setTransactions((response.data || []).reverse());
    } catch (err) {
      console.error('Fetch transactions error:', err);
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  // Compute Institutional KPIs
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
    const user = String(t.user || '').toLowerCase();
    const payment = String(t.paymentMode || '').toLowerCase();
    const type = String(t.type || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      id.includes(query) || user.includes(query) || payment.includes(query) || type.includes(query);

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
      {/* Page Title & Subtitle */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="page-title mb-0">Platform Financial Ledger</h1>
            <span className="badge-live-stream">
              <span className="live-dot"></span> LIVE AUDIT
            </span>
          </div>
          <p className="page-subtitle mb-0">
            Real-time surveillance log of customer deposits, cash redemptions, and platform liquidity
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={fetchTransactions}
          disabled={loading}
          title="Refresh transaction ledger"
        >
          <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* Institutional KPI Analytics Bar */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiActivity />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Ledger Entries</span>
            <div className="admin-kpi-value">{totalCount}</div>
            <span className="admin-kpi-sub">Total financial records</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiArrowUpRight />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Gross Deposits</span>
            <div className="admin-kpi-value text-success">
              ₹{Number(grossDeposits).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="admin-kpi-sub">{depositsList.length} Inflow transactions</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiArrowDownRight />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Gross Redemptions</span>
            <div className="admin-kpi-value text-danger">
              ₹{Number(grossWithdrawals).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="admin-kpi-sub">{withdrawalsList.length} Outflow operations</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Net Platform Liquidity</span>
            <div className={`admin-kpi-value ${netLiquidity >= 0 ? 'text-white' : 'text-danger'}`}>
              ₹{Number(netLiquidity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="admin-kpi-sub">Inflow minus outflow balance</span>
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Filter Tabs */}
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All Records ({transactions.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${typeFilter === 'deposit' ? 'active' : ''}`}
              onClick={() => setTypeFilter('deposit')}
            >
              ▲ Deposits ({depositsList.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${typeFilter === 'withdraw' ? 'active' : ''}`}
              onClick={() => setTypeFilter('withdraw')}
            >
              ▼ Withdrawals ({withdrawalsList.length})
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
              placeholder="Search ID, user, payment rail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Body / Loading / Empty */}
        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Synchronizing institutional ledger...</div>
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
                  <th>Direction</th>
                  <th>Settlement Amount</th>
                  <th>Payment Rail</th>
                  <th>Account ID</th>
                  <th>Execution Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  const isDeposit = (t.type || '').toLowerCase() === 'deposit';
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
                          {isDeposit ? '▲ DEPOSIT' : '▼ WITHDRAWAL'}
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
                          <div className="chip-avatar">
                            {(t.user || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-secondary font-monospace small">
                            {t.user || 'usr_cust_101'}
                          </span>
                        </div>
                      </td>

                      <td className="text-secondary small">
                        {t.time
                          ? new Date(t.time).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
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

