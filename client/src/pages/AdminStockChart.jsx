import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import { getAssetBySymbol, subscribeMarketUpdates } from '../utils/marketData';
import { fetchUserRegistry, resolveUserIdentity } from '../utils/userLookup';
import { FiTrendingUp, FiDollarSign, FiUsers, FiActivity, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import '../styles/Admin.css';

const TIMEFRAMES = ['1D', '1W', '1M', '1Y', 'ALL'];

const AdminStockChart = () => {
  const { id: paramSymbol } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const upperSym = (paramSymbol || 'RELIANCE').toUpperCase();
  const [asset, setAsset] = useState(() => getAssetBySymbol(upperSym));
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [chartMode, setChartMode] = useState('internal'); // 'internal' | 'tradingview'
  const [chartType, setChartType] = useState('Candles'); // 'Candles' | 'Line'
  const [timeframe, setTimeframe] = useState('1M');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isCrypto = (asset.category || '').toLowerCase() === 'crypto' || asset.exchange === 'Crypto';

  useEffect(() => {
    setAsset(getAssetBySymbol(upperSym));
    fetchStockData();

    const unsubscribe = subscribeMarketUpdates(() => {
      setAsset(getAssetBySymbol(upperSym));
    });
    return () => unsubscribe();
  }, [upperSym]);

  const fetchStockData = async () => {
    try {
      const [stocksRes, ordersRes, usersReg] = await Promise.all([
        axiosInstance.get('/fetch-stocks').catch(() => ({ data: [] })),
        axiosInstance.get('/fetch-orders').catch(() => ({ data: [] })),
        fetchUserRegistry(axiosInstance),
      ]);

      const symHoldings = (stocksRes.data || []).filter(
        (s) => (s.symbol || '').toUpperCase() === upperSym
      );
      const symOrders = (ordersRes.data || []).filter(
        (o) => (o.symbol || '').toUpperCase() === upperSym
      ).reverse();

      setHoldings(symHoldings);
      setOrders(symOrders);
      setUserMap(usersReg || {});
    } catch (err) {
      console.error('Failed to fetch stock admin data:', err);
    }
  };

  // Embed TradingView script when switching to tradingview mode
  useEffect(() => {
    if (chartMode !== 'tradingview' || !containerRef.current) return;
    containerRef.current.innerHTML = '';

    const tvSymbol = isCrypto ? `BINANCE:${upperSym}USDT` : `BSE:${upperSym}`;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
  }, [chartMode, upperSym, isCrypto]);

  // Metrics for this asset
  const totalSharesHeld = holdings.reduce((sum, s) => sum + Number(s.count || 0), 0);
  const totalValuation = holdings.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const uniqueHolders = new Set(holdings.map((s) => s.user)).size;
  const buyOrders = orders.filter((o) => (o.orderType || '').toLowerCase() === 'buy');
  const sellOrders = orders.filter((o) => (o.orderType || '').toLowerCase() === 'sell');

  // Generate chart points for internal chart
  const chartPoints = useMemo(() => {
    const count = chartType === 'Candles' ? 26 : 34;
    const base = Number(asset.basePrice || asset.regularMarketOpen || 100);
    let seed = upperSym.split('').reduce((acc, c) => acc + c.charCodeAt(0), 100);
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const isUp = (asset.changePct || asset.regularMarketChangePercent || 0) >= 0;
    const startPrice = isUp ? base * 0.9 : base * 1.1;
    const step = (base - startPrice) / (count - 1);

    const points = [];
    let current = startPrice;

    for (let i = 0; i < count; i++) {
      const noise = (pseudoRandom() - 0.49) * (base * 0.04);
      const close = i === count - 1 ? base : Math.max(base * 0.1, current + step + noise);
      const open = i === 0 ? startPrice : points[i - 1]?.close || current;
      const high = Math.max(open, close) + pseudoRandom() * (base * 0.015);
      const low = Math.min(open, close) - pseudoRandom() * (base * 0.015);

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
  }, [upperSym, asset.basePrice, asset.regularMarketOpen, asset.changePct, chartType, timeframe]);

  // Chart bounds & geometry
  const yValues = chartPoints.flatMap((p) => [p.low, p.high]);
  const minPrice = Math.min(...yValues) * 0.98;
  const maxPrice = Math.max(...yValues) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  const svgWidth = 840;
  const svgHeight = 360;
  const padLeft = 20;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (idx) => padLeft + (idx / (chartPoints.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minPrice) / priceRange) * chartH;

  const currentPrice = Number(asset.basePrice || asset.regularMarketOpen || 100);
  const changePct = Number(asset.changePct || asset.regularMarketChangePercent || 0);
  const isPositive = changePct >= 0;

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-outline-light btn-sm mb-3 d-flex align-items-center gap-2"
            onClick={() => navigate('/admin')}
          >
            ← Back to Admin Console
          </button>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h1 className="page-title mb-0">{upperSym} Details</h1>
            <span className={`asset-badge-tag ${isCrypto ? 'crypto' : 'equity'}`}>
              {isCrypto ? 'CRYPTO (BINANCE)' : 'STOCK (NSE/BSE)'}
            </span>
            <span className="badge-live-stream">
              <span className="live-dot"></span> LIVE
            </span>
          </div>
          <p className="page-subtitle mb-0 mt-1">
            Performance and holdings overview for {asset.shortName || asset.name || upperSym} ({asset.exchange || 'NSE'})
          </p>
        </div>

        <div className="text-end">
          <div className="fs-3 fw-bold text-white font-monospace">
            ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`stock-card-pill ${isPositive ? 'positive' : 'negative'} mt-1`}>
            {isPositive ? '▲ +' : '▼ '}
            {changePct.toFixed(2)}% (₹{(asset.change || (currentPrice * changePct) / 100).toFixed(2)})
          </div>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiTrendingUp />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Shares Held</span>
            <div className="admin-kpi-value">{Number(totalSharesHeld).toLocaleString('en-IN')}</div>
            <span className="admin-kpi-sub">Total units held by users</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Holding Value</span>
            <div className="admin-kpi-value text-success">
              ₹{Number(totalValuation).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="admin-kpi-sub">Combined user portfolio value</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiUsers />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Holders</span>
            <div className="admin-kpi-value text-white">{uniqueHolders}</div>
            <span className="admin-kpi-sub">Unique users holding this stock</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiActivity />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Orders</span>
            <div className="admin-kpi-value">{orders.length}</div>
            <span className="admin-kpi-sub">
              {buyOrders.length} Buys / {sellOrders.length} Sells
            </span>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="admin-filter-tabs">
              <button
                type="button"
                className={`admin-filter-btn ${chartMode === 'internal' ? 'active' : ''}`}
                onClick={() => setChartMode('internal')}
              >
                Interactive Chart
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${chartMode === 'tradingview' ? 'active' : ''}`}
                onClick={() => setChartMode('tradingview')}
              >
                TradingView Chart
              </button>
            </div>

            {chartMode === 'internal' && (
              <div className="admin-filter-tabs">
                <button
                  type="button"
                  className={`admin-filter-btn ${chartType === 'Candles' ? 'active' : ''}`}
                  onClick={() => setChartType('Candles')}
                >
                  Candles
                </button>
                <button
                  type="button"
                  className={`admin-filter-btn ${chartType === 'Line' ? 'active' : ''}`}
                  onClick={() => setChartType('Line')}
                >
                  Line
                </button>
              </div>
            )}
          </div>

          {chartMode === 'internal' && (
            <div className="admin-filter-tabs">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`admin-filter-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4" style={{ minHeight: '440px', background: '#0b0f19' }}>
          {chartMode === 'tradingview' ? (
            <div className="tradingview-widget-container h-100 w-100" style={{ height: '520px' }} ref={containerRef}>
              <div className="tradingview-widget-container__widget h-100 w-100"></div>
            </div>
          ) : (
            <div className="position-relative w-100">
              {hoveredPoint && (
                <div
                  className="position-absolute badge bg-dark text-white border border-secondary px-3 py-2"
                  style={{ top: '10px', left: '20px', zIndex: 10 }}
                >
                  Tick #{hoveredPoint.index + 1} | O: ₹{hoveredPoint.open.toFixed(2)} | H: ₹
                  {hoveredPoint.high.toFixed(2)} | L: ₹{hoveredPoint.low.toFixed(2)} | C: ₹
                  {hoveredPoint.close.toFixed(2)}
                </div>
              )}

              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-100"
                style={{ height: '420px', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 1, 2, 3].map((step) => {
                  const y = padTop + (step / 3) * chartH;
                  const val = maxPrice - (step / 3) * priceRange;
                  return (
                    <g key={step}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgWidth - padRight + 6}
                        y={y + 4}
                        fill="#64748b"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        ₹{val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Line or Candlesticks */}
                {chartType === 'Line' ? (
                  <>
                    <path
                      d={`M ${getX(0)} ${getY(chartPoints[0].close)} ${chartPoints
                        .slice(1)
                        .map((p, i) => `L ${getX(i + 1)} ${getY(p.close)}`)
                        .join(' ')} L ${getX(chartPoints.length - 1)} ${padTop + chartH} L ${getX(
                        0
                      )} ${padTop + chartH} Z`}
                      fill="url(#adminChartGrad)"
                    />
                    <path
                      d={`M ${getX(0)} ${getY(chartPoints[0].close)} ${chartPoints
                        .slice(1)
                        .map((p, i) => `L ${getX(i + 1)} ${getY(p.close)}`)
                        .join(' ')}`}
                      fill="none"
                      stroke={isPositive ? '#10b981' : '#f43f5e'}
                      strokeWidth="2.5"
                    />
                  </>
                ) : (
                  chartPoints.map((p, i) => {
                    const x = getX(i);
                    const yOpen = getY(p.open);
                    const yClose = getY(p.close);
                    const yHigh = getY(p.high);
                    const yLow = getY(p.low);
                    const isGreen = p.close >= p.open;
                    const candleColor = isGreen ? '#10b981' : '#f43f5e';
                    const candleTop = Math.min(yOpen, yClose);
                    const candleHeight = Math.max(Math.abs(yClose - yOpen), 2);
                    const candleWidth = Math.max(chartW / (chartPoints.length * 1.6), 6);

                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth="1.5" />
                        <rect
                          x={x - candleWidth / 2}
                          y={candleTop}
                          width={candleWidth}
                          height={candleHeight}
                          fill={candleColor}
                          rx="1"
                        />
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
        <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fs-6 fw-bold text-white">Order History: {upperSym}</h4>
          <span className="badge bg-secondary-subtle text-light">{orders.length} Orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-4 text-center text-muted">
            No orders recorded yet for {upperSym}.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Value</th>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const isBuy = (o.orderType || '').toLowerCase() === 'buy';
                  const trader = resolveUserIdentity(o.user, userMap);

                  return (
                    <tr key={o._id}>
                      <td>
                        <span
                          className="badge fw-bold"
                          style={{
                            backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: isBuy ? '#34d399' : '#fb7185',
                            border: `1px solid ${
                              isBuy ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'
                            }`,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                          }}
                        >
                          {isBuy ? 'Buy' : 'Sell'}
                        </span>
                      </td>

                      <td className="fw-semibold text-white">{Number(o.count).toLocaleString('en-IN')} Units</td>

                      <td className="font-monospace">
                        ₹{Number(o.price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="fw-bold text-white font-monospace">
                        ₹{Number(o.totalPrice).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <div className="chip-user">
                          <div className="chip-avatar">{trader.initial}</div>
                          <div>
                            <div className="fw-semibold text-white small">{trader.username}</div>
                            {trader.email && (
                              <span className="text-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                                {trader.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="text-secondary small font-monospace">
                        {o.date
                          ? new Date(o.date).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Settled'}
                      </td>

                      <td>
                        <span className="badge-status-settled">● Completed</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStockChart;
