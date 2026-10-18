import React from 'react';

const DEFAULT_TICKERS = [
  { symbol: 'RELIANCE', price: 2945.50, change: 1.42, isUp: true },
  { symbol: 'TCS', price: 4120.00, change: 0.88, isUp: true },
  { symbol: 'USDT', price: 88.50, change: 0.05, isUp: true },
  { symbol: 'HASMSTER', price: 0.28, change: 8.45, isUp: true },
  { symbol: 'HDFCBANK', price: 1680.75, change: -0.45, isUp: false },
  { symbol: 'INFY', price: 1875.30, change: 2.15, isUp: true },
  { symbol: 'TATAMOTORS', price: 965.40, change: 3.10, isUp: true },
  { symbol: 'BTC', price: 5850000.00, change: 2.35, isUp: true },
  { symbol: 'ETH', price: 225000.00, change: 1.80, isUp: true },
  { symbol: 'SOL', price: 13450.00, change: 5.60, isUp: true },
  { symbol: 'ZOMATO', price: 265.80, change: 4.25, isUp: true },
  { symbol: 'TATASTEEL', price: 158.40, change: -1.15, isUp: false },
  { symbol: 'DOGE', price: 12.50, change: 6.40, isUp: true },
  { symbol: 'IRFC', price: 172.50, change: 1.80, isUp: true },
];

const TickerTape = ({ tickers = DEFAULT_TICKERS }) => {
  // Duplicate for smooth seamless loop
  const displayItems = [...tickers, ...tickers];

  return (
    <div className="ticker-tape-container" aria-label="Live Market Ticker">
      <div className="ticker-tape-track">
        {displayItems.map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="ticker-price">
              ₹
              {Number(item.price).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={`ticker-change ${item.isUp ? 'positive' : 'negative'}`}>
              {item.isUp ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TickerTape);
