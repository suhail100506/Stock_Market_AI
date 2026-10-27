import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  Activity,
  Layers,
  Sliders,
  Compass,
  ArrowUpRight,
  ChevronRight,
  Clock,
  PieChart,
  BarChart2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { mockNews } from '../data/mockNews';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    stocks,
    indices,
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    openTradeModal,
  } = useTrading();

  // Active sub-tabs
  const [selectedMoversTab, setSelectedMoversTab] = useState('gainers'); // 'gainers' | 'losers' | 'active'
  const [selectedPerformerPeriod, setSelectedPerformerPeriod] = useState('1M'); // '1W' | '1M' | '1Y'
  const [selectedScreenerFilter, setSelectedScreenerFilter] = useState('rsi_oversold');
  const [selectedSignalTab, setSelectedSignalTab] = useState('candlesticks'); // 'candlesticks' | 'patterns' | 'price'
  const [selectedIndex, setSelectedIndex] = useState('NIFTY 50');

  const currentIndexData = indices.find((idx) => idx.symbol === selectedIndex) || indices[0];

  // Derive Gainers, Losers, Most Active
  const sortedByChange = [...stocks].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = [...sortedByChange].reverse().slice(0, 5);
  const mostActive = [...stocks]
    .sort((a, b) => parseFloat(b.volume || '0') - parseFloat(a.volume || '0'))
    .slice(0, 5);

  const displayedMovers =
    selectedMoversTab === 'gainers'
      ? topGainers
      : selectedMoversTab === 'losers'
      ? topLosers
      : mostActive;

  // Sectors performance data
  const sectorPerformance = [
    { name: 'Nifty IT', change: 1.64, isPositive: true },
    { name: 'Nifty Bank', change: -0.22, isPositive: false },
    { name: 'Nifty Auto', change: 0.85, isPositive: true },
    { name: 'Nifty Energy', change: -0.45, isPositive: false },
    { name: 'Nifty Metal', change: 1.12, isPositive: true },
    { name: 'Nifty FMCG', change: -0.18, isPositive: false },
  ];

  // Most Bought Stocks
  const mostBoughtStocks = stocks
    .filter((s) => ['IDEA', 'RELIANCE', 'SUZLON', 'TATASTEEL', 'INFY'].includes(s.symbol))
    .slice(0, 5);

  // Technical Screener options
  const screenerStocks = {
    rsi_oversold: stocks.filter((s) => (s.technicals?.rsi ?? 50) < 45).slice(0, 4),
    rsi_overbought: stocks.filter((s) => (s.technicals?.rsi ?? 50) > 65).slice(0, 4),
    macd_bullish: stocks.filter((s) => String(s.technicals?.macd || '').toLowerCase().includes('bullish')).slice(0, 4),
    golden_cross: stocks.filter((s) => s.aiSignal?.includes('BUY')).slice(0, 4),
  };

  // Trading Signals / Recommendations
  const researchPicks = [
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      target: 3515.00,
      stopLoss: 3380.00,
      recPrice: 3450.00,
      upside: '+1.88%',
      horizon: 'Short Term',
      action: 'BUY',
    },
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      target: 3220.00,
      stopLoss: 2890.00,
      recPrice: 2985.00,
      upside: '+7.87%',
      horizon: 'Medium Term',
      action: 'BUY',
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      target: 2080.00,
      stopLoss: 1840.00,
      recPrice: 1914.00,
      upside: '+8.67%',
      horizon: 'Positional',
      action: 'BUY',
    },
    {
      symbol: 'TATAPOWER',
      name: 'Tata Power Co. Ltd.',
      target: 410.00,
      stopLoss: 335.00,
      recPrice: 352.25,
      upside: '+16.39%',
      horizon: 'Swing',
      action: 'BUY',
    },
  ];

  // Corporate Actions
  const corporateActions = [
    { company: 'RAMKRISHNA FORGINGS', event: 'Board Meeting', date: 'Oct 24, 2026', purpose: 'Q2 Results & Dividend' },
    { company: 'GUJARAT NATURAL RES.', event: 'AGM', date: 'Oct 28, 2026', purpose: 'Annual Accounts' },
    { company: 'GALAXY AGRO EXPORTS', event: 'EGM', date: 'Nov 02, 2026', purpose: 'Capital Alteration' },
    { company: 'MEGHMANI ORGANICS', event: 'Dividend', date: 'Nov 08, 2026', purpose: '₹1.50 per share' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
      {/* Category Navigation Bar Pills (Screenshots 7 & 14) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#405CF5] text-white shadow-2xs shrink-0 hover:bg-[#3049D8] transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Stock Discovery</span>
        </button>
        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors shrink-0"
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Mutual Funds</span>
        </button>
        <button
          onClick={() => navigate('/trade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Futures & Options</span>
        </button>
        <button
          onClick={() => navigate('/screener')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors shrink-0"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ETF Discovery</span>
        </button>
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors shrink-0"
        >
          <BarChart2 className="w-3.5 h-3.5 text-yellow-500" />
          <span>Commodities & Gold</span>
        </button>
      </div>

      {/* SECTION A: Index Overview (Screenshots 6 & 13) */}
      <section className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Index Overview
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#07966A] dark:text-[#19B88A] border border-emerald-200 dark:border-emerald-800/40">
              NSE LIVE
            </span>
          </div>
          <button
            onClick={() => navigate('/markets')}
            className="text-xs font-bold text-[#405CF5] dark:text-[#627BFF] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Index Ticker Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {indices.map((idx) => {
            const isSelected = selectedIndex === idx.symbol;
            const isPos = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                onClick={() => setSelectedIndex(idx.symbol)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#405CF5] dark:border-[#627BFF] bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/60 dark:bg-[#202228]/60 hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
                }`}
              >
                <div className="text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5] truncate">
                  {idx.symbol}
                </div>
                <div className="text-sm font-mono font-bold text-[#172033] dark:text-[#F4F6FC] mt-0.5">
                  {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div
                  className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 mt-0.5 ${
                    isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                  }`}
                >
                  {isPos ? '+' : ''}{idx.change.toFixed(2)} ({isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%)
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Index Intraday Timeline & Day's High/Low Range */}
        <div className="mt-5 pt-4 border-t border-[#E4E9F2] dark:border-[#30333B] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Day's Range Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#69758A] dark:text-[#A0A7B5]">
              <span className="font-semibold text-[11px]">Day's Low</span>
              <span className="font-bold text-[11px] text-[#172033] dark:text-[#F4F6FC]">
                {currentIndexData.symbol} Range
              </span>
              <span className="font-semibold text-[11px]">Day's High</span>
            </div>

            <div className="relative flex items-center">
              <div className="w-full h-2 rounded-full bg-[#E4E9F2] dark:bg-[#30333B] relative overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#E5484D] via-amber-400 to-[#07966A] rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
              {/* Current Price Dot */}
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-[#172033] dark:bg-white border-2 border-white dark:border-[#101114] shadow-xs top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{
                  left: `${Math.min(
                    95,
                    Math.max(
                      5,
                      (((currentIndexData.value - (currentIndexData.low || currentIndexData.value * 0.99)) /
                        ((currentIndexData.high || currentIndexData.value * 1.01) -
                          (currentIndexData.low || currentIndexData.value * 0.99))) *
                        100)
                    )
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
              <span>₹{(currentIndexData.low || currentIndexData.value * 0.99).toLocaleString('en-IN')}</span>
              <span>₹{(currentIndexData.high || currentIndexData.value * 1.01).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Intraday Market Timeline SVG Chart */}
          <div className="md:col-span-2">
            <div className="h-28 w-full relative flex flex-col justify-between">
              {/* SVG Area Chart */}
              <svg className="w-full h-20 overflow-visible" viewBox="0 0 500 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentIndexData.change >= 0 ? '#07966A' : '#E5484D'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={currentIndexData.change >= 0 ? '#07966A' : '#E5484D'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Simulated Chart Curve */}
                <path
                  d="M 0 25 C 50 28, 100 45, 150 40 C 200 35, 250 60, 300 55 C 350 50, 400 68, 500 65 L 500 80 L 0 80 Z"
                  fill="url(#indexGradient)"
                />
                <path
                  d="M 0 25 C 50 28, 100 45, 150 40 C 200 35, 250 60, 300 55 C 350 50, 400 68, 500 65"
                  fill="none"
                  stroke={currentIndexData.change >= 0 ? '#07966A' : '#E5484D'}
                  strokeWidth="2"
                />
              </svg>

              {/* Time axis */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#69758A] dark:text-[#A0A7B5] pt-1 border-t border-[#E4E9F2]/60 dark:border-[#30333B]/60">
                <span>09:15</span>
                <span>10:30</span>
                <span>11:30</span>
                <span>12:30</span>
                <span>13:30</span>
                <span>14:30</span>
                <span>15:30</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Most Bought Stocks (Screenshots 6 & 13) */}
      <section className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
            Most Bought Stocks
          </h2>
          <button
            onClick={() => navigate('/markets')}
            className="text-xs font-bold text-[#405CF5] dark:text-[#627BFF] hover:underline"
          >
            VIEW ALL &rsaquo;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {mostBoughtStocks.map((stock) => {
            const isPos = (stock.change ?? 0) >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                className="p-3 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/60 dark:bg-[#202228]/60 hover:border-[#405CF5] dark:hover:border-[#627BFF] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF] font-bold text-xs flex items-center justify-center">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                    }`}
                  >
                    {isPos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                  </span>
                </div>

                <div className="mt-2 font-bold text-xs text-[#172033] dark:text-[#F4F6FC] truncate">
                  {stock.symbol}
                </div>
                <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate">
                  {stock.name}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                    ₹{(stock.ltp ?? 0).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTradeModal(stock.symbol, 'BUY');
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#07966A] text-white hover:bg-[#067a56] transition-colors"
                  >
                    BUY
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION C: Top Movers & Sectorwise Movements (Screenshots 6 & 13) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Movers Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Top Movers
            </h2>

            {/* Sub-tabs: Gainers, Losers, Active */}
            <div className="flex items-center gap-1 bg-[#F3F6FC] dark:bg-[#202228] p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedMoversTab('gainers')}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedMoversTab === 'gainers'
                    ? 'bg-white dark:bg-[#18191D] text-[#07966A] dark:text-[#19B88A] shadow-2xs font-bold'
                    : 'text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setSelectedMoversTab('losers')}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedMoversTab === 'losers'
                    ? 'bg-white dark:bg-[#18191D] text-[#E5484D] dark:text-[#FF6268] shadow-2xs font-bold'
                    : 'text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                Losers
              </button>
              <button
                onClick={() => setSelectedMoversTab('active')}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedMoversTab === 'active'
                    ? 'bg-white dark:bg-[#18191D] text-[#172033] dark:text-[#F4F6FC] shadow-2xs font-bold'
                    : 'text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                Most Active
              </button>
            </div>
          </div>

          {/* Movers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E9F2] dark:border-[#30333B] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <th className="pb-2.5">Stock</th>
                  <th className="pb-2.5">Sector</th>
                  <th className="pb-2.5 text-right">LTP (₹)</th>
                  <th className="pb-2.5 text-right">Change (%)</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F2]/60 dark:divide-[#30333B]/60 font-medium">
                {displayedMovers.map((stock) => {
                  const isPos = (stock.change ?? 0) >= 0;
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                      className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                          {stock.symbol}
                        </div>
                        <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate max-w-[140px]">
                          {stock.name}
                        </div>
                      </td>
                      <td className="py-2.5 text-[#69758A] dark:text-[#A0A7B5] text-[11px]">
                        {stock.sector}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                        ₹{(stock.ltp ?? 0).toFixed(2)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-mono font-semibold ${
                          isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                        }`}
                      >
                        {isPos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTradeModal(stock.symbol, 'BUY');
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white hover:bg-[#3049D8] transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Sectorwise Movements Heatmap */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                Sector Movements
              </h2>
              <span className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">NSE Indices</span>
            </div>

            <div className="space-y-3">
              {sectorPerformance.map((sector) => (
                <div key={sector.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#172033] dark:text-[#F4F6FC]">{sector.name}</span>
                    <span
                      className={`font-mono ${
                        sector.isPositive
                          ? 'text-[#07966A] dark:text-[#19B88A]'
                          : 'text-[#E5484D] dark:text-[#FF6268]'
                      }`}
                    >
                      {sector.isPositive ? '+' : ''}{sector.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#E4E9F2] dark:bg-[#30333B] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sector.isPositive ? 'bg-[#07966A] dark:bg-[#19B88A]' : 'bg-[#E5484D] dark:bg-[#FF6268]'
                      }`}
                      style={{ width: `${Math.min(100, Math.abs(sector.change) * 40)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/markets')}
            className="w-full mt-6 py-2 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] text-xs font-bold text-[#405CF5] dark:text-[#627BFF] transition-colors text-center"
          >
            Explore All 14 Sectors &rsaquo;
          </button>
        </div>
      </section>

      {/* SECTION D: Technical Screeners (Screenshots 6 & 13) */}
      <section className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Technical Screeners
            </h2>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
              Live quantitative algorithmic scans across NIFTY 50 and retail universe.
            </p>
          </div>

          {/* Screener Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setSelectedScreenerFilter('rsi_oversold')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                selectedScreenerFilter === 'rsi_oversold'
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                  : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
              }`}
            >
              Oversold (RSI &lt; 45)
            </button>
            <button
              onClick={() => setSelectedScreenerFilter('rsi_overbought')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                selectedScreenerFilter === 'rsi_overbought'
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                  : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
              }`}
            >
              Overbought (RSI &gt; 65)
            </button>
            <button
              onClick={() => setSelectedScreenerFilter('macd_bullish')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                selectedScreenerFilter === 'macd_bullish'
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                  : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
              }`}
            >
              MACD Bullish
            </button>
            <button
              onClick={() => setSelectedScreenerFilter('golden_cross')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                selectedScreenerFilter === 'golden_cross'
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                  : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
              }`}
            >
              Golden Cross / AI Buy
            </button>
          </div>
        </div>

        {/* Screener Stocks Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(screenerStocks[selectedScreenerFilter] || []).map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
              className="p-3.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/60 dark:bg-[#202228]/60 hover:border-[#405CF5] dark:hover:border-[#627BFF] cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                  {stock.symbol}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF]">
                  RSI: {stock.technicals?.rsi ?? 50}
                </span>
              </div>
              <p className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate mt-1">
                {stock.name}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                  ₹{(stock.ltp ?? 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold text-[#07966A] dark:text-[#19B88A]">
                  {stock.aiSignal || 'BUY'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION E: Trading Signals & AI Recommendations (Screenshots 6 & 13) */}
      <section className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Research & AI Recommendations
            </h2>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
              Quantitative price target forecasts with simulated paper execution buttons.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-prediction')}
            className="text-xs font-bold text-[#405CF5] dark:text-[#627BFF] hover:underline"
          >
            VIEW ALL PICKS &rsaquo;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {researchPicks.map((pick) => (
            <div
              key={pick.symbol}
              className="p-4 rounded-xl border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/50 dark:bg-[#202228]/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                    {pick.symbol}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#07966A] dark:text-[#19B88A]">
                    {pick.upside} Potential
                  </span>
                </div>
                <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate mt-0.5">
                  {pick.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-[#E4E9F2] dark:border-[#30333B]">
                <div>
                  <div className="text-[9px] uppercase text-[#69758A] dark:text-[#A0A7B5]">Target Price</div>
                  <div className="font-bold text-[#07966A] dark:text-[#19B88A]">₹{pick.target.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase text-[#69758A] dark:text-[#A0A7B5]">Stop Loss</div>
                  <div className="font-bold text-[#E5484D] dark:text-[#FF6268]">₹{pick.stopLoss.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openTradeModal(pick.symbol, 'BUY')}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#07966A] hover:bg-[#067a56] text-white shadow-2xs transition-colors"
                >
                  BUY @ ₹{pick.recPrice.toFixed(0)}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/trade?symbol=${pick.symbol}`)}
                  className="p-1.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#405CF5] dark:hover:text-[#627BFF] transition-colors"
                  title="View Chart"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION F: Market News & Corporate Actions (Screenshots 6 & 13) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial News Headlines */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Market News & Sentiment
            </h2>
            <span className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">NLP Scored</span>
          </div>

          <div className="space-y-3">
            {mockNews.slice(0, 4).map((news) => (
              <div
                key={news.id}
                className="p-3 rounded-lg border border-[#E4E9F2]/80 dark:border-[#30333B]/80 hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#69758A] dark:text-[#A0A7B5]">
                    {news.source} • {news.time}
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      news.sentiment === 'Bullish'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#07966A] dark:text-[#19B88A]'
                        : news.sentiment === 'Bearish'
                        ? 'bg-red-50 dark:bg-red-950/40 text-[#E5484D] dark:text-[#FF6268]'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {news.sentiment}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC] mt-1.5 leading-snug">
                  {news.headline}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Corporate Actions */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Corporate Actions
            </h2>
            <span className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">Oct - Nov 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E9F2] dark:border-[#30333B] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <th className="pb-2.5">Company</th>
                  <th className="pb-2.5">Event</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5 text-right">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F2]/60 dark:divide-[#30333B]/60 font-medium">
                {corporateActions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                    <td className="py-2.5 font-bold text-[#172033] dark:text-[#F4F6FC]">
                      {item.company}
                    </td>
                    <td className="py-2.5 text-[#405CF5] dark:text-[#627BFF] font-semibold text-[11px]">
                      {item.event}
                    </td>
                    <td className="py-2.5 text-[#69758A] dark:text-[#A0A7B5] text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-2.5 text-right text-[#172033] dark:text-[#F4F6FC] text-[11px]">
                      {item.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#405CF5] dark:text-[#627BFF] shrink-0 mt-0.5" />
        <div className="text-xs text-[#69758A] dark:text-[#A0A7B5] leading-relaxed">
          <strong className="text-[#172033] dark:text-[#F4F6FC]">StockSense-AI Simulation Disclaimer:</strong>{' '}
          All prices, trades, market indices, and AI scores are generated for paper trading simulation, financial quantitative analysis, and educational research only. No real financial capital or live exchange trades are executed.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
