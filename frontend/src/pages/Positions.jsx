import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Layers,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  Shield,
  XCircle,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { PersistentWatchlist } from '../components/watchlist/PersistentWatchlist';

export const Positions = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    positions,
    positionsPnL,
    stocks,
    openTradeModal,
    placeOrder,
    refreshAll,
  } = useTrading();

  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'open'

  // Square off / exit position handler
  const handleSquareOff = async (pos) => {
    const exitSide = pos.side === 'BUY' ? 'SELL' : 'BUY';
    await placeOrder({
      symbol: pos.symbol,
      side: exitSide,
      type: 'MARKET',
      product: pos.product || 'MIS',
      quantity: pos.quantity,
      limitPrice: pos.currentPrice || pos.avgPrice,
    });
  };

  const isPos = positionsPnL >= 0;

  return (
    <div className="flex-1 flex h-[calc(100vh-53px)] overflow-hidden select-none">
      {/* Persistent Left Watchlist */}
      <PersistentWatchlist
        onSelectStock={(sym) => navigate(`/trade?symbol=${sym}`)}
        isCollapsed={isWatchlistCollapsed}
        onToggleCollapse={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
      />

      {/* Main Positions Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F3F6FC] dark:bg-[#101114]">
        {/* Positions Header & Subtabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E9F2] dark:border-[#30333B] pb-3">
          <div className="flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('today')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'today'
                  ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                  : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
            >
              Today's Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'open'
                  ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                  : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
            >
              Open Intraday Positions
            </button>
          </div>

          {positions.length > 0 && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#69758A] dark:text-[#A0A7B5]">Net P&L:</span>
              <span
                className={`font-bold text-sm ${
                  isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                }`}
              >
                {isPos ? '+' : ''}₹{positionsPnL.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Positions Table or Empty State (Screenshots 2 & 9) */}
        {positions.length > 0 ? (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <tr>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Side</th>
                    <th className="py-3 px-4 text-right">Net Qty</th>
                    <th className="py-3 px-4 text-right">Avg Entry</th>
                    <th className="py-3 px-4 text-right">LTP (₹)</th>
                    <th className="py-3 px-4 text-right">Unrealized P&L</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                  {positions.map((pos, idx) => {
                    const ltp = pos.currentPrice || pos.avgPrice;
                    const pnl = (ltp - pos.avgPrice) * pos.quantity * (pos.side === 'BUY' ? 1 : -1);
                    const isWin = pnl >= 0;

                    return (
                      <tr
                        key={idx}
                        onClick={() => navigate(`/trade?symbol=${pos.symbol}`)}
                        className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                          {pos.symbol}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border border-[#E4E9F2] dark:border-[#30333B]">
                            {pos.product || 'INTRADAY MIS'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === 'BUY' ? 'bg-emerald-100 text-[#07966A]' : 'bg-red-100 text-[#E5484D]'
                            }`}
                          >
                            {pos.side}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                          {pos.quantity}
                        </td>
                        <td className="py-3 px-4 text-right">₹{pos.avgPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold">₹{ltp.toFixed(2)}</td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            isWin ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                          }`}
                        >
                          {isWin ? '+' : ''}₹{pnl.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSquareOff(pos)}
                            className="px-2.5 py-1 rounded text-xs font-sans font-bold text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Polished Empty State matching Screenshots 2 & 9 */
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-14 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-center text-[#69758A] dark:text-[#A0A7B5]">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
                You do not have any positions
              </h3>
              <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">
                List of all your positions for today will appear here.
              </p>
            </div>
            <button
              onClick={() => navigate('/markets')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs hover:bg-[#3049D8] transition-colors"
            >
              VIEW TRADING IDEAS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Positions;
