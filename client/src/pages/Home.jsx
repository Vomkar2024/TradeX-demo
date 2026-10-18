import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import MiniCandleChart from '../components/MiniCandleChart';
import TickerTape from '../components/TickerTape';
import {
  getMarketAssets,
  subscribeMarketUpdates,
  saveMarketAssets,
  DEFAULT_MARKET_ASSETS,
} from '../utils/marketData';
import '../styles/Admin.css';

export const MARKET_AND_CRYPTO_ASSETS = DEFAULT_MARKET_ASSETS;

const Home = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'equity' | 'crypto'
  const navigate = useNavigate();

  useEffect(() => {
    // Load high-fidelity equities and cryptocurrencies
    setTrendingStocks(getMarketAssets());
    setLoading(false);

    // Subscribe to synchronized price updates
    const unsubscribe = subscribeMarketUpdates((updated) => {
      setTrendingStocks(updated);
    });

    // Gentle live market ticker simulation (micro-fluctuations strictly under ₹5,000)
    const tickInterval = setInterval(() => {
      setTrendingStocks((prev) => {
        if (!prev || prev.length === 0) return prev;
        const copy = [...prev];
        const randomIdx = Math.floor(Math.random() * copy.length);
        const target = copy[randomIdx];
        if (!target) return prev;

        // Micro-jitter: -0.15% to +0.20%
        const jitter = (Math.random() * 0.35 - 0.15) / 100;
        let newPrice = Number((target.basePrice * (1 + jitter)).toFixed(2));
        if (newPrice > 4950) newPrice = 4950;
        if (newPrice < 1) newPrice = 1;

        const newChangePct = Number((target.regularMarketChangePercent + (jitter * 100)).toFixed(2));
        copy[randomIdx] = {
          ...target,
          basePrice: newPrice,
          regularMarketOpen: newPrice,
          regularMarketChangePercent: newChangePct,
        };
        saveMarketAssets(copy);
        return copy;
      });
    }, 4500);

    return () => {
      unsubscribe();
      clearInterval(tickInterval);
    };
  }, []);

  const filteredStocks = trendingStocks.filter((stock) => {
    const symbol = stock.symbol || '';
    const name = stock.shortName || '';
    const matchesSearch =
      symbol.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'equity' && stock.category === 'Equity') ||
      (activeCategory === 'crypto' && stock.category === 'Crypto');

    return matchesSearch && matchesCategory;
  });

  const equityCount = trendingStocks.filter((s) => s.category === 'Equity').length;
  const cryptoCount = trendingStocks.filter((s) => s.category === 'Crypto').length;

  return (
    <div className="home-page-wrapper">
      {/* Real-Time Scrolling Ticker Marquee */}
      <TickerTape />

      <div className="admin-container">
        <div className="text-center my-4">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2 flex-wrap">
            <div className="badge-live-stream">
              <span className="live-dot"></span> Real-Time Equity & Crypto Feed
            </div>
          </div>
          <h1 className="fw-bold page-headline">Markets & Digital Assets</h1>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <BiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search equities & crypto (e.g. RELIANCE, TCS, BTC, ZOMATO)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="market-controls-bar">
          <div className="category-tabs">
            <button
              type="button"
              className={`category-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <span>🌐 All Assets</span>
              <span className="badge bg-secondary-subtle text-secondary small">{trendingStocks.length}</span>
            </button>
            <button
              type="button"
              className={`category-tab-btn ${activeCategory === 'equity' ? 'active' : ''}`}
              onClick={() => setActiveCategory('equity')}
            >
              <span>📈 Equities</span>
              <span className="badge bg-secondary-subtle text-secondary small">{equityCount}</span>
            </button>
            <button
              type="button"
              className={`category-tab-btn ${activeCategory === 'crypto' ? 'active' : ''}`}
              onClick={() => setActiveCategory('crypto')}
            >
              <span>⚡ Cryptocurrencies</span>
              <span className="badge bg-secondary-subtle text-secondary small">{cryptoCount}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading real-time market data...</div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No securities matching "{search}".</p>
          </div>
        ) : (
          <div className="trending-stocks-grid">
            {filteredStocks.map((stock, index) => {
              const isPositive = (stock.regularMarketChangePercent || 0) >= 0;
              const price = stock.regularMarketOpen || stock.regularMarketPrice || 100;
              const change = stock.regularMarketChangePercent || 0;

              return (
                <div
                  className="trending-stock-card"
                  key={stock.symbol + '-' + index}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  title={`Open ${stock.symbol} live trading desk`}
                >
                  <div className="stock-card-top">
                    <div>
                      <div className="d-flex align-items-center">
                        <h4 className="stock-card-symbol mb-0">{stock.symbol}</h4>
                        <span
                          className={`asset-badge-tag ${
                            stock.category === 'Crypto' ? 'crypto' : 'equity'
                          }`}
                        >
                          {stock.category}
                        </span>
                      </div>
                      <p className="stock-card-name">{stock.shortName || stock.symbol}</p>
                    </div>
                    <div className="text-end">
                      <div className="stock-card-price">
                        ₹
                        {Number(price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className={`stock-card-pill ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '▲ +' : '▼ '}
                        {Number(change).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Micro Chart Component (Defaults to Line mode) */}
                  <div className="stock-card-chart-area">
                    <MiniCandleChart
                      symbol={stock.symbol}
                      price={price}
                      change={change}
                      width={240}
                      height={44}
                      type="line"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
