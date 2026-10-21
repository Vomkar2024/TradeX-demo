import React, { useEffect, useState, useMemo } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FiRefreshCw, FiTrendingUp, FiPieChart, FiDollarSign, FiLayers, FiEye } from 'react-icons/fi';
import '../styles/Admin.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import MiniCandleChart from '../components/MiniCandleChart';
import { getMarketAssets, subscribeMarketUpdates, saveMarketAssets } from '../utils/marketData';
import { fetchUserRegistry, resolveUserIdentity } from '../utils/userLookup';

const Admin = () => {
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [search, setSearch] = useState('');
  const [poolSearch, setPoolSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assetFilter, setAssetFilter] = useState('all'); // 'all' | 'equity' | 'crypto'
  const [poolViewMode, setPoolViewMode] = useState('consolidated'); // 'consolidated' | 'detailed'

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrending();
    fetchAllStocks();
    loadUsers();

    const unsubscribe = subscribeMarketUpdates((updated) => {
      setTrendingStocks(updated);
    });

    // Periodic price fluctuation simulation
    const tickInterval = setInterval(() => {
      setTrendingStocks((prev) => {
        if (!prev || prev.length === 0) return prev;
        const copy = [...prev];
        const randomIdx = Math.floor(Math.random() * copy.length);
        const target = copy[randomIdx];
        if (!target) return prev;

        const jitter = (Math.random() * 0.35 - 0.15) / 100;
        let newPrice = Number((target.basePrice * (1 + jitter)).toFixed(2));
        if (newPrice > 4950) newPrice = 4950;
        if (newPrice < 1) newPrice = 1;

        const newChangePct = Number(((target.regularMarketChangePercent || 0) + jitter * 100).toFixed(2));
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

  const fetchTrending = async () => {
    setTrendingStocks(getMarketAssets());
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const reg = await fetchUserRegistry(axiosInstance);
      setUserMap(reg);
    } catch (e) {
      console.warn('Failed loading user registry:', e);
    }
  };

  const fetchAllStocks = async () => {
    try {
      const res = await axiosInstance.get('/fetch-stocks');
      setAllStocks(res.data || []);
    } catch (err) {
      console.error('Fetch stocks error:', err);
    }
  };

  const totalHoldingsValuation = allStocks.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const totalCirculatingShares = allStocks.reduce((sum, s) => sum + Number(s.count || 0), 0);

  const filteredTrending = trendingStocks.filter((stock) => {
    const symbol = (stock.symbol || '').toLowerCase();
    const name = (stock.shortName || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = symbol.includes(query) || name.includes(query);
    if (!matchesSearch) return false;

    const isCrypto = (stock.category || '').toLowerCase() === 'crypto' || stock.exchange === 'Crypto';
    if (assetFilter === 'equity') {
      return !isCrypto;
    }
    if (assetFilter === 'crypto') {
      return isCrypto;
    }
    return true;
  });

  const equityCount = trendingStocks.filter(
    (s) => (s.category || '').toLowerCase() !== 'crypto' && s.exchange !== 'Crypto'
  ).length;
  const cryptoCount = trendingStocks.filter(
    (s) => (s.category || '').toLowerCase() === 'crypto' || s.exchange === 'Crypto'
  ).length;

  // Aggregate holdings across the entire platform by symbol
  const consolidatedPool = useMemo(() => {
    const map = {};
    allStocks.forEach((s) => {
      const sym = (s.symbol || '').toUpperCase();
      if (!map[sym]) {
        map[sym] = {
          symbol: sym,
          name: s.name || sym,
          totalShares: 0,
          totalValuation: 0,
          exchange: s.stockExchange || 'NSE',
          holders: new Set(),
        };
      }
      map[sym].totalShares += Number(s.count || 0);
      map[sym].totalValuation += Number(s.totalPrice || 0);
      if (s.user) {
        map[sym].holders.add(s.user);
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        accountsCount: item.holders.size,
        avgPrice: item.totalShares > 0 ? item.totalValuation / item.totalShares : 0,
      }))
      .sort((a, b) => b.totalValuation - a.totalValuation);
  }, [allStocks]);

  // Filtered lists for the equity pool table
  const filteredConsolidated = consolidatedPool.filter((item) => {
    const q = poolSearch.toLowerCase();
    return item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });

  const filteredDetailed = allStocks.filter((s) => {
    const q = poolSearch.toLowerCase();
    const sym = (s.symbol || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    const userInfo = resolveUserIdentity(s.user, userMap);
    const uName = userInfo.username.toLowerCase();
    const uEmail = userInfo.email.toLowerCase();
    return sym.includes(q) || name.includes(q) || uName.includes(q) || uEmail.includes(q);
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
            loadUsers();
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
            <span className="admin-kpi-label">Active Assets</span>
            <div className="admin-kpi-value">{trendingStocks.length}</div>
            <span className="admin-kpi-sub">Market assets available</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon green">
            <FiDollarSign />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Holdings Value</span>
            <div className="admin-kpi-value text-success">
              ₹{Number(totalHoldingsValuation).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="admin-kpi-sub">Total across user portfolios</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon rose">
            <FiLayers />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Total Shares</span>
            <div className="admin-kpi-value text-white">
              {Number(totalCirculatingShares).toLocaleString('en-IN')}
            </div>
            <span className="admin-kpi-sub">Across {allStocks.length} holdings</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon purple">
            <FiPieChart />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-label">Unique Assets Held</span>
            <div className="admin-kpi-value">{consolidatedPool.length}</div>
            <span className="admin-kpi-sub">Positions in user accounts</span>
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
            All Assets ({trendingStocks.length})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${assetFilter === 'equity' ? 'active' : ''}`}
            onClick={() => setAssetFilter('equity')}
          >
            Equities ({equityCount})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${assetFilter === 'crypto' ? 'active' : ''}`}
            onClick={() => setAssetFilter('crypto')}
          >
            Crypto ({cryptoCount})
          </button>
        </div>

        <div className="search-container my-0 ms-auto" style={{ maxWidth: '340px' }}>
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
        <h3>Market Overview</h3>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading market data...</div>
      ) : filteredTrending.length === 0 ? (
        <div className="p-5 text-center text-muted card rounded-4 border-0 mb-4">
          No assets matched your filter.
        </div>
      ) : (
        <div className="trending-stocks-grid">
          {filteredTrending.map((stock, index) => {
            const price = stock.regularMarketOpen || stock.basePrice || 100;
            const change = stock.regularMarketChangePercent || 0;
            const isPositive = change >= 0;

            return (
              <div
                className="trending-stock-card"
                key={stock.symbol + ' ' + index}
                onClick={() => navigate(`/admin-stock/${stock.symbol}`)}
                title={`View ${stock.symbol}`}
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
                  <span className="stock-open-desk-hint">View Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="all-stocks-container mb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div>
            <h3 className="mb-1">
              Platform Holdings ({poolViewMode === 'consolidated' ? consolidatedPool.length : allStocks.length}{' '}
              {poolViewMode === 'consolidated' ? 'Assets' : 'Holdings'})
            </h3>
            <p className="text-secondary small mb-0">
              {poolViewMode === 'consolidated'
                ? 'Summary of total shares and holdings across unique assets'
                : 'Breakdown of asset positions by trader'}
            </p>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="admin-filter-tabs">
              <button
                type="button"
                className={`admin-filter-btn ${poolViewMode === 'consolidated' ? 'active' : ''}`}
                onClick={() => setPoolViewMode('consolidated')}
                title="Consolidated view by asset"
              >
                📊 Consolidated
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${poolViewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setPoolViewMode('detailed')}
                title="View individual trader holdings"
              >
                👤 By Trader
              </button>
            </div>

            <span
              className="badge px-3 py-2 fw-bold"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}
            >
              Total Holdings Value: ₹
              {Number(totalHoldingsValuation).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="card shadow border-0 rounded-4 overflow-hidden">
          <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <span className="text-secondary small fw-medium">
              {poolViewMode === 'consolidated'
                ? `Showing ${filteredConsolidated.length} unique assets held`
                : `Showing ${filteredDetailed.length} user positions`}
            </span>

            <div className="position-relative ms-auto" style={{ minWidth: '260px', maxWidth: '340px' }}>
              <BiSearch
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '1rem',
                }}
              />
              <input
                type="text"
                className="form-control form-control-sm"
                style={{
                  paddingLeft: '2.4rem',
                  backgroundColor: '#111726',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: '0.55rem',
                }}
                placeholder="Filter holdings..."
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
              />
            </div>
          </div>

          {allStocks.length === 0 ? (
            <div className="p-5 text-center text-muted">
              No assets currently held across the platform.
            </div>
          ) : poolViewMode === 'consolidated' ? (
            /* CONSOLIDATED POOL TABLE */
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Total Shares</th>
                    <th>Total Value</th>
                    <th>Holders</th>
                    <th>Avg Price</th>
                    <th>Exchange</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsolidated.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-muted">
                        No assets match "{poolSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredConsolidated.map((item) => (
                      <tr key={item.symbol}>
                        <td className="fw-bold text-white fs-6">
                          <span
                            className="text-primary text-decoration-none cursor-pointer"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/admin-stock/${item.symbol}`)}
                            title={`View ${item.symbol}`}
                          >
                            {item.symbol}
                          </span>
                        </td>
                        <td className="text-secondary">{item.name}</td>
                        <td className="fw-semibold text-white">
                          {Number(item.totalShares).toLocaleString('en-IN')} Units
                        </td>
                        <td className="fw-bold text-white font-monospace fs-6">
                          ₹
                          {Number(item.totalValuation).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-light px-2 py-1">
                            👥 {item.accountsCount} {item.accountsCount === 1 ? 'Account' : 'Accounts'}
                          </span>
                        </td>
                        <td className="font-monospace text-secondary">
                          ₹
                          {Number(item.avgPrice).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-light px-3 py-1">
                            {item.exchange || 'NSE'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2"
                            onClick={() => navigate(`/admin-stock/${item.symbol}`)}
                            title={`View ${item.symbol}`}
                          >
                            <FiEye />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Trader</th>
                    <th>Shares Held</th>
                    <th>Avg Price</th>
                    <th>Total Value</th>
                    <th>Exchange</th>
                    <th>Holding ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetailed.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-muted">
                        No trader positions match "{poolSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredDetailed.map((s) => {
                      const user = resolveUserIdentity(s.user, userMap);
                      return (
                        <tr key={s._id}>
                          <td className="fw-bold text-white fs-6">
                            <span
                              style={{ cursor: 'pointer', color: '#818cf8' }}
                              onClick={() => navigate(`/admin-stock/${s.symbol}`)}
                              title={`Inspect ${s.symbol}`}
                            >
                              {s.symbol}
                            </span>
                            <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                              {s.name}
                            </div>
                          </td>

                          <td>
                            <div className="chip-user">
                              <div className="chip-avatar">{user.initial}</div>
                              <div>
                                <div className="fw-semibold text-white small">{user.username}</div>
                                {user.email && (
                                  <span className="text-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                                    {user.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="fw-semibold text-white">
                            {Number(s.count).toLocaleString('en-IN')}
                          </td>

                          <td className="font-monospace text-secondary">
                            ₹
                            {Number(s.price).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          <td className="fw-bold text-white font-monospace fs-6">
                            ₹
                            {Number(s.totalPrice).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          <td>
                            <span className="badge bg-secondary-subtle text-light px-3 py-1">
                              {s.stockExchange || 'NSE'}
                            </span>
                          </td>

                          <td>
                            <span className="chip-mono" title={s._id}>
                              {s._id}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
