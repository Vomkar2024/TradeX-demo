import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { GeneralContext } from '../context/GeneralContext';
import {
  getStockRegistry,
  getAssetBySymbol,
  subscribeMarketUpdates,
} from '../utils/marketData';

const TIMEFRAMES = ['1D', '1W', '1M', '1Y', 'ALL'];
const QUANTITY_PRESETS = [1, 5, 10, 25];

const StockChart = () => {
  const { id: paramSymbol } = useParams();
  const navigate = useNavigate();
  const { balance, updateBalance } = useContext(GeneralContext);

  const selectedSymbol = (paramSymbol || 'RELIANCE').toUpperCase();
  const [stockRegistry, setStockRegistry] = useState(getStockRegistry);
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('Line'); // 'Line' | 'Candles'
  const [orderAction, setOrderAction] = useState('BUY');
  const [orderType, setOrderType] = useState('Market Order');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userHoldings, setUserHoldings] = useState(0);
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeMarketUpdates(() => {
      setStockRegistry(getStockRegistry());
    });
    return () => unsubscribe();
  }, []);

  const currentStock = useMemo(() => {
    if (stockRegistry[selectedSymbol]) {
      return stockRegistry[selectedSymbol];
    }
    return getAssetBySymbol(selectedSymbol);
  }, [selectedSymbol, stockRegistry]);


  // Fetch user's current holdings for this symbol
  const userId = localStorage.getItem('userId');
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const res = await axiosInstance.get('/fetch-stocks');
        const holdings = (res.data || []).filter(
          (s) => s.user === userId && s.symbol?.toUpperCase() === selectedSymbol
        );
        const totalOwned = holdings.reduce((sum, h) => sum + (Number(h.count) || 0), 0);
        setUserHoldings(totalOwned);
      } catch (err) {
        console.error('Error fetching user stock holdings:', err);
      }
    };
    if (userId) fetchHoldings();
  }, [selectedSymbol, userId]);

  // Generate deterministic chart points based on stock and timeframe
  const chartPoints = useMemo(() => {
    const count = chartType === 'Candles' ? 24 : 32;
    const base = currentStock.basePrice;
    let seed = (selectedSymbol + timeframe).split('').reduce((acc, c) => acc + c.charCodeAt(0), 100);
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const isUp = currentStock.changePct >= 0;
    const startPrice = isUp ? base * 0.88 : base * 1.12;
    const step = (base - startPrice) / (count - 1);

    const points = [];
    let current = startPrice;

    for (let i = 0; i < count; i++) {
      const noise = (pseudoRandom() - 0.49) * (base * 0.05);
      const close = i === count - 1 ? base : Math.max(base * 0.1, current + step + noise);
      const open = i === 0 ? startPrice : points[i - 1]?.close || current;
      const high = Math.max(open, close) + pseudoRandom() * (base * 0.02);
      const low = Math.min(open, close) - pseudoRandom() * (base * 0.02);

      points.push({
        index: i,
        open,
        close,
        high,
        low,
        price: close,
      });
      current = close;
    }
    return points;
  }, [selectedSymbol, currentStock.basePrice, currentStock.changePct, chartType, timeframe]);

  // Calculate high, low, and labels for Y-Axis
  const yValues = chartPoints.flatMap((p) => [p.low, p.high]);
  const minPrice = Math.min(...yValues) * 0.98;
  const maxPrice = Math.max(...yValues) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  // 5 discrete Y-axis ticks
  const yTicks = useMemo(() => {
    return [0, 1, 2, 3, 4].map((step) => {
      const val = maxPrice - (step / 4) * (maxPrice - minPrice);
      return val.toFixed(1);
    });
  }, [maxPrice, minPrice]);

  const handleStockChange = (e) => {
    const sym = e.target.value;
    navigate(`/stock/${sym}`);
  };

  const unitPrice = currentStock.basePrice;
  const totalValue = Math.round(unitPrice * (Number(quantity) || 0));

  // Handle Order Execution
  const handleExecuteOrder = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity of shares.');
      return;
    }

    if (orderAction === 'BUY') {
      if (balance < totalValue) {
        toast.error(`Insufficient balance! Required: ₹${totalValue.toLocaleString('en-IN')}`);
        return;
      }
    } else {
      if (userHoldings < qty) {
        toast.error(`You only own ${userHoldings} shares of ${selectedSymbol} to sell.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        user: userId || localStorage.getItem('userId'),
        symbol: selectedSymbol,
        name: currentStock.name,
        stockType: 'Equity',
        stockExchange: currentStock.exchange,
        price: Math.round(unitPrice),
        count: qty,
        totalPrice: totalValue,
      };

      if (orderAction === 'BUY') {
        const res = await axiosInstance.post('/buyStock', payload);
        if (res.status === 201 || res.status === 200) {
          const updatedBal = res.data?.balance !== undefined ? Number(res.data.balance) : balance - totalValue;
          updateBalance(updatedBal);
          setUserHoldings((prev) => prev + qty);
          toast.success(`Executed BUY order for ${qty} shares of ${selectedSymbol}!`);
        }
      } else {
        const res = await axiosInstance.post('/sellStock', payload);
        if (res.status === 201 || res.status === 200) {
          const updatedBal = res.data?.balance !== undefined ? Number(res.data.balance) : balance + totalValue;
          updateBalance(updatedBal);
          setUserHoldings((prev) => Math.max(0, prev - qty));
          toast.success(`Executed SELL order for ${qty} shares of ${selectedSymbol}!`);
        }
      }
    } catch (err) {
      console.error('Order execution error:', err);
      toast.error(err.response?.data?.message || `Failed to execute ${orderAction} order`);
    } finally {
      setLoading(false);
    }
  };

  // SVG Chart Dimensions
  const svgWidth = 860;
  const svgHeight = 440;
  const padLeft = 20;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (idx) => padLeft + (idx / (chartPoints.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minPrice) / priceRange) * chartH;

  // Build SVG Path for Line Chart
  const linePointsString = chartPoints
    .map((p, i) => `${getX(i)},${getY(p.price)}`)
    .join(' ');

  const areaPath = `M ${getX(0)},${getY(chartPoints[0].price)} ` +
    chartPoints.slice(1).map((p, i) => `L ${getX(i + 1)},${getY(p.price)}`).join(' ') +
    ` L ${getX(chartPoints.length - 1)},${padTop + chartH} L ${getX(0)},${padTop + chartH} Z`;

  const isPositiveTrend = currentStock.changePct >= 0;

  return (
    <div className="desk-page-wrapper">
      <div className="desk-main-container">
        <header className="desk-topbar">
          <div className="desk-topbar-left">
            <div className="stock-select-wrapper">
              <select
                className="stock-select-control"
                value={selectedSymbol}
                onChange={handleStockChange}
              >
                {Object.keys(stockRegistry).map((sym) => (
                  <option key={sym} value={sym}>
                    {sym} — {stockRegistry[sym].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="desk-price-display">
              <span className="desk-big-price">
                ₹
                {(hoveredData ? hoveredData.price : currentStock.basePrice).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className={`desk-change-pill ${isPositiveTrend ? 'positive' : 'negative'}`}>
                {isPositiveTrend ? '▲ +' : '▼ -'}
                ₹{Math.abs(currentStock.change).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                ({isPositiveTrend ? '+' : ''}
                {currentStock.changePct.toFixed(2)}%)
              </span>
            </div>

            <div className="desk-subtitle">
              {currentStock.name} • {currentStock.exchange} • Live Feed
            </div>
          </div>

          <div className="desk-topbar-right">
            <div className="desk-pill-group">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`desk-pill-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="desk-pill-group">
              <button
                type="button"
                className={`desk-pill-btn ${chartType === 'Line' ? 'active' : ''}`}
                onClick={() => setChartType('Line')}
              >
                Line
              </button>
              <button
                type="button"
                className={`desk-pill-btn ${chartType === 'Candles' ? 'active' : ''}`}
                onClick={() => setChartType('Candles')}
              >
                Candles
              </button>
            </div>
          </div>
        </header>

        <div className="desk-grid-layout">
          <div className="desk-chart-card">
            <div className="desk-chart-inner">
              <div className="desk-yaxis-labels">
                {yTicks.map((tick, i) => (
                  <div key={i} className="desk-yaxis-tick">
                    ₹{typeof tick === 'number' ? tick.toLocaleString('en-IN') : tick}
                  </div>
                ))}
              </div>

              <div className="desk-svg-container">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="desk-chart-svg"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#818cf8" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Horizontal Guideline Ticks */}
                  {[0, 1, 2, 3, 4].map((step) => {
                    const yPos = padTop + (step / 4) * chartH;
                    return (
                      <line
                        key={step}
                        x1={padLeft}
                        y1={yPos}
                        x2={svgWidth - padRight}
                        y2={yPos}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Render Line Chart Mode */}
                  {chartType === 'Line' && (
                    <g>
                      <path d={areaPath} fill="url(#chartGradient)" />
                      <polyline
                        fill="none"
                        stroke="url(#lineStroke)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#neonGlow)"
                        points={linePointsString}
                      />
                      {/* Active / Hovered Dot */}
                      {hoveredData && (
                        <circle
                          cx={getX(hoveredData.index)}
                          cy={getY(hoveredData.price)}
                          r="6"
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                        />
                      )}
                    </g>
                  )}

                  {/* Render Candlestick Mode */}
                  {chartType === 'Candles' && (
                    <g>
                      {chartPoints.map((p, idx) => {
                        const isUp = p.close >= p.open;
                        const candleColor = isUp ? '#10b981' : '#f43f5e';
                        const cx = getX(idx);
                        const yHigh = getY(p.high);
                        const yLow = getY(p.low);
                        const yOpen = getY(p.open);
                        const yClose = getY(p.close);
                        const topBody = Math.min(yOpen, yClose);
                        const bodyH = Math.max(Math.abs(yClose - yOpen), 3);
                        const candleW = Math.max(chartW / (chartPoints.length * 1.5), 10);

                        return (
                          <g
                            key={idx}
                            onMouseEnter={() => setHoveredData(p)}
                            onMouseLeave={() => setHoveredData(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            <line
                              x1={cx}
                              y1={yHigh}
                              x2={cx}
                              y2={yLow}
                              stroke={candleColor}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <rect
                              x={cx - candleW / 2}
                              y={topBody}
                              width={candleW}
                              height={bodyH}
                              fill={candleColor}
                              rx="2"
                              opacity={hoveredData && hoveredData.index === idx ? 1 : 0.9}
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}
                </svg>
              </div>
            </div>

            <div className="desk-xaxis-timeline">
              <span>Past Period ({timeframe})</span>
              <span>Market Midpoint</span>
              <span>Latest Close</span>
            </div>
          </div>

          <div className="desk-order-slip-card">
            <h3 className="desk-slip-title">Place Order</h3>

            <div className="desk-action-switch">
              <button
                type="button"
                className={`desk-switch-btn buy ${orderAction === 'BUY' ? 'active' : ''}`}
                onClick={() => setOrderAction('BUY')}
              >
                BUY
              </button>
              <button
                type="button"
                className={`desk-switch-btn sell ${orderAction === 'SELL' ? 'active' : ''}`}
                onClick={() => setOrderAction('SELL')}
              >
                SELL
              </button>
            </div>

            <form onSubmit={handleExecuteOrder} className="desk-slip-form">
              <div className="mb-3">
                <label className="desk-slip-label">Order Type</label>
                <select
                  className="desk-slip-select"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="Market Order">Market Order</option>
                  <option value="Limit Order">Limit Order</option>
                  <option value="Stop-Loss Protected Order">Stop-Loss Order</option>
                </select>
              </div>

              {/* Quantity (Shares) */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="desk-slip-label mb-0">Quantity (Shares)</label>
                  {orderAction === 'SELL' && (
                    <span className="desk-holdings-hint">Owned: {userHoldings} shares</span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="desk-slip-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Quick Preset Pills */}
              <div className="desk-quick-pills mb-4">
                {QUANTITY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`desk-quick-pill ${Number(quantity) === preset ? 'active' : ''}`}
                    onClick={() => setQuantity(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Summary Breakdown */}
              <div className="desk-summary-box mb-4">
                <div className="desk-summary-row">
                  <span className="summary-label">Unit Price</span>
                  <span className="summary-val">
                    ₹
                    {unitPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="desk-summary-row">
                  <span className="summary-label">Trading Fee</span>
                  <span className="summary-val fee-free">₹0.00 (Zero Fee)</span>
                </div>
                <div className="desk-summary-divider"></div>
                <div className="desk-summary-row total-row">
                  <span className="summary-label-total">Total Value</span>
                  <span className="summary-val-total">
                    ₹
                    {totalValue.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="desk-cash-available">
                  Available Balance: ₹
                  {Number(balance || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <button
                type="submit"
                className={`desk-execute-btn ${orderAction === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
                disabled={
                  loading ||
                  !quantity ||
                  (orderAction === 'BUY' && balance < totalValue) ||
                  (orderAction === 'SELL' && userHoldings < Number(quantity))
                }
              >
                {loading
                  ? 'Processing...'
                  : orderAction === 'BUY'
                  ? `Buy ${currentStock.symbol}`
                  : `Sell ${currentStock.symbol}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
