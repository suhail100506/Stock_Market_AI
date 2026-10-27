import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Bell,
  Wallet,
  ChevronDown,
  User,
  Sliders,
  Sparkles,
  LogOut,
  Plus,
  Shield,
  Layers,
  FileText,
  Briefcase,
  Activity,
  Menu,
  X,
  Clock,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AppNavbar = ({ onToggleWatchlist, showWatchlistToggle, isWatchlistVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { indices, stocks, virtualCash, openTradeModal, addVirtualFunds } = useTrading();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Dropdown states
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolsRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl + K search hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        const inputEl = searchRef.current?.querySelector('input');
        if (inputEl) inputEl.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredStocks = searchQuery.trim()
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sector.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Markets', path: '/markets' },
    { name: 'TradeOne', path: '/trade' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Orders', path: '/orders' },
    { name: 'Positions', path: '/positions' },
  ];

  const notifications = [
    { id: 1, title: 'Session Active', desc: 'Indian Stock Market simulated trading session open.', time: '5m ago' },
    { id: 2, title: 'AI Prediction Alert', desc: 'XGBoost generated BUY signal for INFY (Target: ₹1,650).', time: '18m ago' },
    { id: 3, title: 'Margin Credited', desc: '₹10,00,000 initial virtual capital verified.', time: '1h ago' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#18191D] border-b border-[#E4E9F2] dark:border-[#30333B] select-none transition-colors duration-200">
      {/* Top Main Navigation Bar */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Primary Indices Ticker */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#405CF5] dark:bg-[#627BFF] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight text-[#172033] dark:text-[#F4F6FC]">
                  StockSense
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF] border border-blue-200 dark:border-blue-900/50">
                  AI
                </span>
              </div>
              <span className="text-[9px] font-semibold text-[#69758A] dark:text-[#A0A7B5] -mt-0.5 tracking-wider">
                PAPER TRADING
              </span>
            </div>
          </div>

          {/* Indices Ticker Strip (Always Visible on Desktop) */}
          <div className="hidden xl:flex items-center gap-4 pl-4 border-l border-[#E4E9F2] dark:border-[#30333B] text-[11px] font-mono">
            {indices.slice(0, 2).map((idx) => {
              const isPos = idx.change >= 0;
              return (
                <div
                  key={idx.symbol}
                  onClick={() => navigate('/markets')}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer transition-colors"
                >
                  <span className="font-bold text-[#69758A] dark:text-[#A0A7B5] font-sans text-[11px]">
                    {idx.symbol}
                  </span>
                  <span className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                    {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-[10px] font-semibold ${
                      isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                    }`}
                  >
                    {isPos ? '+' : ''}{idx.change.toFixed(2)} ({isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for Anything (Ctrl + K)"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] focus:bg-white dark:focus:bg-[#18191D] rounded-lg pl-9 pr-14 py-1.5 text-xs text-[#172033] dark:text-[#F4F6FC] placeholder-[#69758A] dark:placeholder-[#64748B] outline-none transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#69758A] dark:text-[#64748B] bg-white dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              Ctrl+K
            </kbd>
          </div>

          {/* Search Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown z-50 overflow-hidden divide-y divide-[#E4E9F2] dark:divide-[#30333B] max-h-80 overflow-y-auto">
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => {
                  const isUp = (stock.change ?? 0) >= 0;
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => {
                        navigate(`/trade?symbol=${stock.symbol}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-2.5 hover:bg-[#F3F6FC] dark:hover:bg-[#202228] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]">
                          {stock.exchange || 'NSE'}
                        </span>
                        <span className="text-xs text-[#69758A] dark:text-[#A0A7B5] truncate max-w-[150px]">
                          {stock.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                          ₹{(stock.ltp ?? 0).toFixed(2)}
                        </span>
                        <span
                          className={`ml-2 text-[11px] font-mono font-semibold ${
                            isUp ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                          }`}
                        >
                          {isUp ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[#69758A] dark:text-[#A0A7B5]">
                  No matching equities found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center-Right: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                  isActive
                    ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs'
                    : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Tools Dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                toolsOpen
                  ? 'bg-[#F3F6FC] dark:bg-[#202228] text-[#172033] dark:text-[#F4F6FC]'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
            >
              <span>Tools</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {toolsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown z-50 p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/ai-prediction');
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-[#405CF5] dark:text-[#627BFF]" />
                  <div>
                    <div className="font-semibold">AI Insights & Models</div>
                    <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">XGBoost & LSTM forecasts</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigate('/screener');
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left"
                >
                  <Sliders className="w-4 h-4 text-[#405CF5] dark:text-[#627BFF]" />
                  <div>
                    <div className="font-semibold">Technical Screener</div>
                    <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">RSI, MACD & volume scans</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigate('/alerts');
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left"
                >
                  <Bell className="w-4 h-4 text-[#405CF5] dark:text-[#627BFF]" />
                  <div>
                    <div className="font-semibold">Price Alerts</div>
                    <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">Threshold notifications</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin');
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-[#07966A] dark:text-[#19B88A]" />
                  <div>
                    <div className="font-semibold">Admin Dashboard</div>
                    <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">MongoDB health & engine</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Quick Actions, Theme Toggle, Notifications, Account */}
        <div className="flex items-center gap-2.5">
          {/* Virtual Paper Cash Pill */}
          <div
            onClick={() => navigate('/portfolio')}
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            title="Available Virtual Trading Balance"
          >
            <Wallet className="w-3.5 h-3.5 text-[#405CF5] dark:text-[#627BFF]" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#69758A] dark:text-[#A0A7B5]">
                Paper Cash
              </span>
              <span className="text-[11px] font-mono font-bold text-[#172033] dark:text-[#F4F6FC] -mt-0.5">
                ₹{virtualCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Quick Place Order Button */}
          <button
            onClick={() => openTradeModal('RELIANCE', 'BUY')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] hover:bg-[#3049D8] dark:bg-[#627BFF] dark:hover:bg-[#4E68F0] text-white shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Place Order</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-1.5 rounded-lg text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#405CF5] dark:bg-[#627BFF]" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-76 bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown z-50 overflow-hidden divide-y divide-[#E4E9F2] dark:divide-[#30333B]">
                <div className="p-3 bg-[#F3F6FC] dark:bg-[#202228] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC] uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-[#405CF5] dark:text-[#627BFF]">
                    3 New
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-[#E4E9F2] dark:divide-[#30333B]">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">{n.title}</span>
                        <span className="text-[10px] text-[#69758A] dark:text-[#A0A7B5]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#405CF5] text-white flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AM'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#69758A] dark:text-[#A0A7B5]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown z-50 p-2 space-y-1">
                {/* User info banner */}
                <div className="p-2 border-b border-[#E4E9F2] dark:border-[#30333B] pb-2.5 mb-1">
                  <div className="font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                    {user?.name || 'Mohammed Suhail M'}
                  </div>
                  <div className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] truncate">
                    {user?.email || 'trader@stocksense.ai'}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#69758A] dark:text-[#A0A7B5]">
                    <span>Client: SS-90421</span>
                    <span className="text-[#07966A] dark:text-[#19B88A] font-bold">Paper Verified</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate('/account');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left font-medium"
                >
                  <User className="w-3.5 h-3.5 text-[#69758A] dark:text-[#A0A7B5]" />
                  <span>My Account</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left font-medium"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#69758A] dark:text-[#A0A7B5]" />
                  <span>Settings & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    addVirtualFunds(100000);
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#07966A] dark:text-[#19B88A] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors text-left font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add ₹1,00,000 Funds</span>
                </button>

                <div className="border-t border-[#E4E9F2] dark:border-[#30333B] pt-1 mt-1">
                  <button
                    onClick={async () => {
                      await logout();
                      setUserMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#E5484D] dark:text-[#FF6268] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E4E9F2] dark:border-[#30333B] bg-white dark:bg-[#18191D] p-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                    : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="border-t border-[#E4E9F2] dark:border-[#30333B] pt-2 mt-2 space-y-1">
            <button
              onClick={() => {
                navigate('/ai-prediction');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] rounded-lg"
            >
              AI Predictions & Models
            </button>
            <button
              onClick={() => {
                navigate('/account');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-[#172033] dark:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] rounded-lg"
            >
              My Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
