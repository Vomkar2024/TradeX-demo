// TradeX Centralized Market Pricing Engine
// Standardizes all Stock and Crypto pricing realistically and strictly under ₹5,000.

export const DEFAULT_MARKET_ASSETS = [
  // Top Featured
  {
    symbol: 'RELIANCE',
    shortName: 'Reliance Industries Ltd.',
    basePrice: 2945.50,
    regularMarketOpen: 2945.50,
    regularMarketChangePercent: 1.42,
    change: 41.25,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [1800, 3900],
  },
  {
    symbol: 'TCS',
    shortName: 'Tata Consultancy Services',
    basePrice: 3850.00,
    regularMarketOpen: 3850.00,
    regularMarketChangePercent: 0.88,
    change: 33.60,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [2400, 4800],
  },
  {
    symbol: 'USDT',
    shortName: 'Tether USD (USDT)',
    basePrice: 88.50,
    regularMarketOpen: 88.50,
    regularMarketChangePercent: 0.05,
    change: 0.04,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [85, 93],
  },
  {
    symbol: 'HASMSTER',
    shortName: 'Hamster Kombat (HMSTR)',
    basePrice: 2.85,
    regularMarketOpen: 2.85,
    regularMarketChangePercent: 8.45,
    change: 0.22,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [0.5, 9.5],
  },

  // Equities (NSE/BSE) - All realistic under ₹5,000
  {
    symbol: 'HDFCBANK',
    shortName: 'HDFC Bank Limited',
    basePrice: 1680.75,
    regularMarketOpen: 1680.75,
    regularMarketChangePercent: -0.45,
    change: -7.60,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [1200, 2200],
  },
  {
    symbol: 'INFY',
    shortName: 'Infosys Limited',
    basePrice: 1875.30,
    regularMarketOpen: 1875.30,
    regularMarketChangePercent: 2.15,
    change: 39.50,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [1300, 2400],
  },
  {
    symbol: 'TATAMOTORS',
    shortName: 'Tata Motors Ltd.',
    basePrice: 965.40,
    regularMarketOpen: 965.40,
    regularMarketChangePercent: 3.10,
    change: 29.00,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [700, 1400],
  },
  {
    symbol: 'ICICIBANK',
    shortName: 'ICICI Bank Ltd.',
    basePrice: 1230.20,
    regularMarketOpen: 1230.20,
    regularMarketChangePercent: 0.65,
    change: 7.95,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [900, 1600],
  },
  {
    symbol: 'ITC',
    shortName: 'ITC Limited',
    basePrice: 492.15,
    regularMarketOpen: 492.15,
    regularMarketChangePercent: -0.32,
    change: -1.60,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [380, 620],
  },
  {
    symbol: 'ZOMATO',
    shortName: 'Zomato Limited',
    basePrice: 265.80,
    regularMarketOpen: 265.80,
    regularMarketChangePercent: 4.25,
    change: 10.85,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [180, 390],
  },
  {
    symbol: 'TATASTEEL',
    shortName: 'Tata Steel Limited',
    basePrice: 158.40,
    regularMarketOpen: 158.40,
    regularMarketChangePercent: -1.15,
    change: -1.85,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [110, 240],
  },
  {
    symbol: 'IRFC',
    shortName: 'IRFC Railway Finance Corp',
    basePrice: 172.50,
    regularMarketOpen: 172.50,
    regularMarketChangePercent: 1.80,
    change: 3.05,
    category: 'Equity',
    exchange: 'NSE',
    priceRange: [120, 260],
  },

  // Cryptocurrencies - Realistic tradeable units strictly under ₹5,000
  {
    symbol: 'BTC',
    shortName: 'Bitcoin (INR)',
    basePrice: 3850.00,
    regularMarketOpen: 3850.00,
    regularMarketChangePercent: 2.35,
    change: 88.30,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [2800, 4900],
  },
  {
    symbol: 'ETH',
    shortName: 'Ethereum (INR)',
    basePrice: 2420.00,
    regularMarketOpen: 2420.00,
    regularMarketChangePercent: 1.80,
    change: 42.80,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [1600, 3900],
  },
  {
    symbol: 'SOL',
    shortName: 'Solana (INR)',
    basePrice: 1280.00,
    regularMarketOpen: 1280.00,
    regularMarketChangePercent: 5.60,
    change: 68.00,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [750, 2400],
  },
  {
    symbol: 'DOGE',
    shortName: 'Dogecoin (INR)',
    basePrice: 12.50,
    regularMarketOpen: 12.50,
    regularMarketChangePercent: 6.40,
    change: 0.75,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [5, 35],
  },
  {
    symbol: 'XRP',
    shortName: 'Ripple (INR)',
    basePrice: 48.20,
    regularMarketOpen: 48.20,
    regularMarketChangePercent: -0.90,
    change: -0.44,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [30, 95],
  },
  {
    symbol: 'HMSTR',
    shortName: 'Hamster Kombat (HMSTR)',
    basePrice: 2.85,
    regularMarketOpen: 2.85,
    regularMarketChangePercent: 8.45,
    change: 0.22,
    category: 'Crypto',
    exchange: 'Crypto',
    priceRange: [0.5, 9.5],
  },
];

