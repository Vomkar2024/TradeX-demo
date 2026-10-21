import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiCheckCircle } from 'react-icons/fi';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/fetch-orders');
      setOrders((response.data || []).reverse());
    } catch (err) {
      console.error('Fetch orders error:', err);
      toast.error('Failed to load orders audit log');
    } finally {
      setLoading(false);
    }
  };

  // Compute Order KPIs
  const totalOrders = orders.length;
  const buyOrders = orders.filter((o) => (o.orderType || '').toLowerCase() === 'buy');
  const sellOrders = orders.filter((o) => (o.orderType || '').toLowerCase() === 'sell');
  const grossTurnover = orders.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0);

  const filteredOrders = orders.filter((o) => {
    const symbol = String(o.symbol || '').toLowerCase();
    const name = String(o.name || '').toLowerCase();
    const user = String(o.user || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      symbol.includes(query) || name.includes(query) || user.includes(query);

    if (!matchesSearch) return false;

    if (sideFilter === 'buy') {
      return (o.orderType || '').toLowerCase() === 'buy';
    }
    if (sideFilter === 'sell') {
      return (o.orderType || '').toLowerCase() === 'sell';
    }
    return true;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="page-title mb-0">Platform Orders Audit</h1>
            <span className="badge-live-stream">
              <span className="live-dot"></span> SURVEILLANCE LOG
            </span>
          </div>
          <p className="page-subtitle mb-0">
            Real-time surveillance log of all trade executions and market liquidity fills across the platform
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={fetchOrders}
          disabled={loading}
          title="Refresh orders audit"
        >
          <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiTrendingUp />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Executions</span>
            <div className="admin-kpi-value">{totalOrders}</div>
            <span className="admin-kpi-sub">All platform trade orders</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiArrowUpRight />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Buy Orders</span>
            <div className="admin-kpi-value text-success">{buyOrders.length}</div>
            <span className="admin-kpi-sub">
              {buyOrders.reduce((sum, o) => sum + Number(o.count || 0), 0)} Total shares bought
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiArrowDownRight />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Sell Orders</span>
            <div className="admin-kpi-value text-danger">{sellOrders.length}</div>
            <span className="admin-kpi-sub">
              {sellOrders.reduce((sum, o) => sum + Number(o.count || 0), 0)} Total shares sold
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiCheckCircle />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Gross Turnover</span>
            <div className="admin-kpi-value text-white">
              ₹{Number(grossTurnover).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="admin-kpi-sub">Cumulative order gross value</span>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Side Filter Tabs */}
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-btn ${sideFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSideFilter('all')}
            >
              All Executions ({orders.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${sideFilter === 'buy' ? 'active' : ''}`}
              onClick={() => setSideFilter('buy')}
            >
              ▲ Buys ({buyOrders.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${sideFilter === 'sell' ? 'active' : ''}`}
              onClick={() => setSideFilter('sell')}
            >
              ▼ Sells ({sellOrders.length})
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
              placeholder="Search symbol, company, trader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Auditing platform order log...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <p className="mb-2">No trade orders match your search criteria.</p>
            {(search || sideFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => {
                  setSearch('');
                  setSideFilter('all');
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
                  <th>Order Side</th>
                  <th>Security</th>
                  <th>Asset Name</th>
                  <th>Shares Quantity</th>
                  <th>Fill Price</th>
                  <th>Gross Value</th>
                  <th>Settlement</th>
                  <th>Trader Account</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isBuy = (order.orderType || '').toLowerCase() === 'buy';
                  return (
                    <tr key={order._id}>
                      <td>
                        <span
                          className="badge fw-bold"
                          style={{
                            backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: isBuy ? '#34d399' : '#fb7185',
                            border: `1px solid ${isBuy ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                          }}
                        >
                          {isBuy ? '▲ BUY' : '▼ SELL'}
                        </span>
                      </td>

                      <td className="fw-bold text-white fs-6">{order.symbol}</td>
                      <td className="text-secondary small">{order.name || order.symbol}</td>
                      <td className="fw-semibold text-white">{Number(order.count).toLocaleString('en-IN')}</td>

                      <td className="font-monospace">
                        ₹{Number(order.price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="fw-bold text-white font-monospace">
                        ₹{Number(order.totalPrice).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <span className="badge-status-settled">
                          ● {order.orderStatus || 'Completed'}
                        </span>
                      </td>

                      <td>
                        <div className="chip-user">
                          <div className="chip-avatar">
                            {(order.user || 'T').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-secondary font-monospace small">
                            {order.user || 'usr_cust_101'}
                          </span>
                        </div>
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

export default AllOrders;
