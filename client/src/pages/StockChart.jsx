import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const StockChart = () => {
  const { id: symbol } = useParams();
  const navigate = useNavigate();

  const [stockDetails, setStockDetails] = useState({
    name: symbol,
    symbol: symbol,
    price: 150.00,
    change: 1.25,
    exchange: 'NASDAQ',
  });
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const balance = Number(localStorage.getItem('balance') || 0);

  // Load TradingView Widget
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `NASDAQ:${symbol}`,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  const handleBuy = async (e) => {
    e.preventDefault();
    const purchaseCount = parseInt(count, 10);
    if (!purchaseCount || purchaseCount <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const price = Math.round(stockDetails.price);
    const totalPrice = price * purchaseCount;

    if (balance < totalPrice) {
      toast.error('Insufficient funds in your account');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user: localStorage.getItem('userId'),
        symbol: symbol.toUpperCase(),
        name: stockDetails.name,
        stockType: 'Equity',
        stockExchange: stockDetails.exchange,
        price: price,
        count: purchaseCount,
        totalPrice: totalPrice,
      };

      const res = await axiosInstance.post('/buyStock', payload);
      if (res.status === 201) {
        const newBalance = balance - totalPrice;
        localStorage.setItem('balance', newBalance);
        toast.success(`Successfully bought ${purchaseCount} shares of ${symbol}!`);
        navigate('/portfolio');
      }
    } catch (err) {
      console.error('Buy stock error:', err);
      toast.error(err.response?.data?.message || 'Failed to execute buy order');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = Math.round(stockDetails.price) * (parseInt(count, 10) || 0);

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => navigate('/home')}>
            ← Back to Markets
          </button>
          <h1 className="h2 fw-bold text-dark mb-1">{symbol.toUpperCase()}</h1>
          <p className="text-muted mb-0">{stockDetails.name} • {stockDetails.exchange}</p>
        </div>
        <div className="text-end">
          <h2 className="fw-bold mb-0">${Number(stockDetails.price).toFixed(2)}</h2>
          <span className="badge bg-success-subtle text-success">Active Trading</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Interactive Chart */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ height: '560px' }}>
            <div className="tradingview-widget-container h-100 w-100" ref={containerRef}>
              <div className="tradingview-widget-container__widget h-100 w-100"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Buy Order Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h3 className="h5 fw-bold mb-3">Place Order</h3>
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Available Cash:</span>
                <span className="fw-semibold text-dark">${balance.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Execution Price:</span>
                <span className="fw-semibold text-dark">${Math.round(stockDetails.price)}</span>
              </div>
            </div>

            <form onSubmit={handleBuy}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="form-control form-control-lg"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                />
              </div>

              <div className="border-top pt-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Estimated Total:</span>
                  <span className="h4 fw-bold text-primary mb-0">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 fw-semibold rounded-3 shadow-sm"
                disabled={loading || balance < totalPrice || !count}
              >
                {loading ? 'Executing Order...' : `Buy ${symbol.toUpperCase()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
