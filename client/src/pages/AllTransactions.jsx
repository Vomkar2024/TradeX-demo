import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    await axiosInstance
      .get('/fetch-transactions')
      .then((response) => {
        setTransactions(response.data.reverse());
      })
      .catch((err) => {
        console.log(err);
        toast.error('Failed to load transactions');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="orderPage">
      <div className="all-orders-container">
        <div className="all-orders-container-head">
          <h2>All Financial Transactions</h2>
          <span className="badge bg-success fs-6">{transactions.length} Records</span>
        </div>

        {loading ? (
          <div className="p-4 text-center text-muted">Loading transaction ledger...</div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-muted">No transactions found on the platform.</div>
        ) : (
          <div className="all-orders">
            {transactions.map((t) => {
              const isDeposit = t.type?.toLowerCase() === 'deposit';
              return (
                <div className="all-orders-stock" key={t._id}>
                  <span>
                    <h5 className="text-muted small mb-1">Transaction ID</h5>
                    <p className="font-monospace small mb-0">{t._id}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Type</h5>
                    <span
                      className={`badge ${isDeposit ? 'bg-success text-white' : 'bg-warning text-dark'}`}
                    >
                      {t.type}
                    </span>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Payment Method</h5>
                    <p className="mb-0">{t.paymentMode || 'Net Banking'}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Amount</h5>
                    <p
                      className="fw-bold mb-0"
                      style={{ color: isDeposit ? '#16a34a' : '#dc2626' }}
                    >
                      {isDeposit ? '+' : '-'}${Number(t.amount).toLocaleString()}
                    </p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">User ID</h5>
                    <p className="font-monospace small mb-0">{t.user}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Date & Time</h5>
                    <p className="text-muted small mb-0">
                      {t.time ? new Date(t.time).toLocaleString() : 'N/A'}
                    </p>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTransactions;
