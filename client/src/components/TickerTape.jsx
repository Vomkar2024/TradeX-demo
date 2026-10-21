import React, { useEffect, useState } from 'react';
import { getMarketAssets, subscribeMarketUpdates } from '../utils/marketData';

const TickerTape = ({ tickers: propTickers }) => {
  const [liveTickers, setLiveTickers] = useState(() => {
    if (propTickers && propTickers.length > 0) return propTickers;
    return getMarketAssets().map((a) => ({
      symbol: a.symbol,
      price: a.basePrice || a.regularMarketOpen,
      change: a.regularMarketChangePercent || 0,
      isUp: (a.regularMarketChangePercent || 0) >= 0,
    }));
  });

  useEffect(() => {
    if (propTickers && propTickers.length > 0) {
      setLiveTickers(propTickers);
      return;
    }

    const update = (assets) => {
      setLiveTickers(
        assets.map((a) => ({
          symbol: a.symbol,
          price: a.basePrice || a.regularMarketOpen,
          change: a.regularMarketChangePercent || 0,
          isUp: (a.regularMarketChangePercent || 0) >= 0,
        }))
      );
    };

    return subscribeMarketUpdates(update);
  }, [propTickers]);

  // Duplicate items for continuous scrolling loop
  const displayItems = [...liveTickers, ...liveTickers];

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
