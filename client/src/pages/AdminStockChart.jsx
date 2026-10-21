import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

const AdminStockChart = () => {
  const { id: symbol } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA'];
  const upperSym = (symbol || 'RELIANCE').toUpperCase();
  const isCrypto = cryptoSymbols.includes(upperSym);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const tvSymbol = isCrypto
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
  }, [symbol, upperSym, isCrypto]);

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-outline-light btn-sm mb-3 d-flex align-items-center gap-2"
            onClick={() => navigate('/admin')}
          >
            ← Return to Surveillance Console
          </button>
          <div className="d-flex align-items-center gap-3">
            <h1 className="page-title mb-0">Surveillance: {upperSym}</h1>
            <span className={`asset-badge-tag ${isCrypto ? 'crypto' : 'equity'}`}>
              {isCrypto ? 'CRYPTO PAIR (BINANCE)' : 'EQUITY (NSE/BSE)'}
            </span>
          </div>
          <p className="page-subtitle mb-0 mt-1">High-resolution institutional price action, depth, & volume analytics</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger px-3 py-2 fw-bold" style={{ letterSpacing: '0.04em' }}>
            🛡️ SURVEILLANCE DESK
          </span>
          <span className="badge-live-stream">
            <span className="live-dot"></span> LIVE TICK
          </span>
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
