import React, { useMemo } from 'react';

/**
 * MiniCandleChart renders a compact SVG chart
 * Supports 'line' (default) and 'candle' modes.
 * Perfect for stock cards, surveillance tables, and overview lists.
 */
const MiniCandleChart = ({
  symbol = 'RELIANCE',
  price = 2945,
  change = 1.25,
  width = 240,
  height = 44,
  type = 'line',
}) => {
  const isPositive = Number(change) >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const gradId = useMemo(
    () => `grad-${symbol.replace(/[^a-zA-Z0-9]/g, '')}-${Math.floor(Math.random() * 10000)}`,
    [symbol]
  );

  const seriesData = useMemo(() => {
    const base = Number(price) || 100;
    const count = type === 'candle' ? 9 : 16;
    const result = [];

    // Deterministic pseudo-random seed from symbol
    let seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    let current = isPositive ? base * 0.95 : base * 1.05;
    const stepTarget = (base - current) / (count - 1);

    for (let i = 0; i < count; i++) {
      const open = current;
      const noise = (pseudoRandom() - 0.48) * (base * 0.022);
      const close = i === count - 1 ? base : open + stepTarget + noise;
      const high = Math.max(open, close) + pseudoRandom() * (base * 0.012);
      const low = Math.min(open, close) - pseudoRandom() * (base * 0.012);
      result.push({ open, close, high, low, val: close });
      current = close;
    }
    return result;
  }, [symbol, price, change, type, isPositive]);

  // Scaler
  const allValues = seriesData.flatMap((c) => [c.low, c.high]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const paddingY = 6;
  const innerHeight = height - paddingY * 2;
  const getY = (val) => height - paddingY - ((val - minVal) / range) * innerHeight;
  const stepX = width / (seriesData.length - 1 || 1);

  // Line Chart Calculations
  const linePoints = useMemo(() => {
    return seriesData.map((d, i) => ({
      x: i * stepX,
      y: getY(d.val),
    }));
  }, [seriesData, stepX, minVal, range, innerHeight, height]);

  const linePath = useMemo(() => {
    if (linePoints.length === 0) return '';
    return linePoints.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`),
      ''
    );
  }, [linePoints]);

  const areaPath = useMemo(() => {
    if (linePoints.length === 0) return '';
    const first = linePoints[0];
    const last = linePoints[linePoints.length - 1];
    return `${linePath} L ${last.x.toFixed(1)},${height} L ${first.x.toFixed(1)},${height} Z`;
  }, [linePath, linePoints, height]);

  const lastPoint = linePoints[linePoints.length - 1] || { x: width, y: height / 2 };

  // Render Line Chart Mode (Default)
  if (type === 'line') {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mini-line-chart"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Fill Under Line */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Crisp Spline Line */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Endpoint Pulsing Marker */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4.5"
          fill={strokeColor}
          opacity="0.35"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill={strokeColor}
        />
      </svg>
    );
  }

  // Render Candlestick Mode
  const barWidth = 6;
  const candleStepX = width / seriesData.length;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mini-candle-chart"
      style={{ overflow: 'visible', display: 'block' }}
    >
      {seriesData.map((c, idx) => {
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#f43f5e';
        const cx = idx * candleStepX + candleStepX / 2;
        const yHigh = getY(c.high);
        const yLow = getY(c.low);
        const yOpen = getY(c.open);
        const yClose = getY(c.close);
        const topBody = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);

        return (
          <g key={idx} className="candle-bar">
            {/* Wick */}
            <line
              x1={cx}
              y1={yHigh}
              x2={cx}
              y2={yLow}
              stroke={color}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Candle body */}
            <rect
              x={cx - barWidth / 2}
              y={topBody}
              width={barWidth}
              height={bodyHeight}
              fill={color}
              rx="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
};

export default React.memo(MiniCandleChart);
