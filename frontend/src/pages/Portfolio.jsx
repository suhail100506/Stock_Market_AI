import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  RefreshCw,
  PlusCircle,
  PieChart,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  ExternalLink,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { PersistentWatchlist } from '../components/watchlist/PersistentWatchlist';

export const Portfolio = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    holdings,
    positions,
    virtualCash,
    investedValue,
    currentHoldingsValue,
    totalHoldingsPnL,
    holdingsPnLPct,
    positionsPnL,
    totalPortfolioValue,
    totalDayPnL,
    openTradeModal,
    resetVirtualPortfolio,
    refreshAll,
  } = useTrading();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'equity' | 'mutualfunds'
  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isOverallPos = totalHoldingsPnL >= 0;
  const isDayPos = totalDayPnL >= 0;

  const filteredHoldings = holdings.filter(
    (h) =>
      h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex h-[calc(100vh-53px)] overflow-hidden select-none">
      {/* Persistent Left Watchlist */}
      <PersistentWatchlist
        onSelectStock={(sym) => navigate(`/trade?symbol=${sym}`)}
        isCollapsed={isWatchlistCollapsed}
        onToggleCollapse={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
      />

      {/* Main Portfolio Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F3F6FC] dark:bg-[#101114]">
        {/* Top Summary Banner (Screenshots 4 & 11) */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E9F2] dark:border-[#30333B] pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-[#172033] dark:text-[#F4F6FC]">
                  Portfolio Valuation
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF] border border-blue-200 dark:border-blue-900/50">
                  Paper Ledger
                </span>
              </div>
              <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
                Total portfolio net worth: ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetVirtualPortfolio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] transition-colors"
                title="Reset paper wallet back to ₹10,00,000"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to ₹10L</span>
              </button>
              <button
                onClick={() => navigate('/trade')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs hover:bg-[#3049D8] transition-colors"
              >
                <span>+ Invest More</span>
              </button>
            </div>
          </div>

          {/* 4 Primary Financial Metric Tiles (Matching Screenshots 4 & 11) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Invested Amount */}
            <div className="p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B]">
              <span className="text-[11px] font-semibold text-[#69758A] dark:text-[#A0A7B5]">
                Invested Amount
              </span>
              <div className="font-mono text-base sm:text-lg font-bold text-[#172033] dark:text-[#F4F6FC] mt-0.5">
                ₹{investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Current Value */}
            <div className="p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B]">
              <span className="text-[11px] font-semibold text-[#69758A] dark:text-[#A0A7B5]">
                Current Value
              </span>
              <div className="font-mono text-base sm:text-lg font-bold text-[#172033] dark:text-[#F4F6FC] mt-0.5">
                ₹{currentHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Overall Gain / Loss */}
            <div className="p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B]">
              <span className="text-[11px] font-semibold text-[#69758A] dark:text-[#A0A7B5]">
                Overall Gain / Loss
              </span>
              <div
                className={`font-mono text-base sm:text-lg font-bold mt-0.5 flex items-center gap-1.5 ${
                  isOverallPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                }`}
              >
                <span>{isOverallPos ? '+' : ''}₹{totalHoldingsPnL.toFixed(2)}</span>
                <span className="text-xs">({isOverallPos ? '+' : ''}{holdingsPnLPct.toFixed(2)}%)</span>
              </div>
            </div>

            {/* Today's Gain */}
            <div className="p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B]">
              <span className="text-[11px] font-semibold text-[#69758A] dark:text-[#A0A7B5]">
                Today's Gain
              </span>
              <div
                className={`font-mono text-base sm:text-lg font-bold mt-0.5 flex items-center gap-1.5 ${
                  isDayPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                }`}
              >
                <span>{isDayPos ? '+' : ''}₹{totalDayPnL.toFixed(2)}</span>
                <span className="text-xs">(0.18%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Breakup Navigation Tabs: Overview | Equity | Mutual Funds */}
        <div className="flex items-center gap-3 border-b border-[#E4E9F2] dark:border-[#30333B] pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('equity')}
            className={`pb-1 border-b-2 transition-colors ${
              activeTab === 'equity'
                ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
            }`}
          >
            Equity Holdings ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('mutualfunds')}
            className={`pb-1 border-b-2 transition-colors ${
              activeTab === 'mutualfunds'
                ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
            }`}
          >
            Mutual Funds
          </button>
        </div>

        {/* TAB 1: OVERVIEW ASSET BREAKUP (Screenshots 4 & 11) */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Portfolio Breakup Table */}
            <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                  Portfolio Breakup
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF]">
                  100% Paper Allocation
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                    <tr>
                      <th className="py-3 px-4">Asset Type</th>
                      <th className="py-3 px-4 text-right">Invested Amt</th>
                      <th className="py-3 px-4 text-right">Current Value</th>
                      <th className="py-3 px-4 text-right">Overall G/L</th>
                      <th className="py-3 px-4 text-right">Day's G/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                    <tr className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                        Equity Shares ({holdings.length} stocks)
                      </td>
                      <td className="py-3 px-4 text-right">
                        ₹{investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                        ₹{currentHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isOverallPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                        }`}
                      >
                        {isOverallPos ? '+' : ''}₹{totalHoldingsPnL.toFixed(2)} ({isOverallPos ? '+' : ''}{holdingsPnLPct.toFixed(2)}%)
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isDayPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                        }`}
                      >
                        {isDayPos ? '+' : ''}₹{totalDayPnL.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                        Virtual Cash Margin
                      </td>
                      <td className="py-3 px-4 text-right text-[#69758A] dark:text-[#A0A7B5]">—</td>
                      <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                        ₹{virtualCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-[#69758A] dark:text-[#A0A7B5]">—</td>
                      <td className="py-3 px-4 text-right text-[#69758A] dark:text-[#A0A7B5]">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action Equity Card if user wants to invest */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#405CF5] dark:text-[#627BFF] flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">
                    Ready to trade more Indian equities?
                  </div>
                  <div className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                    Explore NIFTY 50 equities, live charts, and AI signals in the market terminal.
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/markets')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs hover:bg-[#3049D8] transition-colors shrink-0"
              >
                INVEST NOW
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED EQUITY HOLDINGS TABLE */}
        {activeTab === 'equity' && (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                Holdings Statement ({holdings.length})
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#69758A] dark:text-[#A0A7B5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search holdings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg pl-8 pr-3 py-1 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none"
                />
              </div>
            </div>

            {filteredHoldings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                    <tr>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4 text-right">Qty</th>
                      <th className="py-3 px-4 text-right">Avg Price</th>
                      <th className="py-3 px-4 text-right">LTP</th>
                      <th className="py-3 px-4 text-right">Cur. Value</th>
                      <th className="py-3 px-4 text-right">P&L (%)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                    {filteredHoldings.map((h) => {
                      const curPrice = h.currentPrice || h.avgPrice;
                      const curVal = curPrice * h.quantity;
                      const invVal = h.avgPrice * h.quantity;
                      const pnl = curVal - invVal;
                      const pnlPct = invVal > 0 ? (pnl / invVal) * 100 : 0;
                      const isUp = pnl >= 0;

                      return (
                        <tr
                          key={h.symbol}
                          onClick={() => navigate(`/trade?symbol=${h.symbol}`)}
                          className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-sans">
                            <div className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                              {h.symbol}
                            </div>
                            <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate max-w-[150px]">
                              {h.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                            {h.quantity}
                          </td>
                          <td className="py-3 px-4 text-right">₹{h.avgPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-bold">₹{curPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                            ₹{curVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              isUp ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                            }`}
                          >
                            {isUp ? '+' : ''}₹{pnl.toFixed(2)} ({isUp ? '+' : ''}{pnlPct.toFixed(2)}%)
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openTradeModal(h.symbol, 'BUY')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#07966A] text-white hover:bg-[#067a56] transition-colors"
                              >
                                BUY MORE
                              </button>
                              <button
                                type="button"
                                onClick={() => openTradeModal(h.symbol, 'SELL')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5484D] text-white hover:bg-[#c93b40] transition-colors"
                              >
                                SELL
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#69758A] dark:text-[#A0A7B5] space-y-3">
                <Briefcase className="w-8 h-8 mx-auto opacity-50 text-[#405CF5] dark:text-[#627BFF]" />
                <p className="font-semibold text-sm text-[#172033] dark:text-[#F4F6FC]">
                  You have not invested in Equity yet.
                </p>
                <button
                  onClick={() => navigate('/markets')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs hover:bg-[#3049D8] transition-colors"
                >
                  INVEST NOW
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MUTUAL FUNDS (SIMULATED) */}
        {activeTab === 'mutualfunds' && (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                  Direct Mutual Funds SIP
                </h2>
                <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
                  Top performing large cap, flexi cap, and index SIP portfolios.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[#07966A] dark:text-[#19B88A]">
                Zero Commission
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Nifty 50 Index Direct Growth', nav: 245.80, cagr: '+16.2%', risk: 'Very High' },
                { name: 'Parag Parikh Flexi Cap Fund', nav: 78.40, cagr: '+19.8%', risk: 'High' },
                { name: 'Mirae Asset Large Cap Fund', nav: 112.50, cagr: '+14.9%', risk: 'Very High' },
              ].map((fund, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/60 dark:bg-[#202228]/60 space-y-2"
                >
                  <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">{fund.name}</div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#69758A] dark:text-[#A0A7B5]">NAV: ₹{fund.nav}</span>
                    <span className="text-[#07966A] dark:text-[#19B88A] font-bold">{fund.cagr} 3Y</span>
                  </div>
                  <button
                    onClick={() => openTradeModal('NIFTY', 'BUY')}
                    className="w-full mt-2 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white"
                  >
                    Start Paper SIP
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pledging & Pay Later (MTF) Cards (Screenshots 4 & 11) */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
            Pledging & Pay Later (MTF)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/50 dark:bg-[#202228]/50 space-y-1">
              <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">
                Pledge Holdings for Extra Margin
              </div>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Increase your simulated trading balance using existing paper equity collateral.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/50 dark:bg-[#202228]/50 space-y-1">
              <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">
                Pay Later with MTF
              </div>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Simulate up to 4x leverage on delivery equity with competitive interest rates.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/50 dark:bg-[#202228]/50 space-y-1">
              <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">
                View Stock Recommendations
              </div>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Discover quantitative trading ideas and breakout setups from our AI models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
