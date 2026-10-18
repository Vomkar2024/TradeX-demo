import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Admin.css';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketOpen: 232.50, regularMarketChangePercent: 1.25 },
  { symbol: 'TSLA', shortName: 'Tesla, Inc.', regularMarketOpen: 218.80, regularMarketChangePercent: -0.85 },
  { symbol: 'NVDA', shortName: 'NVIDIA Corporation', regularMarketOpen: 135.20, regularMarketChangePercent: 3.40 },
  { symbol: 'MSFT', shortName: 'Microsoft Corporation', regularMarketOpen: 418.10, regularMarketChangePercent: 0.65 },
  { symbol: 'AMZN', shortName: 'Amazon.com, Inc.', regularMarketOpen: 186.40, regularMarketChangePercent: 1.10 },
  { symbol: 'GOOGL', shortName: 'Alphabet Inc.', regularMarketOpen: 164.75, regularMarketChangePercent: -0.45 },
  { symbol: 'META', shortName: 'Meta Platforms, Inc.', regularMarketOpen: 576.30, regularMarketChangePercent: 2.15 },
  { symbol: 'AMD', shortName: 'Advanced Micro Devices', regularMarketOpen: 156.90, regularMarketChangePercent: -1.20 },
];

const Home = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const optionsTrending = {
    method: 'GET',
    url: 'https://mboum-finance.p.rapidapi.com/co/collections/most_actives',
    params: { start: '0' },
    headers: {
      'X-RapidAPI-Key': '947b801f92msh96b919932628932p1a1413jsncb9cc7188719',
      'X-RapidAPI-Host': 'mboum-finance.p.rapidapi.com',
    },
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await axios.request(optionsTrending);
      if (res.data && Array.isArray(res.data.body)) {
        setTrendingStocks(res.data.body);
      } else if (Array.isArray(res.data)) {
        setTrendingStocks(res.data);
      } else {
        setTrendingStocks(DEFAULT_STOCKS);
      }
    } catch (err) {
      console.log('Using default stock quotes:', err.message);
      setTrendingStocks(DEFAULT_STOCKS);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = trendingStocks.filter((stock) => {
    const symbol = stock.symbol || '';
    const name = stock.shortName || '';
    return (
      symbol.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="admin-container">
      <div className="text-center my-4">
        <h1 className="fw-bold text-dark">Markets & Trending Stocks</h1>
        <p className="text-muted">Explore active market assets and place immediate buy or sell orders</p>
      </div>

      <div className="search-container">
        <BiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by symbol or company name (e.g. AAPL, Tesla)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="trending-stocks-header">
        <h3>Most Active Assets</h3>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading real-time market data...</div>
      ) : (
        <div className="trending-stocks-grid">
          {filteredStocks.map((stock, index) => {
            const isPositive = (stock.regularMarketChangePercent || 0) >= 0;
            const price = stock.regularMarketOpen || stock.regularMarketPrice || 100;
            const change = stock.regularMarketChangePercent || 0;

            return (
              <div
                className="trending-stock"
                key={stock.symbol + '-' + index}
                onClick={() => navigate(`/stock/${stock.symbol}`)}
              >
                <span>
                  <h5>Stock name</h5>
                  <p>{stock.shortName || stock.symbol}</p>
                </span>
                <span>
                  <h5>Symbol</h5>
                  <p className="badge bg-light text-dark border">{stock.symbol}</p>
                </span>
                <span>
                  <h5>Price</h5>
                  <p style={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
                    ${Number(price).toFixed(2)} ({isPositive ? '+' : ''}{Number(change).toFixed(2)}%)
                  </p>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
