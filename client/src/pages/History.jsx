import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const History = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  const email = localStorage.getItem('email');
  const isDemo = localStorage.getItem('isDemoMode') === 'true' && userType !== 'admin' && email !== 'trader@tradex.com';

  useEffect(() => {
    let isMounted = true;
    const fetchHistoryData = async () => {
      try {
        const [ordersRes, transRes] = await Promise.all([
          axiosInstance.get('/fetch-orders'),
          axiosInstance.get('/fetch-transactions'),
        ]);

        if (!isMounted) return;

        const userOrders = (ordersRes.data || [])
          .filter((o) => o.user === userId)
          .reverse();
        const userTransactions = (transRes.data || [])
          .filter((t) => t.user === userId)
          .reverse();

        setOrders(userOrders);
        setTransactions(userTransactions);
      } catch (err) {
        if (!isMounted) return;
        console.error('History fetch error:', err);
        toast.error('Failed to load transaction history');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistoryData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Activity History</h1>
          <p className="page-subtitle">
            {isDemo
              ? 'History of your orders and trade executions'
              : 'History of your orders and account transactions'}
          </p>
        </div>
      </div>

      {!isDemo && (
        <div className="category-tabs mb-4">
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span>📜 Stock Orders</span>
            <span className="badge bg-secondary-subtle text-secondary small">{orders.length}</span>
          </button>
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <span>💳 Balance Transactions</span>
            <span className="badge bg-secondary-subtle text-secondary small">{transactions.length}</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-secondary">
          Loading records...
        </div>
      ) : isDemo || activeTab === 'orders' ? (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
            <h4 className="h5 fw-bold mb-0 text-white">Orders Log</h4>
            <span className="badge bg-secondary-subtle text-secondary small">{orders.length} total orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-5 text-center text-secondary">No orders recorded yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const isBuy = (o.orderType || '').toLowerCase() === 'buy';
                    return (
                      <tr key={o._id}>
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
                        <td className="fw-bold text-white">{o.symbol}</td>
                        <td className="text-secondary">{o.name || o.symbol}</td>
                        <td className="text-white">{o.count}</td>
                        <td>
                          ₹{Number(o.price).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="fw-bold text-white">
                          ₹{Number(o.totalPrice).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success">
                            {o.orderStatus || 'Completed'}
                          </span>
                        </td>
                        <td className="text-secondary small">
                          {o.date ? new Date(o.date).toLocaleString() : 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
            <h4 className="h5 fw-bold mb-0 text-white">Transactions Ledger</h4>
            <span className="badge bg-secondary-subtle text-secondary small">{transactions.length} entries</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-5 text-center text-secondary">No transactions recorded yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const isDeposit = (t.type || '').toLowerCase() === 'deposit';
                    return (
                      <tr key={t._id}>
                        <td>
                          <span
                            className="badge fw-semibold"
                            style={{
                              backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: isDeposit ? '#34d399' : '#fbbf24',
                              border: `1px solid ${isDeposit ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                            }}
                          >
                            {isDeposit ? '↓ Deposit' : '↑ Withdrawal'}
                          </span>
                        </td>
                        <td className="fw-bold text-white">
                          ₹{Number(t.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-secondary">{t.paymentMode || 'Net Banking'}</td>
                        <td className="text-secondary small">
                          {t.time ? new Date(t.time).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
