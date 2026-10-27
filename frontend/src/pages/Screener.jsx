import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Search,
  Sparkles,
  Zap,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  Star,
  Activity,
  Layers,
  BarChart2,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';

export const Screener = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { stocks, watchlist, toggleWatchlist, openTradeModal } = useTrading();

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedSignal, setSelectedSignal] = useState('ALL');
  const [selectedRsi, setSelectedRsi] = useState('ALL'); // ALL, OVERSOLD, BULLISH, OVERBOUGHT
  const [preset, setPreset] = useState('ALL'); // ALL, GAINERS, LOSERS, AI_BUY
  const [sortBy, setSortBy] = useState('changePercent'); // changePercent, ltp, peRatio, rsi
  const [sortDir, setSortDir] = useState('desc'); // asc, desc

  // Sectors list
  const sectors = useMemo(() => {
    const set = new Set(stocks.map((s) => s.sector).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [stocks]);

  // Filtered & Sorted Stocks
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        // Search
        if (search) {
          const q = search.toLowerCase();
          const matchSym = s.symbol.toLowerCase().includes(q);
          const matchName = s.name.toLowerCase().includes(q);
          if (!matchSym && !matchName) return false;
        }

        // Sector
        if (selectedSector !== 'ALL' && s.sector !== selectedSector) {
          return false;
        }

        // AI Signal
        if (selectedSignal !== 'ALL') {
          if (!s.aiSignal?.toUpperCase().includes(selectedSignal)) return false;
        }

        // RSI Condition
        const rsiVal = s.technicals?.rsi ?? 50;
        if (selectedRsi === 'OVERSOLD' && rsiVal >= 45) return false;
        if (selectedRsi === 'OVERBOUGHT' && rsiVal <= 65) return false;
        if (selectedRsi === 'BULLISH' && (rsiVal < 50 || rsiVal > 70)) return false;

        // Presets
        const change = s.changePercent ?? 0;
        if (preset === 'GAINERS' && change <= 0) return false;
        if (preset === 'LOSERS' && change >= 0) return false;
        if (preset === 'AI_BUY' && !s.aiSignal?.toUpperCase().includes('BUY')) return false;

        return true;
      })
      .sort((a, b) => {
        let valA, valB;
        if (sortBy === 'changePercent') {
          valA = a.changePercent ?? 0;
          valB = b.changePercent ?? 0;
        } else if (sortBy === 'ltp') {
          valA = a.ltp;
          valB = b.ltp;
        } else if (sortBy === 'peRatio') {
          valA = a.peRatio || 0;
          valB = b.peRatio || 0;
        } else if (sortBy === 'rsi') {
          valA = a.technicals?.rsi || 50;
          valB = b.technicals?.rsi || 50;
        } else {
          valA = a.symbol;
          valB = b.symbol;
        }

        if (sortDir === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [stocks, search, selectedSector, selectedSignal, selectedRsi, preset, sortBy, sortDir]);

  const resetFilters = () => {
    setSearch('');
    setSelectedSector('ALL');
    setSelectedSignal('ALL');
    setSelectedRsi('ALL');
    setPreset('ALL');
    setSortBy('changePercent');
    setSortDir('desc');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] dark:text-[#F4F6FC] tracking-tight">
              Technical Stock Screener
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF] border border-blue-200 dark:border-blue-900/50">
              Live Scanner
            </span>
          </div>
          <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">
            Scan and filter Indian equities by technical momentum, RSI, sector, and AI predictions.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'All Equities' },
            { id: 'GAINERS', label: 'Top Gainers' },
            { id: 'LOSERS', label: 'Top Losers' },
            { id: 'AI_BUY', label: 'AI Buy Signals' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === p.id
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#172033] dark:text-[#F4F6FC] placeholder-[#69758A] dark:placeholder-[#64748B] outline-none"
            />
          </div>

          {/* Sector */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] text-xs text-[#172033] dark:text-[#F4F6FC] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? 'Sector: All' : sec}
                </option>
              ))}
            </select>
          </div>

          {/* AI Signal */}
          <div>
            <select
              value={selectedSignal}
              onChange={(e) => setSelectedSignal(e.target.value)}
              className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] text-xs text-[#172033] dark:text-[#F4F6FC] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="ALL">AI Signal: All</option>
              <option value="STRONG BUY">Strong Buy</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          {/* RSI Filter */}
          <div>
            <select
              value={selectedRsi}
              onChange={(e) => setSelectedRsi(e.target.value)}
              className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] text-xs text-[#172033] dark:text-[#F4F6FC] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="ALL">RSI: Any</option>
              <option value="OVERSOLD">Oversold (&lt;45)</option>
              <option value="BULLISH">Bullish Zone (50-70)</option>
              <option value="OVERBOUGHT">Overbought (&gt;65)</option>
            </select>
          </div>

          {/* Reset Button */}
          <div>
            <button
              onClick={resetFilters}
              className="w-full py-1.5 px-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#69758A] dark:text-[#A0A7B5] pt-2 border-t border-[#E4E9F2] dark:border-[#30333B]">
          <span>
            Showing <strong className="text-[#172033] dark:text-[#F4F6FC] font-mono">{filteredStocks.length}</strong> matching equities
          </span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'changePercent') setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                else { setSortBy('changePercent'); setSortDir('desc'); }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                sortBy === 'changePercent'
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                  : 'text-[#69758A] dark:text-[#A0A7B5]'
              }`}
            >
              % Change {sortBy === 'changePercent' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'ltp') setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                else { setSortBy('ltp'); setSortDir('desc'); }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                sortBy === 'ltp'
                  ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                  : 'text-[#69758A] dark:text-[#A0A7B5]'
              }`}
            >
              Price {sortBy === 'ltp' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {/* Screener Table */}
      <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F6FC] dark:bg-[#202228] border-b border-[#E4E9F2] dark:border-[#30333B] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
              <tr>
                <th className="py-3 px-3">Symbol</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3 text-right">LTP (₹)</th>
                <th className="py-3 px-3 text-right">Change (%)</th>
                <th className="py-3 px-3 text-center">RSI (14)</th>
                <th className="py-3 px-3 text-center">AI Signal</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-medium">
              {filteredStocks.map((stock) => {
                const isPos = (stock.changePercent ?? 0) >= 0;
                const rsi = stock.technicals?.rsi ?? 50;

                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                    className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                        {stock.symbol}
                      </div>
                      <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate max-w-[140px]">
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
                      {isPos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          rsi < 45
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#07966A] dark:text-[#19B88A]'
                            : rsi > 65
                            ? 'bg-red-50 dark:bg-red-950/40 text-[#E5484D] dark:text-[#FF6268]'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF]'
                        }`}
                      >
                        {rsi}
                      </span>
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
                          className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#07966A] hover:bg-[#067a56] text-white shadow-2xs transition-colors"
                        >
                          BUY
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                          className="p-1 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#405CF5] dark:hover:text-[#627BFF] transition-colors"
                          title="Open Chart in TradeOne"
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
  );
};

export default Screener;
