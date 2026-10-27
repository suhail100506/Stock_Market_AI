import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Search,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  BarChart2,
  PieChart,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { mockNews } from '../data/mockNews';

export const Markets = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    stocks,
    indices,
    isInWatchlist,
    toggleWatchlist,
    openTradeModal,
    refreshAll,
  } = useTrading();

  // Top Tabs: Equity | Indices | Stocks F&O | Commodities | Market News
  const [activeMarketTab, setActiveMarketTab] = useState('equity');
  const [activeCategory, setActiveCategory] = useState('all'); // all, gainers, losers, ai, active
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('volume'); // 'symbol' | 'ltp' | 'changePercent' | 'volume'
  const [sortAsc, setSortAsc] = useState(false);

  // Extract unique sectors
  const sectors = ['ALL', ...new Set(stocks.map((s) => (s.sector ? s.sector.split('/')[0].trim() : '')))].filter(
    Boolean
  );

  // Filter & Sort Equities
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector =
      sectorFilter === 'ALL' || (stock.sector && stock.sector.toLowerCase().includes(sectorFilter.toLowerCase()));

    const isPos = (stock.changePercent ?? 0) >= 0;
    if (activeCategory === 'gainers') return matchesSearch && matchesSector && isPos;
    if (activeCategory === 'losers') return matchesSearch && matchesSector && !isPos;
    if (activeCategory === 'ai') return matchesSearch && matchesSector && stock.aiSignal?.includes('BUY');
    if (activeCategory === 'active') return matchesSearch && matchesSector && parseFloat(stock.volume || '0') > 10;

    return matchesSearch && matchesSector;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'volume') {
      valA = parseFloat(a.volume || '0');
      valB = parseFloat(b.volume || '0');
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // F&O Contracts Mock Universe
  const fnoContracts = [
    { symbol: 'NIFTY', expiry: '28 OCT 2026', strike: 24000, type: 'CE', ltp: 165.40, change: 12.8, oi: '3.4M', pcr: 0.92 },
    { symbol: 'NIFTY', expiry: '28 OCT 2026', strike: 23800, type: 'PE', ltp: 112.10, change: -18.4, oi: '4.1M', pcr: 1.15 },
    { symbol: 'BANKNIFTY', expiry: '30 OCT 2026', strike: 51500, type: 'CE', ltp: 340.00, change: 24.5, oi: '1.8M', pcr: 0.88 },
    { symbol: 'BANKNIFTY', expiry: '30 OCT 2026', strike: 51000, type: 'PE', ltp: 285.50, change: -14.2, oi: '2.5M', pcr: 1.08 },
    { symbol: 'RELIANCE', expiry: '28 OCT 2026', strike: 1440, type: 'CE', ltp: 28.50, change: -2.1, oi: '850K', pcr: 0.74 },
    { symbol: 'TCS', expiry: '28 OCT 2026', strike: 3500, type: 'CE', ltp: 45.20, change: 6.8, oi: '420K', pcr: 1.22 },
  ];

  // Commodities Mock
  const commodities = [
    { name: 'Gold (MCX 10g)', symbol: 'GOLD', ltp: 78450.00, change: 320.00, changePercent: 0.41, unit: '10 Grams' },
    { name: 'Silver (MCX 1kg)', symbol: 'SILVER', ltp: 94800.00, change: -540.00, changePercent: -0.57, unit: '1 Kg' },
    { name: 'Crude Oil (MCX bbl)', symbol: 'CRUDEOIL', ltp: 6150.00, change: 85.00, changePercent: 1.40, unit: '1 Barrel' },
    { name: 'Natural Gas (MCX mmBtu)', symbol: 'NATGAS', ltp: 245.80, change: -4.20, changePercent: -1.68, unit: '1 mmBtu' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#172033] dark:text-[#F4F6FC]">
            Market Discovery & Scanner
          </h1>
          <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
            Real-time simulated quotes across NSE equities, indices, derivatives, and commodities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="p-2 rounded-lg bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] transition-colors"
            title="Refresh Quotes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#172033] dark:text-[#F4F6FC]">
            <span className="w-2 h-2 rounded-full bg-[#07966A] animate-pulse" />
            <span>NSE/BSE Active</span>
          </div>
        </div>
      </div>

      {/* Main Market Tabs (Equity, Indices, Stocks F&O, Commodities, News) */}
      <div className="flex items-center gap-2 border-b border-[#E4E9F2] dark:border-[#30333B] pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
        {[
          { id: 'equity', label: 'Equity' },
          { id: 'indices', label: 'Indices' },
          { id: 'fno', label: 'Stocks F&O' },
          { id: 'commodities', label: 'Commodities' },
          { id: 'news', label: 'Market News' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMarketTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-all shrink-0 ${
              activeMarketTab === tab.id
                ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs'
                : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EQUITY DISCOVERY & FULL SCREENER */}
      {activeMarketTab === 'equity' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filters, Sector Selector */}
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#172033] dark:text-[#F4F6FC] placeholder-[#69758A] dark:placeholder-[#64748B] outline-none transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                    : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                All Equities ({stocks.length})
              </button>
              <button
                onClick={() => setActiveCategory('gainers')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeCategory === 'gainers'
                    ? 'bg-[#07966A] text-white'
                    : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#07966A] dark:text-[#19B88A]'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setActiveCategory('losers')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeCategory === 'losers'
                    ? 'bg-[#E5484D] text-white'
                    : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#E5484D] dark:text-[#FF6268]'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setActiveCategory('ai')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeCategory === 'ai'
                    ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                    : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                AI Strong Buy
              </button>
            </div>

            {/* Sector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#69758A] dark:text-[#A0A7B5] font-semibold shrink-0">Sector:</span>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] text-xs text-[#172033] dark:text-[#F4F6FC] rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Equities Table */}
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F6FC] dark:bg-[#202228] border-b border-[#E4E9F2] dark:border-[#30333B] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <tr>
                    <th className="py-3 px-3 w-8 text-center">Fav</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-[#172033] dark:hover:text-[#F4F6FC]"
                      onClick={() => handleSort('symbol')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Company & Symbol</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Sector</th>
                    <th
                      className="py-3 px-3 text-right cursor-pointer hover:text-[#172033] dark:hover:text-[#F4F6FC]"
                      onClick={() => handleSort('ltp')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>LTP (₹)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 text-right cursor-pointer hover:text-[#172033] dark:hover:text-[#F4F6FC]"
                      onClick={() => handleSort('changePercent')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Change (%)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-right">Volume</th>
                    <th className="py-3 px-3 text-right">Market Cap</th>
                    <th className="py-3 px-3 text-center">AI Signal</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-medium">
                  {sortedStocks.map((stock) => {
                    const isPos = (stock.changePercent ?? 0) >= 0;
                    const isFav = isInWatchlist(stock.symbol);

                    return (
                      <tr
                        key={stock.symbol}
                        onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                        className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className="text-[#69758A] dark:text-[#A0A7B5] hover:text-amber-500"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`}
                            />
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#172033] dark:text-[#F4F6FC] flex items-center gap-1.5">
                            <span>{stock.symbol}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border border-[#E4E9F2] dark:border-[#30333B]">
                              {stock.exchange || 'NSE'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate max-w-[180px]">
                            {stock.name}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#69758A] dark:text-[#A0A7B5] text-[11px]">
                          {stock.sector}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                          ₹{(stock.ltp ?? 0).toFixed(2)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                          }`}
                        >
                          {isPos ? '+' : ''}{(stock.change ?? 0).toFixed(2)} ({isPos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#69758A] dark:text-[#A0A7B5]">
                          {stock.volume || '1.2M'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#69758A] dark:text-[#A0A7B5]">
                          {stock.marketCap || '₹50,000 Cr'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              stock.aiSignal?.includes('BUY')
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#07966A] dark:text-[#19B88A] border border-emerald-200 dark:border-emerald-800/40'
                                : stock.aiSignal?.includes('SELL')
                                ? 'bg-red-50 dark:bg-red-950/40 text-[#E5484D] dark:text-[#FF6268] border border-red-200 dark:border-red-800/40'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {stock.aiSignal || 'HOLD'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTradeModal(stock.symbol, 'BUY')}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-[#07966A] hover:bg-[#067a56] text-white shadow-2xs transition-colors"
                            >
                              BUY
                            </button>
                            <button
                              type="button"
                              onClick={() => openTradeModal(stock.symbol, 'SELL')}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-[#E5484D] hover:bg-[#c93b40] text-white shadow-2xs transition-colors"
                            >
                              SELL
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                              className="p-1 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#405CF5] dark:hover:text-[#627BFF] transition-colors"
                              title="TradeOne Chart"
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDICES OVERVIEW TABLE */}
      {activeMarketTab === 'indices' && (
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B]">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Indian Benchmark Indices
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                <tr>
                  <th className="py-3 px-4">Index</th>
                  <th className="py-3 px-4">LTP</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Change (%)</th>
                  <th className="py-3 px-4">Day Low</th>
                  <th className="py-3 px-4">Day High</th>
                  <th className="py-3 px-4 text-right">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                {indices.map((idx) => {
                  const isPos = idx.change >= 0;
                  return (
                    <tr key={idx.symbol} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                        {idx.symbol}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#172033] dark:text-[#F4F6FC]">
                        {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${isPos ? 'text-[#07966A]' : 'text-[#E5484D]'}`}>
                        {isPos ? '+' : ''}{idx.change.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${isPos ? 'text-[#07966A]' : 'text-[#E5484D]'}`}>
                        {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">
                        {(idx.low || idx.value * 0.99).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">
                        {(idx.high || idx.value * 1.01).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate('/trade')}
                          className="px-2.5 py-1 rounded text-xs font-sans font-bold text-[#405CF5] dark:text-[#627BFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCKS F&O (DERIVATIVES) */}
      {activeMarketTab === 'fno' && (
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                NSE Equity Derivatives (F&O)
              </h2>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
                Simulated futures and options open interest chains for paper trading.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF]">
              OCT 2026 Monthly Expiry
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                <tr>
                  <th className="py-3 px-4">Contract</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Strike</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">LTP (₹)</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-right">Open Interest</th>
                  <th className="py-3 px-4 text-right">PCR</th>
                  <th className="py-3 px-4 text-right">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                {fnoContracts.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                      {c.symbol}
                    </td>
                    <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">{c.expiry}</td>
                    <td className="py-3 px-4 font-bold text-[#172033] dark:text-[#F4F6FC]">{c.strike}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.type === 'CE' ? 'bg-emerald-100 text-[#07966A]' : 'bg-red-100 text-[#E5484D]'
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                      ₹{c.ltp.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${c.change >= 0 ? 'text-[#07966A]' : 'text-[#E5484D]'}`}>
                      {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#69758A] dark:text-[#A0A7B5]">{c.oi}</td>
                    <td className="py-3 px-4 text-right text-[#69758A] dark:text-[#A0A7B5]">{c.pcr}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openTradeModal(c.symbol, 'BUY')}
                        className="px-2.5 py-1 rounded text-xs font-sans font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white hover:bg-[#3049D8] transition-colors"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMMODITIES */}
      {activeMarketTab === 'commodities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commodities.map((comm) => {
            const isPos = comm.change >= 0;
            return (
              <div
                key={comm.symbol}
                className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                    {comm.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                    }`}
                  >
                    {isPos ? '+' : ''}{comm.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="font-mono text-lg font-bold text-[#172033] dark:text-[#F4F6FC]">
                  ₹{comm.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between text-xs text-[#69758A] dark:text-[#A0A7B5]">
                  <span>Unit: {comm.unit}</span>
                  <span className={`font-mono font-semibold ${isPos ? 'text-[#07966A]' : 'text-[#E5484D]'}`}>
                    {isPos ? '+' : ''}₹{comm.change.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: MARKET NEWS */}
      {activeMarketTab === 'news' && (
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Financial News & Sentiment Feed
            </h2>
            <span className="text-xs text-[#69758A] dark:text-[#A0A7B5]">Updated 2m ago</span>
          </div>

          <div className="divide-y divide-[#E4E9F2] dark:divide-[#30333B]">
            {mockNews.map((news) => (
              <div key={news.id} className="py-3 hover:bg-[#F3F6FC] dark:hover:bg-[#202228] p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#405CF5] dark:text-[#627BFF]">
                    {news.source} • {news.time}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC] mt-1">
                  {news.headline}
                </h3>
                <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">
                  {news.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Markets;
