import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Portfolio = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellModalStock, setSellModalStock] = useState(null);
  const [sellCount, setSellCount] = useState(1);
  const [selling, setSelling] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const balance = Number(localStorage.getItem('balance') || 0);

  useEffect(() => {
    fetchUserStocks();
  }, []);

  const fetchUserStocks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/fetch-stocks');
      // Filter stocks for current user
      const userHoldings = (res.data || []).filter((s) => s.user === userId);
      setStocks(userHoldings);
    } catch (err) {
      console.error('Fetch stocks error:', err);
      toast.error('Failed to load portfolio holdings');
    } finally {
      setLoading(false);
    }
  };

  const handleSellStock = async (e) => {
    e.preventDefault();
    if (!sellModalStock) return;

    const countToSell = parseInt(sellCount, 10);
    if (!countToSell || countToSell <= 0 || countToSell > sellModalStock.count) {
      toast.error(`Please enter a valid count between 1 and ${sellModalStock.count}`);
      return;
    }

    const price = Math.round(sellModalStock.price);
    const totalPrice = price * countToSell;

    setSelling(true);
    try {
      const payload = {
        user: userId,
        symbol: sellModalStock.symbol,
        name: sellModalStock.name,
        stockType: 'Equity',
        price: price,
        count: countToSell,
        totalPrice: totalPrice,
      };

      const res = await axiosInstance.post('/sellStock', payload);
      if (res.status === 201) {
        const newBalance = balance + totalPrice;
        localStorage.setItem('balance', newBalance);
        toast.success(`Sold ${countToSell} shares of ${sellModalStock.symbol}!`);
        setSellModalStock(null);
        fetchUserStocks();
      }
    } catch (err) {
      console.error('Sell stock error:', err);
      toast.error(err.response?.data?.message || 'Error occurred while selling');
    } finally {
      setSelling(false);
    }
  };

  const totalPortfolioValue = stocks.reduce((acc, cur) => acc + (Number(cur.totalPrice) || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Portfolio</h1>
          <p className="page-subtitle">Track your equity holdings, real-time value, and trade positions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>
          + Trade More Stocks
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <span className="text-muted small fw-semibold">Portfolio Value</span>
            <h2 className="fw-bold mt-2 mb-0">${totalPortfolioValue.toLocaleString()}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <span className="text-muted small fw-semibold">Available Buying Power</span>
            <h2 className="fw-bold mt-2 mb-0 text-success">${balance.toLocaleString()}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <span className="text-muted small fw-semibold">Total Positions</span>
            <h2 className="fw-bold mt-2 mb-0">{stocks.length}</h2>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 px-4 border-bottom">
          <h4 className="h5 fw-bold mb-0">Active Holdings</h4>
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">Loading portfolio positions...</div>
        ) : stocks.length === 0 ? (
          <div className="p-5 text-center">
            <p className="text-muted mb-3">You do not have any stock holdings yet.</p>
            <button className="btn btn-outline-primary" onClick={() => navigate('/home')}>
              Explore Trending Stocks
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Quantity</th>
                  <th>Avg Price</th>
                  <th>Total Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock._id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold">
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="fw-medium">{stock.name || stock.symbol}</td>
                    <td>{stock.count}</td>
                    <td>${Number(stock.price).toFixed(2)}</td>
                    <td className="fw-bold">${Number(stock.totalPrice).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm px-3"
                        onClick={() => {
                          setSellModalStock(stock);
                          setSellCount(1);
                        }}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {sellModalStock && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Sell {sellModalStock.symbol}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSellModalStock(null)}
                ></button>
              </div>
              <form onSubmit={handleSellStock}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <span className="text-muted small">Available Shares:</span>
                    <strong className="ms-2">{sellModalStock.count}</strong>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted small">Current Unit Price:</span>
                    <strong className="ms-2">${Math.round(sellModalStock.price)}</strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Quantity to Sell</label>
                    <input
                      type="number"
                      min="1"
                      max={sellModalStock.count}
                      className="form-control"
                      value={sellCount}
                      onChange={(e) => setSellCount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="p-3 bg-light rounded-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total Payout:</span>
                      <strong className="text-success h5 mb-0">
                        ${(Math.round(sellModalStock.price) * (parseInt(sellCount, 10) || 0)).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSellModalStock(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger px-4"
                    disabled={selling || !sellCount}
                  >
                    {selling ? 'Selling...' : 'Confirm Sell'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
