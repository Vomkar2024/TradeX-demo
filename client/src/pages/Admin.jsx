import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import '../styles/Admin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import MiniCandleChart from '../components/MiniCandleChart';
import { getMarketAssets, subscribeMarketUpdates } from '../utils/marketData';

const Admin = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrending();
    fetchAllStocks();

    const unsubscribe = subscribeMarketUpdates((updated) => {
      setTrendingStocks(updated);
    });
    return () => unsubscribe();
  }, []);

  const fetchTrending = async () => {
    setTrendingStocks(getMarketAssets());
    setLoading(false);
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
            const isPositive = change >= 0;

            return (
              <div
                className="trending-stock-card"
                key={stock.symbol + ' ' + index}
                onClick={() => navigate(`/admin-stock/${stock.symbol}`)}
                title={`Open surveillance view for ${stock.symbol}`}
              >
                <div className="stock-card-top">
                  <div>
                    <h4 className="stock-card-symbol">{stock.symbol}</h4>
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

                <div className="stock-card-chart-area">
                  <MiniCandleChart
                    symbol={stock.symbol}
                    price={price}
                    change={change}
                    width={240}
                    height={40}
                    type="line"
                  />
                </div>

                <div className="stock-card-footer">
                  <span className="stock-open-desk-hint">Surveillance Analytics →</span>
                </div>
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
                    <td className="fw-bold">₹{Number(s.totalPrice).toLocaleString('en-IN')}</td>
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
