import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transType, setTransType] = useState('Deposit');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Net Banking');
  const [transacting, setTransacting] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/fetch-user/${userId}`);
      setUser(res.data);
      if (res.data?.balance !== undefined) {
        localStorage.setItem('balance', res.data.balance);
      }
    } catch (err) {
      console.error('Fetch user error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    const transAmount = parseInt(amount, 10);
    if (!transAmount || transAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (transType === 'Withdraw' && (user?.balance || 0) < transAmount) {
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
        toast.success(`${transType} of $${transAmount.toLocaleString()} successful!`);
        setAmount('');
        fetchProfile();
      }
    } catch (err) {
      console.error('Transaction error:', err);
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setTransacting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account & Wallet</h1>
          <p className="page-subtitle">Manage personal profile details and transfer funds</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
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
                    <span className="badge bg-primary text-capitalize">{user?.usertype}</span>
                  </p>
                </div>
                <div>
                  <span className="text-muted small">Account Identifier</span>
                  <p className="font-monospace text-secondary small mb-0">{user?._id}</p>
                </div>
                <hr className="my-2" />
                <div>
                  <span className="text-muted small">Current Balance</span>
                  <h3 className="fw-bold text-success mt-1 mb-0">
                    ${Number(user?.balance || 0).toLocaleString()}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deposit/Withdraw Form */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h3 className="h5 fw-bold mb-3">Deposit / Withdraw Funds</h3>
            <p className="text-muted small mb-4">
              Add capital to execute stock purchases or withdraw earnings to your linked bank account.
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
                <label className="form-label small fw-semibold">Amount ($ USD)</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">$</span>
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
                {transacting ? 'Processing...' : `${transType} $${amount || 0}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
