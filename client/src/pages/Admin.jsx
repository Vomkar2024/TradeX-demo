import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import '../styles/Admin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';

const DEFAULT_ADMIN_STOCKS = [
  { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketOpen: 232.50, regularMarketChangePercent: 1.25 },
  { symbol: 'TSLA', shortName: 'Tesla, Inc.', regularMarketOpen: 218.80, regularMarketChangePercent: -0.85 },
  { symbol: 'NVDA', shortName: 'NVIDIA Corporation', regularMarketOpen: 135.20, regularMarketChangePercent: 3.40 },
  { symbol: 'MSFT', shortName: 'Microsoft Corporation', regularMarketOpen: 418.10, regularMarketChangePercent: 0.65 },
  { symbol: 'AMZN', shortName: 'Amazon.com, Inc.', regularMarketOpen: 186.40, regularMarketChangePercent: 1.10 },
  { symbol: 'GOOGL', shortName: 'Alphabet Inc.', regularMarketOpen: 164.75, regularMarketChangePercent: -0.45 },
];

const Admin = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
    fetchAllStocks();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await axios.request(optionsTrending);
      if (res.data && Array.isArray(res.data.body)) {
        setTrendingStocks(res.data.body);
      } else if (Array.isArray(res.data)) {
        setTrendingStocks(res.data);
      } else {
        setTrendingStocks(DEFAULT_ADMIN_STOCKS);
      }
    } catch (err) {
      console.log('Using default stock feed:', err.message);
      setTrendingStocks(DEFAULT_ADMIN_STOCKS);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStocks = async () => {
    try {
      const res = await axiosInstance.get('/fetch-stocks');
      setAllStocks(res.data || []);
    } catch (err) {
      console.error('Fetch platform stocks error:', err);
    }
  };

  const filteredTrending = trendingStocks.filter((stock) => {
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
        <h1 className="fw-bold">Admin Market Surveillance</h1>
        <p className="text-muted">Monitor high-frequency trading assets and circulating platform equity</p>
      </div>

      <div className="search-container">
        <BiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search trending stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="trending-stocks-header">
        <h3>Trending Market Securities</h3>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading securities data...</div>
      ) : (
        <div className="trending-stocks-grid">
          {filteredTrending.map((stock, index) => {
            const price = stock.regularMarketOpen || stock.regularMarketPrice || 100;
            const change = stock.regularMarketChangePercent || 0;
            const isPositive = change > 0;

            return (
              <div
                className="trending-stock"
                key={stock.symbol + ' ' + index}
                onClick={() => navigate(`/admin-stock/${stock.symbol}`)}
              >
                <span>
                  <h5>Stock name</h5>
                  <p>{stock.shortName || stock.symbol}</p>
                </span>
                <span>
                  <h5>Symbol</h5>
                  <p>{stock.symbol}</p>
                </span>
                <span>
                  <h5>Price</h5>
                  <p style={{ color: isPositive ? 'green' : 'red' }}>
                    ${Number(price).toFixed(2)} ({isPositive ? '+' : ''}{Number(change).toFixed(2)}%)
                  </p>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="all-stocks-container">
        <h3>Platform Equity Pool ({allStocks.length} holdings)</h3>
        {allStocks.length === 0 ? (
          <p className="text-muted">No stocks currently held by customers across the platform.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Total Shares Held</th>
                  <th>Valuation</th>
                  <th>Exchange</th>
                </tr>
              </thead>
              <tbody>
                {allStocks.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-bold">{s.symbol}</td>
                    <td>{s.name}</td>
                    <td>{s.count}</td>
                    <td className="fw-bold">${Number(s.totalPrice).toLocaleString()}</td>
                    <td>{s.stockExchange || 'NASDAQ'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
