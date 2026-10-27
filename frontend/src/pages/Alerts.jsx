import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { PersistentWatchlist } from '../components/watchlist/PersistentWatchlist';

export const Alerts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { stocks } = useTrading();

  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);
  const paramSymbol = searchParams.get('symbol');

  // Simulated Alert Records
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: 'RELIANCE', condition: 'Above', price: 1450.00, status: 'ACTIVE', created: 'Oct 19, 2026', note: 'Breakout above 50-day EMA' },
    { id: 2, symbol: 'TCS', condition: 'Above', price: 3500.00, status: 'ACTIVE', created: 'Oct 18, 2026', note: 'Resistance test' },
    { id: 3, symbol: 'SUZLON', condition: 'Below', price: 38.00, status: 'TRIGGERED', created: 'Oct 15, 2026', note: 'Support breakdown stop' },
    { id: 4, symbol: 'INFY', condition: 'Above', price: 1550.00, status: 'ACTIVE', created: 'Oct 19, 2026', note: 'AI Bullish Target' },
  ]);

  const [showAlertModal, setShowAlertModal] = useState(Boolean(paramSymbol));
  const [newSymbol, setNewSymbol] = useState(paramSymbol || 'RELIANCE');
  const [newCondition, setNewCondition] = useState('Above');
  const [newPrice, setNewPrice] = useState(
    stocks.find((s) => s.symbol === (paramSymbol || 'RELIANCE'))?.ltp || 1425
  );
  const [newNote, setNewNote] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      symbol: newSymbol.toUpperCase().trim(),
      condition: newCondition,
      price: Number(newPrice),
      status: 'ACTIVE',
      created: 'Today',
      note: newNote || 'Price alert notification',
    };
    setAlerts((prev) => [created, ...prev]);
    setShowAlertModal(false);
    setNewNote('');
  };

  const handleDelete = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const triggeredAlerts = alerts.filter((a) => a.status === 'TRIGGERED');

  return (
    <div className="flex-1 flex h-[calc(100vh-53px)] overflow-hidden select-none">
      {/* Persistent Left Watchlist */}
      <PersistentWatchlist
        onSelectStock={(sym) => navigate(`/trade?symbol=${sym}`)}
        onOpenAlertModal={(sym) => {
          setNewSymbol(sym);
          const st = stocks.find((s) => s.symbol === sym);
          if (st) setNewPrice(st.ltp);
          setShowAlertModal(true);
        }}
        isCollapsed={isWatchlistCollapsed}
        onToggleCollapse={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
      />

      {/* Main Alerts Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F3F6FC] dark:bg-[#101114]">
        {/* Header Bar */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-[#172033] dark:text-[#F4F6FC]">
                Price Alerts & Notifications
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF] border border-blue-200 dark:border-blue-900/40">
                Active Scanner
              </span>
            </div>
            <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
              Automated threshold alerts evaluated against simulated live prices.
            </p>
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white hover:bg-[#3049D8] shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alert</span>
          </button>
        </div>

        {/* Active Alerts Table */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Active Alerts ({activeAlerts.length})
            </h2>
            <span className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">Polling Every Tick</span>
          </div>

          {activeAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <tr>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Current Price</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4 text-right">Trigger Target</th>
                    <th className="py-3 px-4">Note / Strategy</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                  {activeAlerts.map((al) => {
                    const stock = stocks.find((s) => s.symbol === al.symbol);
                    const ltp = stock?.ltp || al.price;

                    return (
                      <tr key={al.id} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                          {al.symbol}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#172033] dark:text-[#F4F6FC]">
                          ₹{ltp.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] font-semibold">
                            Price {al.condition}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#405CF5] dark:text-[#627BFF]">
                          ₹{al.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-sans text-[#69758A] dark:text-[#A0A7B5] truncate max-w-xs">
                          {al.note}
                        </td>
                        <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5] text-[11px]">
                          {al.created}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(al.id)}
                            className="p-1.5 rounded text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#69758A] dark:text-[#A0A7B5] space-y-2">
              <Bell className="w-6 h-6 mx-auto opacity-50" />
              <div>No active alerts configured.</div>
            </div>
          )}
        </div>

        {/* Triggered Alerts History */}
        {triggeredAlerts.length > 0 && (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B]">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                Triggered Alerts History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <tr>
                    <th className="py-2.5 px-4 font-sans">Symbol</th>
                    <th className="py-2.5 px-4">Condition</th>
                    <th className="py-2.5 px-4 text-right">Triggered Price</th>
                    <th className="py-2.5 px-4 font-sans">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]/60 dark:divide-[#30333B]/60">
                  {triggeredAlerts.map((al) => (
                    <tr key={al.id} className="text-[#69758A] dark:text-[#A0A7B5]">
                      <td className="py-2.5 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">{al.symbol}</td>
                      <td className="py-2.5 px-4 font-sans">{al.condition}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">₹{al.price.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#07966A] border border-emerald-200">
                          TRIGGERED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Price Alert */}
        {showAlertModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown p-5 w-full max-w-sm space-y-4">
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
                Create Price Alert
              </h3>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-1.5 uppercase font-bold text-[#172033] dark:text-[#F4F6FC] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                      Condition
                    </label>
                    <select
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-2.5 py-1.5 text-[#172033] dark:text-[#F4F6FC] outline-none"
                    >
                      <option value="Above">Price &gt;=</option>
                      <option value="Below">Price &lt;=</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                      Trigger Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-2.5 py-1.5 font-mono font-bold text-[#172033] dark:text-[#F4F6FC] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                    Alert Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Breakout re-test entry"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-1.5 text-[#172033] dark:text-[#F4F6FC] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white"
                  >
                    Save Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
