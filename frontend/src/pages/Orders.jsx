import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Bell,
  Trash2,
  Plus,
  Compass,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { PersistentWatchlist } from '../components/watchlist/PersistentWatchlist';

export const Orders = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { orders, cancelOrder, openTradeModal, refreshAll } = useTrading();

  // Tabs matching Angel One reference (Screenshots 3 & 10):
  // 'open' | 'history' | 'sip' | 'gtt' | 'basket' | 'alerts'
  const [activeTab, setActiveTab] = useState('open');
  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Open orders vs Completed orders
  const openOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'OPEN');
  const historicalOrders = orders.filter((o) => o.status !== 'PENDING' && o.status !== 'OPEN');

  const filteredHistory = historicalOrders.filter((o) => {
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      o.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.id && String(o.id).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Simulated Alerts list
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: 'RELIANCE', condition: 'Above', price: 1450.00, status: 'ACTIVE', created: 'Oct 19, 2026' },
    { id: 2, symbol: 'TCS', condition: 'Above', price: 3500.00, status: 'ACTIVE', created: 'Oct 18, 2026' },
    { id: 3, symbol: 'SUZLON', condition: 'Below', price: 38.00, status: 'TRIGGERED', created: 'Oct 15, 2026' },
  ]);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlertSymbol, setNewAlertSymbol] = useState('RELIANCE');
  const [newAlertCondition, setNewAlertCondition] = useState('Above');
  const [newAlertPrice, setNewAlertPrice] = useState(1450);

  const handleCreateAlert = (e) => {
    e.preventDefault();
    setAlerts((prev) => [
      {
        id: Date.now(),
        symbol: newAlertSymbol.toUpperCase(),
        condition: newAlertCondition,
        price: Number(newAlertPrice),
        status: 'ACTIVE',
        created: 'Today',
      },
      ...prev,
    ]);
    setShowAlertModal(false);
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-53px)] overflow-hidden select-none">
      {/* Persistent Left Watchlist */}
      <PersistentWatchlist
        onSelectStock={(sym) => navigate(`/trade?symbol=${sym}`)}
        isCollapsed={isWatchlistCollapsed}
        onToggleCollapse={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
      />

      {/* Main Orders Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F3F6FC] dark:bg-[#101114]">
        {/* Subtabs Bar (Screenshots 3 & 10) */}
        <div className="flex items-center gap-4 border-b border-[#E4E9F2] dark:border-[#30333B] pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'open', label: `Open Orders (${openOrders.length})` },
            { id: 'history', label: `Order History (${historicalOrders.length})` },
            { id: 'sip', label: 'Stock SIP' },
            { id: 'gtt', label: 'GTT' },
            { id: 'basket', label: 'Basket Orders' },
            { id: 'alerts', label: `Alerts (${alerts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1 border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                  : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OPEN ORDERS */}
        {activeTab === 'open' && (
          <div className="space-y-4">
            {openOrders.length > 0 ? (
              <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4">Side</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Qty</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                    {openOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#172033] dark:text-[#F4F6FC]">{ord.id}</td>
                        <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">{ord.time || '10:14 AM'}</td>
                        <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">{ord.symbol}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ord.side === 'BUY' ? 'bg-emerald-100 text-[#07966A]' : 'bg-red-100 text-[#E5484D]'
                            }`}
                          >
                            {ord.side}
                          </span>
                        </td>
                        <td className="py-3 px-4">{ord.type}</td>
                        <td className="py-3 px-4 text-right">{ord.quantity}</td>
                        <td className="py-3 px-4 text-right">₹{(ord.price || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            PENDING
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => cancelOrder(ord.id)}
                            className="px-2.5 py-1 rounded text-xs font-sans font-bold text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Polished Empty State matching Screenshots 3 & 10 */
              <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-center text-[#69758A] dark:text-[#A0A7B5]">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
                    You don't have any open orders
                  </h3>
                  <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">
                    Check stock recommendations and breakout opportunities from AI models.
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
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                Executed Order Book ({filteredHistory.length})
              </h2>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] text-xs text-[#172033] dark:text-[#F4F6FC] rounded-lg px-2.5 py-1 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-[#69758A] dark:text-[#A0A7B5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg pl-8 pr-2.5 py-1 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Side</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Avg Price</th>
                    <th className="py-3 px-4 text-right">Total (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                  {filteredHistory.map((ord) => {
                    const isBuy = (ord.side || ord.type) === 'BUY';
                    const isCompleted = ord.status === 'COMPLETED' || ord.status === 'EXECUTED';

                    return (
                      <tr key={ord.id} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#172033] dark:text-[#F4F6FC]">{ord.id}</td>
                        <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">
                          {ord.date || '2026-10-19'} {ord.time || ''}
                        </td>
                        <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">
                          {ord.symbol}
                        </td>
                        <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">{ord.product || 'CNC'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBuy ? 'bg-emerald-100 text-[#07966A]' : 'bg-red-100 text-[#E5484D]'
                            }`}
                          >
                            {ord.side || ord.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                          {ord.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">₹{(ord.price || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                          ₹{(ord.total || ord.totalValue || (ord.quantity * ord.price)).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-50 text-[#07966A] border border-emerald-200'
                                : 'bg-red-50 text-[#E5484D] border border-red-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK SIP, GTT, BASKET ORDERS (EMPTY/INFO STATES) */}
        {(activeTab === 'sip' || activeTab === 'gtt' || activeTab === 'basket') && (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF] flex items-center justify-center font-bold">
              {activeTab.toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
                No Active {activeTab.toUpperCase()} Schedules
              </h3>
              <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">
                Automated SIP, GTT trigger conditions, and basket paper orders will appear here.
              </p>
            </div>
            <button
              onClick={() => openTradeModal('RELIANCE', 'BUY')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs hover:bg-[#3049D8] transition-colors"
            >
              + Create {activeTab.toUpperCase()} Order
            </button>
          </div>
        )}

        {/* TAB 4: ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                  Price Alerts ({alerts.length})
                </h2>
                <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
                  Automated threshold notifications on stock market movements.
                </p>
              </div>

              <button
                onClick={() => setShowAlertModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Alert</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F6FC] dark:bg-[#202228] text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                  <tr>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4 text-right">Trigger Price</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]/70 dark:divide-[#30333B]/70 font-mono">
                  {alerts.map((al) => (
                    <tr key={al.id} className="hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-[#172033] dark:text-[#F4F6FC]">{al.symbol}</td>
                      <td className="py-3 px-4 font-sans text-[#69758A] dark:text-[#A0A7B5]">{al.condition}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#172033] dark:text-[#F4F6FC]">
                        ₹{al.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            al.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-[#07966A] border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {al.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#69758A] dark:text-[#A0A7B5]">{al.created}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== al.id))}
                          className="p-1 rounded text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Alert */}
        {showAlertModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown p-5 w-full max-w-sm space-y-4">
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
                Create Price Alert
              </h3>

              <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={newAlertSymbol}
                    onChange={(e) => setNewAlertSymbol(e.target.value)}
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
                      value={newAlertCondition}
                      onChange={(e) => setNewAlertCondition(e.target.value)}
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
                      value={newAlertPrice}
                      onChange={(e) => setNewAlertPrice(e.target.value)}
                      className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-2.5 py-1.5 font-mono font-bold text-[#172033] dark:text-[#F4F6FC] outline-none"
                      required
                    />
                  </div>
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
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white"
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

export default Orders;
