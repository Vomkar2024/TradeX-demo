import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { GeneralContext } from '../context/GeneralContext';

const Profile = () => {
  const { balance, updateBalance } = useContext(GeneralContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transType, setTransType] = useState('Deposit');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Net Banking');
  const [transacting, setTransacting] = useState(false);

  const userId = localStorage.getItem('userId');

  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get(`/fetch-user/${userId}`);
        if (!isMounted) return;
        setUser(res.data);
        if (res.data?.balance !== undefined) {
          updateBalance(res.data.balance);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Fetch user error:', err);
        toast.error('Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [userId, updateBalance, refreshCount]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    const transAmount = parseInt(amount, 10);
    if (!transAmount || transAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (transType === 'Withdraw' && balance < transAmount) {
      toast.error('Insufficient account balance for this withdrawal');
      return;
    }

    setTransacting(true);
    try {
      const payload = {
        user: userId,
        type: transType,
        paymentMode: paymentMode,
        amount: transAmount,
      };

      const res = await axiosInstance.post('/newTransaction', payload);
      if (res.status === 201) {
        if (res.data?.balance !== undefined) {
          updateBalance(res.data.balance);
        } else {
          const nextBal = transType === 'Deposit' ? balance + transAmount : balance - transAmount;
          updateBalance(nextBal);
        }
        toast.success(`${transType} of ₹${transAmount.toLocaleString('en-IN')} successful!`);
        setAmount('');
        setRefreshCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Transaction error:', err);
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setTransacting(false);
    }
  };

  const userType = localStorage.getItem('userType');
  const email = localStorage.getItem('email');
  const isDemo = localStorage.getItem('isDemoMode') === 'true' && userType !== 'admin' && email !== 'trader@tradex.com';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Account & Wallet</h1>
          <p className="page-subtitle">View your account details and manage funds</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <h3 className="h5 fw-bold mb-4">Account Information</h3>
            {loading ? (
              <p className="text-muted">Loading profile...</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div>
                  <span className="text-muted small">Username</span>
                  <p className="fw-semibold mb-0">{user?.username}</p>
                </div>
                <div>
                  <span className="text-muted small">Email Address</span>
                  <p className="fw-semibold mb-0">{user?.email}</p>
                </div>
                <div>
                  <span className="text-muted small">Account Type</span>
                  <p className="mb-0">
                    <span className="badge bg-primary text-capitalize">
                      {isDemo ? 'Demo Trader' : user?.usertype}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted small">User ID</span>
                  <p className="font-monospace text-secondary small mb-0">{user?._id}</p>
                </div>
                <hr className="my-2" />
                <div>
                  <span className="text-muted small">Current Balance</span>
                  <h3 className="fw-bold text-success mt-1 mb-0">
                    ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          {isDemo ? (
            <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 h-100 d-flex flex-column justify-content-center">
              <div className="text-center py-3">
                <div
                  className="mb-3 d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '2rem',
                  }}
                >
                  ⚡
                </div>
                <h3 className="h4 fw-bold text-white mb-2">Demo Account</h3>
                <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '440px', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Wallet deposits and withdrawals are disabled in Demo Mode. Your account is preloaded with <strong>₹25,000.00</strong> virtual balance for practicing trades.
                </p>
                <div
                  className="d-flex flex-column gap-2 p-3 rounded-3 mb-4 mx-auto text-start"
                  style={{ maxWidth: '440px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-success">✔</span>
                    <span className="small text-light">Reset your balance anytime via <strong>Reset Demo</strong> in the menu</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-primary">✔</span>
                    <span className="small text-light">Full access to live market quotes, charts, and order execution</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-warning">🔒</span>
                    <span className="small text-secondary">Deposit and withdrawal functions are available on registered accounts</span>
                  </div>
                </div>
                <div>
                  <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill small">
                    Demo Mode Active • Virtual Balance
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h3 className="h5 fw-bold mb-3">Deposit / Withdraw Funds</h3>
              <p className="text-muted small mb-4">
                Add or withdraw funds from your account balance.
              </p>

              <form onSubmit={handleTransaction}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Action</label>
                    <select
                      className="form-select form-select-lg"
                      value={transType}
                      onChange={(e) => setTransType(e.target.value)}
                    >
                      <option value="Deposit">Deposit Funds (+)</option>
                      <option value="Withdraw">Withdraw Funds (-)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Payment Method</label>
                    <select
                      className="form-select form-select-lg"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      <option value="Net Banking">Net Banking</option>
                      <option value="UPI">UPI / Instant Transfer</option>
                      <option value="Credit/Debit Card">Credit / Debit Card</option>
                      <option value="Wire Transfer">Wire Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Amount (₹ INR)</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="form-control"
                      placeholder="Enter amount (e.g. 1000)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-lg w-100 fw-semibold rounded-3 ${
                    transType === 'Deposit' ? 'btn-success' : 'btn-danger'
                  }`}
                  disabled={transacting || !amount}
                >
                  {transacting ? 'Processing...' : `${transType} ₹${amount || 0}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
