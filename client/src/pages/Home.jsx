import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import MiniCandleChart from '../components/MiniCandleChart';
import TickerTape from '../components/TickerTape';
import '../styles/Admin.css';

export const MARKET_AND_CRYPTO_ASSETS = [
  // 1st place
  {
    symbol: 'RELIANCE',
    shortName: 'Reliance Industries Ltd.',
    regularMarketOpen: 2945.50,
    regularMarketChangePercent: 1.42,
    category: 'Equity',
    exchange: 'NSE',
  },
  // 2nd place
  {
    symbol: 'TCS',
    shortName: 'Tata Consultancy Services',
    regularMarketOpen: 4120.00,
    regularMarketChangePercent: 0.88,
    category: 'Equity',
    exchange: 'NSE',
  },
  // 3rd place: USDT Crypto
  {
    symbol: 'USDT',
    shortName: 'Tether USD (USDT)',
    regularMarketOpen: 88.50,
    regularMarketChangePercent: 0.05,
    category: 'Crypto',
    exchange: 'Crypto',
  },
  // 4th place: HASMSTER Crypto
  {
    symbol: 'HASMSTER',
    shortName: 'Hamster Kombat (HMSTR)',
    regularMarketOpen: 0.28,
    regularMarketChangePercent: 8.45,
    category: 'Crypto',
    exchange: 'Crypto',
  },

  // Equities (NSE/BSE)
  {
    symbol: 'HDFCBANK',
    shortName: 'HDFC Bank Limited',
    regularMarketOpen: 1680.75,
    regularMarketChangePercent: -0.45,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'INFY',
    shortName: 'Infosys Limited',
    regularMarketOpen: 1875.30,
    regularMarketChangePercent: 2.15,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'TATAMOTORS',
    shortName: 'Tata Motors Ltd.',
    regularMarketOpen: 965.40,
    regularMarketChangePercent: 3.10,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'ICICIBANK',
    shortName: 'ICICI Bank Ltd.',
    regularMarketOpen: 1230.20,
    regularMarketChangePercent: 0.65,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'ITC',
    shortName: 'ITC Limited',
    regularMarketOpen: 492.15,
    regularMarketChangePercent: -0.32,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'ZOMATO',
    shortName: 'Zomato Limited',
    regularMarketOpen: 265.80,
    regularMarketChangePercent: 4.25,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'TATASTEEL',
    shortName: 'Tata Steel Limited',
    regularMarketOpen: 158.40,
    regularMarketChangePercent: -1.15,
    category: 'Equity',
    exchange: 'NSE',
  },
  {
    symbol: 'IRFC',
    shortName: 'IRFC Railway Finance Corp',
    regularMarketOpen: 172.50,
    regularMarketChangePercent: 1.80,
    category: 'Equity',
    exchange: 'NSE',
  },

  // Major Cryptocurrencies
  {
    symbol: 'BTC',
    shortName: 'Bitcoin (INR)',
    regularMarketOpen: 5850000.00,
    regularMarketChangePercent: 2.35,
    category: 'Crypto',
    exchange: 'Crypto',
  },
  {
    symbol: 'ETH',
    shortName: 'Ethereum (INR)',
    regularMarketOpen: 225000.00,
    regularMarketChangePercent: 1.80,
    category: 'Crypto',
    exchange: 'Crypto',
  },
  {
    symbol: 'SOL',
    shortName: 'Solana (INR)',
    regularMarketOpen: 13450.00,
    regularMarketChangePercent: 5.60,
    category: 'Crypto',
    exchange: 'Crypto',
  },
  {
    symbol: 'DOGE',
    shortName: 'Dogecoin (INR)',
    regularMarketOpen: 12.50,
    regularMarketChangePercent: 6.40,
    category: 'Crypto',
    exchange: 'Crypto',
  },
  {
    symbol: 'XRP',
    shortName: 'Ripple (INR)',
    regularMarketOpen: 48.20,
    regularMarketChangePercent: -0.90,
    category: 'Crypto',
    exchange: 'Crypto',
  },
];

const Home = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'equity' | 'crypto'
  const navigate = useNavigate();

  useEffect(() => {
    // Load high-fidelity equities and cryptocurrencies
    setTrendingStocks(MARKET_AND_CRYPTO_ASSETS);
    setLoading(false);
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
          <div className="badge-live-stream mb-2">
            <span className="live-dot"></span> Real-Time Equity & Crypto Feed
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
