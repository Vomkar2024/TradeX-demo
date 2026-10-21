import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiTrendingUp, FiPieChart, FiDollarSign, FiLayers } from 'react-icons/fi';
import '../styles/Admin.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import MiniCandleChart from '../components/MiniCandleChart';
import { getMarketAssets, subscribeMarketUpdates } from '../utils/marketData';

const Admin = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assetFilter, setAssetFilter] = useState('all');

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

  // Compute Platform Surveillance KPIs
  const totalHoldingsValuation = allStocks.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const totalCirculatingShares = allStocks.reduce((sum, s) => sum + Number(s.count || 0), 0);

  const filteredTrending = trendingStocks.filter((stock) => {
    const symbol = (stock.symbol || '').toLowerCase();
    const name = (stock.shortName || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = symbol.includes(query) || name.includes(query);
    if (!matchesSearch) return false;

    if (assetFilter === 'equity') {
      return stock.type !== 'crypto';
    }
    if (assetFilter === 'crypto') {
      return stock.type === 'crypto';
    }
    return true;
  });

  return (
    <div className="admin-container">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="page-title mb-0">Admin Market Surveillance</h1>
            <span className="badge-live-stream">
              <span className="live-dot"></span> LIVE TICKER
            </span>
          </div>
          <p className="page-subtitle mb-0">
            Institutional overview of active capital, liquidity pools, and real-time market securities
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={() => {
            fetchTrending();
            fetchAllStocks();
          }}
          title="Refresh market surveillance feed"
        >
          <FiRefreshCw />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Surveillance KPI Analytics Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <FiTrendingUp />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Active Securities</span>
            <div className="admin-kpi-value">{trendingStocks.length}</div>
            <span className="admin-kpi-sub">Real-time asset streams</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Platform Equity Valuation</span>
            <div className="admin-kpi-value text-success">
              ₹{Number(totalHoldingsValuation).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="admin-kpi-sub">Total customer circulating equity</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiLayers />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Circulating Shares</span>
            <div className="admin-kpi-value text-white">
              {Number(totalCirculatingShares).toLocaleString('en-IN')}
            </div>
            <span className="admin-kpi-sub">Across {allStocks.length} portfolio positions</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiPieChart />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Held Securities</span>
            <div className="admin-kpi-value">{allStocks.length}</div>
            <span className="admin-kpi-sub">Unique platform positions</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="market-controls-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="category-tabs">
          <button
            type="button"
            className={`category-tab-btn ${assetFilter === 'all' ? 'active' : ''}`}
            onClick={() => setAssetFilter('all')}
          >
            All Securities ({trendingStocks.length})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${assetFilter === 'equity' ? 'active' : ''}`}
            onClick={() => setAssetFilter('equity')}
          >
            Equities & Bluechips
          </button>
          <button
            type="button"
            className={`category-tab-btn ${assetFilter === 'crypto' ? 'active' : ''}`}
            onClick={() => setAssetFilter('crypto')}
          >
            Crypto Assets
          </button>
        </div>

        <div className="search-container my-0" style={{ maxWidth: '340px' }}>
          <BiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search symbol or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="trending-stocks-header mb-3">
        <h3>Trending Market Securities</h3>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading securities surveillance feed...</div>
      ) : filteredTrending.length === 0 ? (
        <div className="p-5 text-center text-muted card rounded-4 border-0 mb-4">
          No securities matched your filter.
        </div>
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

      {/* Platform Equity Pool Table */}
      <div className="all-stocks-container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Platform Equity Pool ({allStocks.length} Holdings)</h3>
          <span className="badge bg-primary-subtle text-primary fw-bold">
            Total Valuation: ₹{Number(totalHoldingsValuation).toLocaleString('en-IN')}
          </span>
        </div>

        {allStocks.length === 0 ? (
          <div className="p-5 text-center text-muted card rounded-4 border-0">
            No stocks currently held by customers across the platform.
          </div>
        ) : (
          <div className="card shadow border-0 rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Security</th>
                    <th>Company Name</th>
                    <th>Total Shares Held</th>
                    <th>Aggregate Valuation</th>
                    <th>Trading Exchange</th>
                  </tr>
                </thead>
                <tbody>
                  {allStocks.map((s) => (
                    <tr key={s._id}>
                      <td className="fw-bold text-white fs-6">{s.symbol}</td>
                      <td className="text-secondary">{s.name}</td>
                      <td className="fw-semibold text-white">{Number(s.count).toLocaleString('en-IN')}</td>
                      <td className="fw-bold text-white font-monospace fs-6">
                        ₹{Number(s.totalPrice).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-light px-3 py-1">
                          {s.stockExchange || 'NSE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
