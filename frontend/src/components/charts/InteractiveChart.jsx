import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, Layers, Sliders, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const InteractiveChart = ({ stock, height = 380 }) => {
  const { isDark } = useTheme();
  // Required ranges: 1D, 1W, 1M, 6M, 1Y, 5Y
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('candles'); // candles, area
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  // Generate synthetic candles based on stock LTP and selected timeframe
  const candles = useMemo(() => {
    if (!stock) return [];
    const countMap = {
      '1D': 24,
      '1W': 35,
      '1M': 30,
      '6M': 45,
      '1Y': 52,
      '5Y': 60,
    };
    const count = countMap[timeframe] || 30;
    const basePrice = (stock.ltp || 1000) * 0.94;
    const result = [];
    let current = basePrice;

    for (let i = 0; i < count; i++) {
      const volatility = (stock.ltp || 1000) * 0.012;
      const change = (Math.sin(i * 0.35) * 0.7 + (Math.random() - 0.46)) * volatility;
      const open = Math.round(current * 100) / 100;
      const close = Math.round((current + change) * 100) / 100;
      const high = Math.round((Math.max(open, close) + Math.random() * volatility * 0.7) * 100) / 100;
      const low = Math.round((Math.min(open, close) - Math.random() * volatility * 0.7) * 100) / 100;
      const volume = Math.floor(150000 + Math.random() * 850000);

      // Time labels
      let label = '';
      if (timeframe === '1D') {
        const hour = 9 + Math.floor(i / 4);
        const min = (i % 4) * 15;
        label = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      } else if (timeframe === '1W') {
        label = `Day ${i + 1}`;
      } else if (timeframe === '1M') {
        label = `D-${30 - i}`;
      } else if (timeframe === '6M') {
        label = `Wk ${i + 1}`;
      } else if (timeframe === '1Y') {
        label = `M-${Math.floor(i / 4.3) + 1}`;
      } else {
        label = `'${21 + Math.floor(i / 12)}`;
      }

      result.push({ open, close, high, low, volume, label });
      current = close;
    }

    // Align final candle to actual live price
    if (result.length > 0 && stock.ltp) {
      result[result.length - 1].close = stock.ltp;
      result[result.length - 1].high = Math.max(result[result.length - 1].high, stock.ltp);
      result[result.length - 1].low = Math.min(result[result.length - 1].low, stock.ltp);
    }

    return result;
  }, [stock, timeframe]);

  // Compute Technical Indicators
  const indicatorSeries = useMemo(() => {
    if (!candles.length) return {};
    const closes = candles.map((c) => c.close);

    // SMA calculation
    const calcSMA = (period) => {
      return closes.map((_, idx) => {
        if (idx < period - 1) return null;
        const slice = closes.slice(idx - period + 1, idx + 1);
        return slice.reduce((a, b) => a + b, 0) / period;
      });
    };

    // EMA calculation
    const calcEMA = (period) => {
      const k = 2 / (period + 1);
      const emaArr = [];
      let prevEma = closes[0];
      closes.forEach((price, idx) => {
        if (idx === 0) {
          emaArr.push(price);
        } else {
          prevEma = price * k + prevEma * (1 - k);
          emaArr.push(prevEma);
        }
      });
      return emaArr;
    };

    // Bollinger Bands (period 20, 2 std dev)
    const sma20 = calcSMA(20);
    const bollingerUpper = [];
    const bollingerLower = [];
    closes.forEach((_, idx) => {
      if (idx < 19 || !sma20[idx]) {
        bollingerUpper.push(null);
        bollingerLower.push(null);
      } else {
        const slice = closes.slice(idx - 19, idx + 1);
        const mean = sma20[idx];
        const variance = slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / 20;
        const std = Math.sqrt(variance);
        bollingerUpper.push(mean + std * 2);
        bollingerLower.push(mean - std * 2);
      }
    });

    // RSI (14)
    const rsi14 = [];
    let gains = 0;
    let losses = 0;
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        rsi14.push(50);
        continue;
      }
      const diff = closes[i] - closes[i - 1];
      if (i <= 14) {
        if (diff >= 0) gains += diff;
        else losses -= diff;
        if (i === 14) {
          const avgGain = gains / 14;
          const avgLoss = losses / 14 || 0.0001;
          const rs = avgGain / avgLoss;
          rsi14.push(100 - 100 / (1 + rs));
        } else {
          rsi14.push(50);
        }
      } else {
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        gains = (gains * 13 + gain) / 14;
        losses = (losses * 13 + loss) / 14;
        const rs = gains / (losses || 0.0001);
        rsi14.push(Math.min(100, Math.max(0, 100 - 100 / (1 + rs))));
      }
    }

    return {
      sma20,
      sma50: calcSMA(15), // Scaled for display period
      ema: calcEMA(12),
      bollingerUpper,
      bollingerLower,
      rsi14,
    };
  }, [candles]);

  const minPrice = Math.min(...candles.map((c) => c.low)) * 0.995;
  const maxPrice = Math.max(...candles.map((c) => c.high)) * 1.005;
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = Math.max(...candles.map((c) => c.volume)) || 1;

  const width = 850;
  const rsiHeight = showRSI ? 60 : 0;
  const plotHeight = height - 90 - rsiHeight;
  const volHeight = 45;

  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];

  return (
    <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 shadow-xs flex flex-col transition-colors">
      {/* Top Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E4E9F2] dark:border-[#30333B]">
        {/* Active Candle Price Inspector */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
          {activeCandle && (
            <>
              <div>
                <span className="text-[#69758A] dark:text-[#A0A7B5]">O: </span>
                <span className="text-[#172033] dark:text-[#F4F6FC] font-bold">{Number(activeCandle.open ?? 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#69758A] dark:text-[#A0A7B5]">H: </span>
                <span className="text-[#07966A] dark:text-[#19B88A] font-bold">{Number(activeCandle.high ?? 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#69758A] dark:text-[#A0A7B5]">L: </span>
                <span className="text-[#E5484D] dark:text-[#FF6268] font-bold">{Number(activeCandle.low ?? 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#69758A] dark:text-[#A0A7B5]">C: </span>
                <span
                  className={`font-bold ${
                    (activeCandle.close ?? 0) >= (activeCandle.open ?? 0)
                      ? 'text-[#07966A] dark:text-[#19B88A]'
                      : 'text-[#E5484D] dark:text-[#FF6268]'
                  }`}
                >
                  {Number(activeCandle.close ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="hidden md:block">
                <span className="text-[#69758A] dark:text-[#A0A7B5]">Vol: </span>
                <span className="text-[#405CF5] dark:text-[#627BFF] font-bold">
                  {(Number(activeCandle.volume ?? 0) / 1000).toFixed(1)}K
                </span>
              </div>
            </>
          )}
        </div>

        {/* Controls: Timeframe & Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector (1D, 1W, 1M, 6M, 1Y, 5Y) */}
          <div className="flex bg-[#F3F6FC] dark:bg-[#202228] rounded-lg p-0.5 border border-[#E4E9F2] dark:border-[#30333B]">
            {['1D', '1W', '1M', '6M', '1Y', '5Y'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-xs'
                    : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex bg-[#F3F6FC] dark:bg-[#202228] rounded-lg p-0.5 border border-[#E4E9F2] dark:border-[#30333B]">
            <button
              type="button"
              onClick={() => setChartType('candles')}
              className={`p-1.5 rounded-md transition-colors ${
                chartType === 'candles'
                  ? 'bg-white dark:bg-[#18191D] text-[#405CF5] dark:text-[#627BFF] shadow-2xs font-bold'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
              title="Candlestick View"
            >
              <BarChart3 className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-md transition-colors ${
                chartType === 'area'
                  ? 'bg-white dark:bg-[#18191D] text-[#405CF5] dark:text-[#627BFF] shadow-2xs font-bold'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
              title="Area Line View"
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Volume Toggle */}
          <button
            type="button"
            onClick={() => setShowVolume((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showVolume
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40 text-[#405CF5] dark:text-[#627BFF]'
                : 'bg-white dark:bg-[#18191D] border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vol</span>
          </button>
        </div>
      </div>

      {/* Technical Indicators Ribbon */}
      <div className="flex flex-wrap items-center gap-2 pt-2.5 pb-2 text-[11px]">
        <span className="text-[#69758A] dark:text-[#A0A7B5] font-semibold flex items-center gap-1 mr-1">
          <Activity className="w-3 h-3 text-[#405CF5] dark:text-[#627BFF]" />
          Indicators:
        </span>
        <button
          type="button"
          onClick={() => setShowSMA20(!showSMA20)}
          className={`px-2 py-0.5 rounded-md border font-bold transition-colors ${
            showSMA20
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
              : 'bg-white dark:bg-[#18191D] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
          }`}
        >
          SMA 20
        </button>
        <button
          type="button"
          onClick={() => setShowSMA50(!showSMA50)}
          className={`px-2 py-0.5 rounded-md border font-bold transition-colors ${
            showSMA50
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700'
              : 'bg-white dark:bg-[#18191D] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
          }`}
        >
          SMA 50
        </button>
        <button
          type="button"
          onClick={() => setShowEMA(!showEMA)}
          className={`px-2 py-0.5 rounded-md border font-bold transition-colors ${
            showEMA
              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-700'
              : 'bg-white dark:bg-[#18191D] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
          }`}
        >
          EMA
        </button>
        <button
          type="button"
          onClick={() => setShowBollinger(!showBollinger)}
          className={`px-2 py-0.5 rounded-md border font-bold transition-colors ${
            showBollinger
              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF] border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-[#18191D] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
          }`}
        >
          Bollinger
        </button>
        <button
          type="button"
          onClick={() => setShowRSI(!showRSI)}
          className={`px-2 py-0.5 rounded-md border font-bold transition-colors ${
            showRSI
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-[#18191D] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
          }`}
        >
          RSI (14)
        </button>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative mt-2 flex-1 bg-white dark:bg-[#18191D] transition-colors">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaLightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#405CF5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#405CF5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = plotHeight * pct;
            const priceVal = maxPrice - pct * priceRange;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={width - 65}
                  y2={y}
                  stroke={isDark ? '#262930' : '#E8EDF5'}
                  strokeWidth="1"
                />
                <text
                  x={width - 55}
                  y={y + 4}
                  fill={isDark ? '#A0A7B5' : '#69758A'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ₹{priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume Bars */}
          {showVolume &&
            candles.map((candle, idx) => {
              const candleWidth = (width - 70) / candles.length;
              const x = idx * candleWidth + candleWidth / 2;
              const vH = (candle.volume / maxVol) * volHeight;
              const isUp = candle.close >= candle.open;

              return (
                <rect
                  key={`vol-${idx}`}
                  x={x - candleWidth * 0.35}
                  y={plotHeight - vH}
                  width={candleWidth * 0.7}
                  height={vH}
                  fill={isUp ? 'rgba(22, 163, 74, 0.25)' : 'rgba(220, 38, 38, 0.25)'}
                />
              );
            })}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            (() => {
              const candleWidth = (width - 70) / candles.length;
              const points = candles.map((c, i) => {
                const x = i * candleWidth + candleWidth / 2;
                const y = plotHeight - ((c.close - minPrice) / priceRange) * plotHeight;
                return `${x},${y}`;
              });
              const lineStr = points.join(' ');
              const firstX = candleWidth / 2;
              const lastX = (candles.length - 1) * candleWidth + candleWidth / 2;
              const areaStr = `${firstX},${plotHeight} ${lineStr} ${lastX},${plotHeight}`;

              return (
                <>
                  <polygon points={areaStr} fill="url(#areaLightGrad)" />
                  <polyline
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={lineStr}
                  />
                </>
              );
            })()
          )}

          {/* Candlestick Chart Mode */}
          {chartType === 'candles' &&
            candles.map((candle, idx) => {
              const candleWidth = (width - 70) / candles.length;
              const x = idx * candleWidth + candleWidth / 2;
              const bodyWidth = Math.max(3, candleWidth * 0.7);

              const yHigh = plotHeight - ((candle.high - minPrice) / priceRange) * plotHeight;
              const yLow = plotHeight - ((candle.low - minPrice) / priceRange) * plotHeight;
              const yOpen = plotHeight - ((candle.open - minPrice) / priceRange) * plotHeight;
              const yClose = plotHeight - ((candle.close - minPrice) / priceRange) * plotHeight;

              const isUp = candle.close >= candle.open;
              const color = isUp ? '#16A34A' : '#DC2626';
              const yBodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g
                  key={`candle-${idx}`}
                  onMouseEnter={() => setHoverIndex(idx)}
                  className="cursor-pointer"
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Body */}
                  <rect
                    x={x - bodyWidth / 2}
                    y={yBodyTop}
                    width={bodyWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1.5"
                  />
                </g>
              );
            })}

          {/* Indicator Overlays */}
          {(() => {
            const candleWidth = (width - 70) / candles.length;
            const overlays = [];

            // Bollinger Bands
            if (showBollinger && indicatorSeries.bollingerUpper) {
              const upPts = indicatorSeries.bollingerUpper
                .map((val, i) => {
                  if (val === null) return null;
                  const x = i * candleWidth + candleWidth / 2;
                  const y = plotHeight - ((val - minPrice) / priceRange) * plotHeight;
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');

              const lowPts = indicatorSeries.bollingerLower
                .map((val, i) => {
                  if (val === null) return null;
                  const x = i * candleWidth + candleWidth / 2;
                  const y = plotHeight - ((val - minPrice) / priceRange) * plotHeight;
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');

              overlays.push(
                <g key="bb">
                  <polyline fill="none" stroke="#93C5FD" strokeDasharray="2 2" strokeWidth="1.5" points={upPts} />
                  <polyline fill="none" stroke="#93C5FD" strokeDasharray="2 2" strokeWidth="1.5" points={lowPts} />
                </g>
              );
            }

            // SMA 20
            if (showSMA20 && indicatorSeries.sma20) {
              const pts = indicatorSeries.sma20
                .map((val, i) => {
                  if (val === null) return null;
                  const x = i * candleWidth + candleWidth / 2;
                  const y = plotHeight - ((val - minPrice) / priceRange) * plotHeight;
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');
              overlays.push(
                <polyline key="sma20" fill="none" stroke="#F59E0B" strokeWidth="1.8" points={pts} />
              );
            }

            // SMA 50
            if (showSMA50 && indicatorSeries.sma50) {
              const pts = indicatorSeries.sma50
                .map((val, i) => {
                  if (val === null) return null;
                  const x = i * candleWidth + candleWidth / 2;
                  const y = plotHeight - ((val - minPrice) / priceRange) * plotHeight;
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');
              overlays.push(
                <polyline key="sma50" fill="none" stroke="#8B5CF6" strokeWidth="1.8" points={pts} />
              );
            }

            // EMA
            if (showEMA && indicatorSeries.ema) {
              const pts = indicatorSeries.ema
                .map((val, i) => {
                  if (val === null) return null;
                  const x = i * candleWidth + candleWidth / 2;
                  const y = plotHeight - ((val - minPrice) / priceRange) * plotHeight;
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');
              overlays.push(
                <polyline key="ema" fill="none" stroke="#0D9488" strokeWidth="1.8" points={pts} />
              );
            }

            return overlays;
          })()}

          {/* RSI Oscillator Panel */}
          {showRSI && indicatorSeries.rsi14 && (
            <g transform={`translate(0, ${plotHeight + 10})`}>
              <line x1="0" y1="0" x2={width - 65} y2="0" stroke="#E5E7EB" strokeWidth="1" />
              <rect x="0" y="5" width={width - 65} height={rsiHeight - 10} fill="#F9FAFB" />
              <line x1="0" y1="15" x2={width - 65} y2="15" stroke="#FCA5A5" strokeDasharray="2 2" strokeWidth="1" />
              <line x1="0" y1="45" x2={width - 65} y2="45" stroke="#86EFAC" strokeDasharray="2 2" strokeWidth="1" />
              <text x={width - 55} y="18" fill="#9CA3AF" fontSize="8">70</text>
              <text x={width - 55} y="48" fill="#9CA3AF" fontSize="8">30</text>
              {(() => {
                const candleWidth = (width - 70) / candles.length;
                const rsiPts = indicatorSeries.rsi14
                  .map((val, i) => {
                    const x = i * candleWidth + candleWidth / 2;
                    const y = 5 + (1 - val / 100) * (rsiHeight - 10);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return <polyline fill="none" stroke="#6366F1" strokeWidth="1.5" points={rsiPts} />;
              })()}
            </g>
          )}

          {/* Hover Crosshair Cursor */}
          {hoverIndex !== null && candles[hoverIndex] && (
            (() => {
              const candleWidth = (width - 70) / candles.length;
              const x = hoverIndex * candleWidth + candleWidth / 2;
              const c = candles[hoverIndex];
              const y = plotHeight - ((c.close - minPrice) / priceRange) * plotHeight;

              return (
                <g pointerEvents="none">
                  {/* Vertical Crosshair */}
                  <line
                    x1={x}
                    y1="0"
                    x2={x}
                    y2={plotHeight}
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  {/* Horizontal Crosshair */}
                  <line
                    x1="0"
                    y1={y}
                    x2={width - 65}
                    y2={y}
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  {/* Intersect point circle */}
                  <circle cx={x} cy={y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* Bottom Time Labels */}
      <div className="flex justify-between items-center px-2 pt-2 text-[10px] text-[#9CA3AF] font-mono border-t border-[#F3F4F6]">
        <span>{candles[0]?.label || ''}</span>
        <span>{candles[Math.floor(candles.length / 2)]?.label || ''}</span>
        <span>{candles[candles.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
};
