import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Star,
  Briefcase,
  FileText,
  Sparkles,
  User,
  Settings,
  PlusCircle,
  Shield,
  X,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { virtualCash, addVirtualFunds } = useTrading();

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Markets', path: '/markets', icon: TrendingUp },
    { name: 'Watchlist', path: '/watchlist', icon: Star },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Orders', path: '/orders', icon: FileText },
    { name: 'AI Prediction', path: '/ai-prediction', icon: Sparkles, badge: 'PRO' },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & App Header */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
            <div
              onClick={() => {
                navigate('/');
                if (onClose) onClose();
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1D4ED8] transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-[#111827]">
                    StockSense
                  </span>
                </div>
                <p className="text-[10px] text-[#6B7280] font-semibold tracking-wide">
                  PAPER TRADING
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        item.path === '/ai-prediction'
                          ? 'bg-blue-100 text-[#2563EB]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Virtual Paper Balance & Disclaimer */}
        <div className="p-4 space-y-3">
          {/* Virtual Balance Card */}
          <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Paper Wallet
              </span>
              <span className="flex items-center gap-1 text-[#16A34A] font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                SIMULATED
              </span>
            </div>

            <div className="text-lg font-bold font-mono text-[#111827]">
              ₹{virtualCash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <button
              type="button"
              onClick={() => addVirtualFunds(100000)}
              className="w-full mt-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 text-[#2563EB] border border-[#E5E7EB] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#2563EB]" />
              Add ₹1,00,000 Funds
            </button>
          </div>

          <div className="px-2 text-[10px] text-[#6B7280] leading-tight flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Virtual simulation. Zero monetary risk.</span>
          </div>
        </div>
      </aside>
    </>
  );
};
