import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';
import { GeneralContext } from '../context/GeneralContext';

const STOCK_REGISTRY = {
  // Major Equities & Blue Chips
  RELIANCE: { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', basePrice: 2945.50, change: 41.25, changePct: 1.42, category: 'Equity' },
  TCS: { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', basePrice: 4120.00, change: 35.80, changePct: 0.88, category: 'Equity' },
  HDFCBANK: { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE', basePrice: 1680.75, change: -7.60, changePct: -0.45, category: 'Equity' },
  INFY: { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', basePrice: 1875.30, change: 39.50, changePct: 2.15, category: 'Equity' },
  TATAMOTORS: { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', exchange: 'NSE', basePrice: 965.40, change: 29.00, changePct: 3.10, category: 'Equity' },
  ICICIBANK: { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', basePrice: 1230.20, change: 7.95, changePct: 0.65, category: 'Equity' },
  ITC: { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', basePrice: 492.15, change: -1.60, changePct: -0.32, category: 'Equity' },
  ZOMATO: { symbol: 'ZOMATO', name: 'Zomato Limited', exchange: 'NSE', basePrice: 265.80, change: 10.85, changePct: 4.25, category: 'Equity' },
  TATASTEEL: { symbol: 'TATASTEEL', name: 'Tata Steel Limited', exchange: 'NSE', basePrice: 158.40, change: -1.85, changePct: -1.15, category: 'Equity' },
  IRFC: { symbol: 'IRFC', name: 'IRFC Railway Finance Corp', exchange: 'NSE', basePrice: 172.50, change: 3.05, changePct: 1.80, category: 'Equity' },

  // Cryptocurrencies (Priced in INR)
  USDT: { symbol: 'USDT', name: 'Tether USD (USDT)', exchange: 'Crypto', basePrice: 88.50, change: 0.04, changePct: 0.05, category: 'Crypto' },
  HASMSTER: { symbol: 'HASMSTER', name: 'Hamster Kombat (HMSTR)', exchange: 'Crypto', basePrice: 0.28, change: 0.02, changePct: 8.45, category: 'Crypto' },
  HMSTR: { symbol: 'HMSTR', name: 'Hamster Kombat (HMSTR)', exchange: 'Crypto', basePrice: 0.28, change: 0.02, changePct: 8.45, category: 'Crypto' },
  BTC: { symbol: 'BTC', name: 'Bitcoin (INR)', exchange: 'Crypto', basePrice: 5850000.00, change: 134200.00, changePct: 2.35, category: 'Crypto' },
  ETH: { symbol: 'ETH', name: 'Ethereum (INR)', exchange: 'Crypto', basePrice: 225000.00, change: 3980.00, changePct: 1.80, category: 'Crypto' },
  SOL: { symbol: 'SOL', name: 'Solana (INR)', exchange: 'Crypto', basePrice: 13450.00, change: 712.00, changePct: 5.60, category: 'Crypto' },
  DOGE: { symbol: 'DOGE', name: 'Dogecoin (INR)', exchange: 'Crypto', basePrice: 12.50, change: 0.75, changePct: 6.40, category: 'Crypto' },
  XRP: { symbol: 'XRP', name: 'Ripple (INR)', exchange: 'Crypto', basePrice: 48.20, change: -0.44, changePct: -0.90, category: 'Crypto' },
};

const TIMEFRAMES = ['1D', '1W', '1M', '1Y', 'ALL'];
const QUANTITY_PRESETS = [1, 5, 10, 25];

const StockChart = () => {
  const { id: paramSymbol } = useParams();
  const navigate = useNavigate();
  const { balance, updateBalance } = useContext(GeneralContext);

  const initialSymbol = (paramSymbol || 'RELIANCE').toUpperCase();
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('Line'); // 'Line' | 'Candles'
  const [orderAction, setOrderAction] = useState('BUY'); // 'BUY' | 'SELL'
  const [orderType, setOrderType] = useState('Market Order (Instant Fill)');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userHoldings, setUserHoldings] = useState(0);
  const [hoveredData, setHoveredData] = useState(null);

  // Sync selected symbol when URL param changes
  useEffect(() => {
    if (paramSymbol) {
      setSelectedSymbol(paramSymbol.toUpperCase());
    }
  }, [paramSymbol]);

  // Current stock details
  const currentStock = useMemo(() => {
    if (STOCK_REGISTRY[selectedSymbol]) {
      return STOCK_REGISTRY[selectedSymbol];
    }
    return {
      symbol: selectedSymbol,
      name: `${selectedSymbol} Security`,
      exchange: 'NSE',
      basePrice: 2945.50,
      change: 15.20,
      changePct: 0.85,
    };
  }, [selectedSymbol]);

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
    let seed = selectedSymbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 100);
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
    setSelectedSymbol(sym);
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
        {/* Top Control Bar Matching Pic 1 */}
        <header className="desk-topbar">
          <div className="desk-topbar-left">
            <div className="stock-select-wrapper">
              <select
                className="stock-select-control"
                value={selectedSymbol}
                onChange={handleStockChange}
              >
                {Object.keys(STOCK_REGISTRY).map((sym) => (
                  <option key={sym} value={sym}>
                    {sym} — {STOCK_REGISTRY[sym].name}
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
              {currentStock.name} • {currentStock.exchange} • Real-Time Interactive Feed
            </div>
          </div>

          <div className="desk-topbar-right">
            {/* Timeframe Selector Pills */}
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

            {/* Line / Candles Toggle */}
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

        {/* Two-Column Grid: Chart Area on Left, Order Execution Slip on Right */}
        <div className="desk-grid-layout">
          {/* Main Chart Area */}
          <div className="desk-chart-card">
            <div className="desk-chart-inner">
              {/* Left Y-axis Price Axis */}
              <div className="desk-yaxis-labels">
                {yTicks.map((tick, i) => (
                  <div key={i} className="desk-yaxis-tick">
                    ₹{typeof tick === 'number' ? tick.toLocaleString('en-IN') : tick}
                  </div>
                ))}
              </div>

              {/* Chart SVG Graphic */}
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

            {/* Bottom X-axis Timeline Milestones */}
            <div className="desk-xaxis-timeline">
              <span>Past Period ({timeframe})</span>
              <span>Market Midpoint</span>
              <span>Latest Close</span>
            </div>
          </div>

          {/* Right Column: Order Execution Slip */}
          <div className="desk-order-slip-card">
            <h3 className="desk-slip-title">Order Execution Slip</h3>

            {/* BUY / SELL Switch */}
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
              {/* Order Type */}
              <div className="mb-3">
                <label className="desk-slip-label">Order Type</label>
                <select
                  className="desk-slip-select"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="Market Order (Instant Fill)">Market Order (Instant Fill)</option>
                  <option value="Limit Order (Simulated)">Limit Order (Simulated)</option>
                  <option value="Stop-Loss Protected Order">Stop-Loss Protected Order</option>
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

              {/* Main Execute Button */}
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
                  ? 'Executing Slip...'
                  : orderAction === 'BUY'
                  ? 'Execute BUY Order'
                  : 'Execute SELL Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