const STORAGE_KEY = 'tradex_market_prices';

/**
 * Retrieve active market assets, ensuring all prices are under ₹5,000.
 */
export const getMarketAssets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce under 5000 check on all loaded items
        return parsed.map((item) => {
          const price = Number(item.basePrice || item.regularMarketOpen || 100);
          const safePrice = price > 5000 ? (price % 4000) + 500 : price;
          return {
            ...item,
            basePrice: Number(safePrice.toFixed(2)),
            regularMarketOpen: Number(safePrice.toFixed(2)),
          };
        });
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored market prices, fallback to default:', e);
  }
  return DEFAULT_MARKET_ASSETS;
};

/**
 * Save market assets to localStorage and broadcast an update event.
 */
export const saveMarketAssets = (assets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    window.dispatchEvent(new CustomEvent('marketPricesUpdated', { detail: assets }));
  } catch (e) {
    console.error('Error saving market assets:', e);
  }
};

/**
 * Generate a random number between min and max rounded to 2 decimal places.
 * Ensures the value is strictly under 5000.
 */
export const getRandomPrice = (min = 10, max = 4950) => {
  const safeMax = Math.min(max, 4995);
  const val = Math.random() * (safeMax - min) + min;
  return Number(val.toFixed(2));
};

/**
 * Re-rolls all stock and crypto prices to fresh randomized values strictly under ₹5,000.
 */
export const randomizeAllMarketPrices = () => {
  const current = getMarketAssets();
  const randomized = current.map((asset) => {
    const [rangeMin, rangeMax] = asset.priceRange || [25, 4800];
    const newPrice = getRandomPrice(rangeMin, rangeMax);
    const changePct = Number(((Math.random() * 10) - 4.5).toFixed(2)); // -4.5% to +5.5%
    const changeAmount = Number(((newPrice * changePct) / 100).toFixed(2));

    return {
      ...asset,
      basePrice: newPrice,
      regularMarketOpen: newPrice,
      regularMarketChangePercent: changePct,
      change: changeAmount,
      changePct: changePct,
    };
  });

  saveMarketAssets(randomized);
  return randomized;
};

/**
 * Reset all market prices to realistic predefined baseline prices under ₹5,000.
 */
export const resetMarketPrices = () => {
  saveMarketAssets(DEFAULT_MARKET_ASSETS);
  return DEFAULT_MARKET_ASSETS;
};

/**
 * Look up asset details by symbol with fallback guaranteed to be under ₹5,000.
 */
export const getAssetBySymbol = (symbol) => {
  if (!symbol) return DEFAULT_MARKET_ASSETS[0];
  const upper = symbol.toUpperCase();
  const assets = getMarketAssets();
  const found = assets.find((a) => a.symbol === upper);
  if (found) return found;

  // Unlisted symbol fallback: deterministic realistic price under 5,000
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = (hash << 5) - hash + upper.charCodeAt(i);
    hash |= 0;
  }
  const fallbackPrice = Number(((Math.abs(hash) % 4500) + 120).toFixed(2)); // ₹120 to ₹4,620

  return {
    symbol: upper,
    name: `${upper} Security`,
    shortName: `${upper} Security`,
    basePrice: fallbackPrice,
    regularMarketOpen: fallbackPrice,
    regularMarketChangePercent: 1.25,
    change: Number((fallbackPrice * 0.0125).toFixed(2)),
    changePct: 1.25,
    category: upper.includes('USD') || upper.includes('COIN') ? 'Crypto' : 'Equity',
    exchange: upper.includes('USD') || upper.includes('COIN') ? 'Crypto' : 'NSE',
  };
};

/**
 * Return an object dictionary keyed by symbol for fast lookups & registry views.
 */
export const getStockRegistry = () => {
  const assets = getMarketAssets();
  const registry = {};
  assets.forEach((a) => {
    registry[a.symbol] = {
      symbol: a.symbol,
      name: a.shortName || a.name || a.symbol,
      exchange: a.exchange || 'NSE',
      basePrice: a.basePrice || a.regularMarketOpen,
      change: a.change || 0,
      changePct: a.regularMarketChangePercent !== undefined ? a.regularMarketChangePercent : (a.changePct || 0),
      category: a.category || 'Equity',
    };
  });
  return registry;
};

/**
 * Subscribe to market price changes across the application.
 */
export const subscribeMarketUpdates = (callback) => {
  const handler = (e) => {
    if (e.detail) {
      callback(e.detail);
    }
  };
  window.addEventListener('marketPricesUpdated', handler);
  return () => window.removeEventListener('marketPricesUpdated', handler);
};

/**
 * Format currency into standard Indian Rupee format.
 */
export const formatINR = (value) => {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
