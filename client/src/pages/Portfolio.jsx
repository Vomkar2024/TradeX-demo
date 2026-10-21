import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext';

const Portfolio = () => {
  const { balance, updateBalance } = useContext(GeneralContext);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellModalStock, setSellModalStock] = useState(null);
  const [sellCount, setSellCount] = useState(1);
  const [selling, setSelling] = useState(false);
  const [buyModalStock, setBuyModalStock] = useState(null);
  const [buyCount, setBuyCount] = useState(1);
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUserStocks();
  }, []);

  const fetchUserStocks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/fetch-stocks');
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

    const price = Number(sellModalStock.price || 0);
    const totalPrice = Number((price * countToSell).toFixed(2));

    setSelling(true);
    try {
      const payload = {
        user: userId,
        symbol: sellModalStock.symbol,
        name: sellModalStock.name,
        stockType: sellModalStock.stockExchange === 'Crypto' ? 'Crypto' : 'Equity',
        price: price,
        count: countToSell,
        totalPrice: totalPrice,
      };

      const res = await axiosInstance.post('/sellStock', payload);
      if (res.status === 201) {
        const updatedBalance = res.data?.balance !== undefined 
          ? Number(res.data.balance) 
          : balance + totalPrice;
        updateBalance(updatedBalance);
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

  const handleBuyStock = async (e) => {
    e.preventDefault();
    if (!buyModalStock) return;

    const countToBuy = parseInt(buyCount, 10);
    if (!countToBuy || countToBuy <= 0) {
      toast.error('Please enter a valid quantity of shares.');
      return;
    }

    const price = Number(buyModalStock.price || 0);
    const totalPrice = Number((price * countToBuy).toFixed(2));

    if (balance < totalPrice) {
      toast.error(`Insufficient balance! Required: ₹${totalPrice.toLocaleString('en-IN')}`);
      return;
    }

    setBuying(true);
    try {
      const payload = {
        user: userId,
        symbol: buyModalStock.symbol,
        name: buyModalStock.name || buyModalStock.symbol,
        stockType: buyModalStock.stockExchange === 'Crypto' ? 'Crypto' : 'Equity',
        stockExchange: buyModalStock.stockExchange || 'NSE',
        price: price,
        count: countToBuy,
        totalPrice: totalPrice,
      };

      const res = await axiosInstance.post('/buyStock', payload);
      if (res.status === 201) {
        const updatedBalance = res.data?.balance !== undefined 
          ? Number(res.data.balance) 
          : balance - totalPrice;
        updateBalance(updatedBalance);
        toast.success(`Purchased ${countToBuy} shares of ${buyModalStock.symbol}!`);
        setBuyModalStock(null);
        fetchUserStocks();
      }
    } catch (err) {
      console.error('Buy stock error:', err);
      toast.error(err.response?.data?.message || 'Error occurred while buying');
    } finally {
      setBuying(false);
    }
  };

  const totalPortfolioValue = stocks.reduce((acc, cur) => acc + (Number(cur.totalPrice) || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title">My Portfolio</h1>
          <p className="page-subtitle">Track your holdings, real-time value, and live trade positions</p>
        </div>
        <button className="btn-portfolio-explore" onClick={() => navigate('/home')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          <span>Explore Market Securities</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <span className="text-secondary small fw-semibold">Portfolio Holdings Value</span>
            <h2 className="fw-bold mt-2 mb-0 text-white">
              ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <span className="text-secondary small fw-semibold">Available Buying Power</span>
            <h2 className="fw-bold mt-2 mb-0 text-success">
              ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <span className="text-secondary small fw-semibold">Total Active Positions</span>
            <h2 className="fw-bold mt-2 mb-0 text-info">{stocks.length}</h2>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
          <h4 className="h5 fw-bold mb-0 text-white">Active Holdings</h4>
          <span className="badge bg-secondary-subtle text-secondary small">{stocks.length} assets held</span>
        </div>

        {loading ? (
          <div className="p-5 text-center text-secondary">Loading portfolio positions...</div>
        ) : stocks.length === 0 ? (
          <div className="p-5 text-center">
            <p className="text-secondary mb-3">You do not have any holdings in your portfolio yet.</p>
            <button className="btn-portfolio-explore" onClick={() => navigate('/home')}>
              Explore Assets
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Avg Unit Price</th>
                  <th>Total Value</th>
                  <th className="portfolio-actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const isCrypto = stock.stockExchange === 'Crypto' || stock.symbol === 'BTC' || stock.symbol === 'ETH' || stock.symbol === 'SOL' || stock.symbol === 'DOGE' || stock.symbol === 'XRP';
                  return (
                    <tr key={stock._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary-subtle text-primary fw-bold">
                            {stock.symbol}
                          </span>
                          <span className={`asset-badge-tag ${isCrypto ? 'crypto' : 'equity'}`}>
                            {isCrypto ? 'Crypto' : 'NSE'}
                          </span>
                        </div>
                      </td>
                      <td className="fw-medium text-white">{stock.name || stock.symbol}</td>
                      <td>{stock.count}</td>
                      <td>
                        ₹{Number(stock.price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="fw-bold text-white">
                        ₹{Number(stock.totalPrice).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="portfolio-actions-cell">
                        <div className="portfolio-actions-wrap">
                          <button
                            type="button"
                            className="btn-portfolio-action btn-portfolio-buy"
                            onClick={() => {
                              setBuyModalStock(stock);
                              setBuyCount(1);
                            }}
                            title={`Buy more shares of ${stock.symbol}`}
                          >
                            Buy
                          </button>
                          <button
                            type="button"
                            className="btn-portfolio-action btn-portfolio-sell"
                            onClick={() => {
                              setSellModalStock(stock);
                              setSellCount(1);
                            }}
                            title={`Sell ${stock.symbol} position`}
                          >
                            Sell
                          </button>
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

      {sellModalStock && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-white">Sell {sellModalStock.symbol}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSellModalStock(null)}
                ></button>
              </div>
              <form onSubmit={handleSellStock}>
                <div className="modal-body p-4">
                  <div className="mb-3 d-flex justify-content-between">
                    <span className="text-secondary small">Available Shares:</span>
                    <strong className="text-white">{sellModalStock.count}</strong>
                  </div>
                  <div className="mb-3 d-flex justify-content-between">
                    <span className="text-secondary small">Unit Price:</span>
                    <strong className="text-white">
                      ₹{Number(sellModalStock.price).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Quantity to Sell</label>
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
                  <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary">Expected Payout:</span>
                      <strong className="text-success h5 mb-0">
                        ₹{(Number(sellModalStock.price) * (parseInt(sellCount, 10) || 0)).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setSellModalStock(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-confirm-sell"
                    disabled={selling || !sellCount}
                  >
                    {selling ? 'Executing Order...' : 'Confirm Sell Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {buyModalStock && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ background: '#161c2d', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="modal-header border-bottom border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">BUY ORDER</span>
                  <h5 className="modal-title fw-bold text-white mb-0">{buyModalStock.symbol}</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setBuyModalStock(null)}
                ></button>
              </div>
              <form onSubmit={handleBuyStock}>
                <div className="modal-body p-4">
                  <div className="mb-2 d-flex justify-content-between">
                    <span className="text-secondary small">Current Holdings:</span>
                    <strong className="text-white">{buyModalStock.count} shares</strong>
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span className="text-secondary small">Unit Price:</span>
                    <strong className="text-white">
                      ₹{Number(buyModalStock.price).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="mb-3 d-flex justify-content-between">
                    <span className="text-secondary small">Available Balance:</span>
                    <strong className="text-success">
                      ₹{Number(balance).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Quantity to Buy</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control bg-dark text-white border-secondary border-opacity-50"
                      value={buyCount}
                      onChange={(e) => setBuyCount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary">Estimated Total Cost:</span>
                      <strong className="text-success h5 mb-0">
                        ₹{(Number(buyModalStock.price) * (parseInt(buyCount, 10) || 0)).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  </div>
                  {balance < (Number(buyModalStock.price) * (parseInt(buyCount, 10) || 0)) && (
                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small">
                      ⚠️ Insufficient balance for this order.
                    </div>
                  )}
                  <div className="mt-3 text-end">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-decoration-none text-info p-0"
                      onClick={() => navigate(`/stock/${buyModalStock.symbol}`)}
                    >
                      View Full Chart →
                    </button>
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setBuyModalStock(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-confirm-buy"
                    disabled={
                      buying ||
                      !buyCount ||
                      balance < (Number(buyModalStock.price) * (parseInt(buyCount, 10) || 0))
                    }
                  >
                    {buying ? 'Executing Order...' : 'Confirm Buy Order'}
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
