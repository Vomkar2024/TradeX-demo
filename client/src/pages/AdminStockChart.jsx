import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminStockChart = () => {
  const { id: symbol } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA'];
    const upperSym = (symbol || 'RELIANCE').toUpperCase();
    const tvSymbol = cryptoSymbols.includes(upperSym)
      ? `BINANCE:${upperSym}USDT`
      : `BSE:${upperSym}`;

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
  }, [symbol]);

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => navigate('/admin')}>
            ← Back to Admin Console
          </button>
          <h1 className="h2 fw-bold text-dark mb-1">Surveillance: {symbol.toUpperCase()}</h1>
          <p className="text-muted mb-0">High-resolution institutional price action & volume breakdown</p>
        </div>
        <div>
          <span className="badge bg-danger p-2 fs-6">Admin Mode</span>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ height: '640px' }}>
        <div className="tradingview-widget-container h-100 w-100" ref={containerRef}>
          <div className="tradingview-widget-container__widget h-100 w-100"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminStockChart;
