import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const History = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const [ordersRes, transRes] = await Promise.all([
        axiosInstance.get('/fetch-orders'),
        axiosInstance.get('/fetch-transactions'),
      ]);

      const userOrders = (ordersRes.data || [])
        .filter((o) => o.user === userId)
        .reverse();
      const userTransactions = (transRes.data || [])
        .filter((t) => t.user === userId)
        .reverse();

      setOrders(userOrders);
      setTransactions(userTransactions);
    } catch (err) {
      console.error('History fetch error:', err);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity History</h1>
          <p className="page-subtitle">Complete ledger of your stock orders and account transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link px-4 py-2 ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Stock Orders ({orders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link px-4 py-2 ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Cash Transactions ({transactions.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
          Loading history records...
        </div>
      ) : activeTab === 'orders' ? (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-5 text-center text-muted">No stock orders found.</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Shares</th>
                    <th>Execution Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <span className={`order-badge ${o.orderType?.toLowerCase()}`}>
                          {o.orderType || 'Buy'}
                        </span>
                      </td>
                      <td className="fw-bold">{o.symbol}</td>
                      <td>{o.name}</td>
                      <td>{o.count}</td>
                      <td>${Number(o.price).toFixed(2)}</td>
                      <td className="fw-bold">${Number(o.totalPrice).toLocaleString()}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success">
                          {o.orderStatus || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-5 text-center text-muted">No cash transactions found.</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <span
                          className={`badge ${
                            t.type?.toLowerCase() === 'deposit'
                              ? 'bg-success text-white'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="fw-bold">${Number(t.amount).toLocaleString()}</td>
                      <td>{t.paymentMode || 'Net Banking'}</td>
                      <td className="text-muted small">
                        {t.time ? new Date(t.time).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
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
