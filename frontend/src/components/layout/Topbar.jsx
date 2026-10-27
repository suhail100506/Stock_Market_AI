import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  Inbox,
  LogOut,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { stocksApi } from '../../api/client';

export const Topbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { indices, stocks, virtualCash, totalPortfolioValue, totalHoldingsPnL, openTradeModal } = useTrading();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Market Open Simulation',
      message: 'Indian market session active. Virtual trading enabled.',
      time: '10m ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'AI Signal Update',
      message: 'RELIANCE technical score moved to Bullish (78%).',
      time: '25m ago',
      type: 'success',
    },
    {
      id: 3,
      title: 'Paper Account Credited',
      message: '₹10,00,000 virtual balance available.',
      time: '1h ago',
      type: 'info',
    },
  ]);

  // Live stock search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await stocksApi.getAll({ search: searchQuery });
        setSearchResults(results || []);
      } catch (err) {
        // Fallback filter local stocks
        const filtered = stocks.filter(
          (s) =>
            s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.sector.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, stocks]);

  // Close modals on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/stock/${symbol}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-2xs">
      {/* Top Indices Ticker Strip */}
      <div className="hidden md:flex items-center gap-6 px-6 py-1.5 bg-[#F7F9FC] border-b border-[#E5E7EB] overflow-x-auto text-xs font-mono">
        <div className="flex items-center gap-2 text-[#6B7280] font-sans font-bold text-[11px] shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>NSE/BSE (SIMULATED):</span>
        </div>

        {indices.map((idx) => (
          <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
            <span className="text-[#6B7280] font-semibold">{idx.symbol}</span>
            <span className="text-[#111827] font-bold">{idx.value.toLocaleString('en-IN')}</span>
            <span
              className={`flex items-center text-[11px] font-semibold ${
                idx.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {idx.isPositive ? '+' : ''}
              {idx.change.toFixed(2)} ({idx.isPositive ? '+' : ''}
              {idx.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>

      {/* Main Topbar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Left: Mobile menu & Stock Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Box */}
          <div ref={searchRef} className="relative w-full">
            <div className="relative">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
              ) : (
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
              <input
                type="text"
                placeholder="Search stocks (e.g. RELIANCE, TCS, INFY)..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] focus:border-[#2563EB] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-sm text-[#111827] placeholder-[#6B7280] outline-none transition-all"
              />
            </div>

            {/* Auto-suggest dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E5E7EB] rounded-xl shadow-dropdown overflow-hidden z-50 divide-y divide-[#E5E7EB] max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                    <span>Searching equities...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock.symbol)}
                      className="p-3 hover:bg-[#F7F9FC] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#111827] text-sm">{stock.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] font-mono">
                            {stock.sector}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] truncate mt-0.5">{stock.name}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-[#111827]">
                          ₹{stock.ltp.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-semibold ${
                            stock.change >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}
                        >
                          {stock.change >= 0 ? '+' : ''}
                          {stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center space-y-1">
                    <Inbox className="w-5 h-5 text-[#6B7280] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#111827]">
                      No matching equities found
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Try searching for RELIANCE, TCS, INFY, or HDFC.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Portfolio Value, Notifications, User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Portfolio Value Widget */}
          <div
            onClick={() => navigate('/portfolio')}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB] hover:border-gray-300 cursor-pointer transition-colors"
          >
            <Wallet className="w-4 h-4 text-[#2563EB]" />
            <div>
              <div className="text-[10px] text-[#6B7280] font-semibold uppercase">Portfolio Value</div>
              <div className="text-xs font-bold font-mono text-[#111827] flex items-center gap-1.5">
                <span>₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className={`text-[10px] ${totalHoldingsPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  ({totalHoldingsPnL >= 0 ? '+' : ''}₹{totalHoldingsPnL.toFixed(0)})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Order Button */}
          <button
            onClick={() => openTradeModal('RELIANCE', 'BUY')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs transition-colors"
          >
            <span>+ Place Order</span>
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-dropdown z-50 overflow-hidden divide-y divide-[#E5E7EB]">
                <div className="p-3.5 flex items-center justify-between bg-[#F7F9FC]">
                  <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] text-[#2563EB] font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                    {notifications.length} New
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E7EB]">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-[#F7F9FC] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[#111827]">{n.title}</p>
                        <span className="text-[10px] text-[#6B7280]">{n.time}</span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 text-center bg-[#F7F9FC]">
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-[#6B7280] hover:text-[#111827] font-semibold"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2563EB] border border-blue-200 flex items-center justify-center font-bold text-sm shadow-2xs group-hover:border-[#2563EB] transition-colors">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TR'}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
