import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Wallet,
  FileText,
  PieChart,
  Download,
  Percent,
  Share2,
  Gift,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Plus,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';

export const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { virtualCash, addVirtualFunds } = useTrading();
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    accessibilityMode,
    setAccessibilityMode,
    reConfirmOrder,
    setReConfirmOrder,
  } = useTheme();

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('100000');
  const [activeReportModal, setActiveReportModal] = useState(null);

  const handleAddFunds = (e) => {
    e.preventDefault();
    const amt = parseFloat(fundAmount) || 100000;
    addVirtualFunds(amt);
    setShowAddFundsModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Top Header matching Screenshots 1 & 8 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#172033] dark:text-[#F4F6FC]">
          My Account
        </h1>

        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#E5484D] dark:text-[#FF6268] hover:underline uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          <span>LOGOUT</span>
        </button>
      </div>

      {/* Profile Card Banner */}
      <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#405CF5] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MS'}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#172033] dark:text-[#F4F6FC]">
              {user?.name || 'Mohammed Suhail M'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => navigate('/profile')}
                className="text-[11px] font-bold text-[#405CF5] dark:text-[#627BFF] uppercase tracking-wider hover:underline"
              >
                VIEW PROFILE
              </button>
              <span className="text-[#69758A] dark:text-[#A0A7B5]">•</span>
              <span className="text-xs text-[#69758A] dark:text-[#A0A7B5]">
                {user?.email || 'mohammed.suhail@stocksense.ai'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-[#69758A] dark:text-[#A0A7B5]">
          <div>Client Code: <strong className="text-[#172033] dark:text-[#F4F6FC]">SS-90421</strong></div>
          <div className="mt-0.5">Member since 2026</div>
        </div>
      </div>

      {/* Add Funds Banner (Screenshots 1 & 8) */}
      <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#69758A] dark:text-[#A0A7B5]">
              Get ready to invest
            </span>
            <div className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
              Virtual Balance: ₹{virtualCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-[#69758A] dark:text-[#A0A7B5]">
              Add virtual funds to start your simulated trading journey with StockSense-AI.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddFundsModal(true)}
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white hover:bg-[#3049D8] shadow-2xs transition-colors shrink-0"
        >
          ADD FUNDS TO START TRADING
        </button>
      </div>

      {/* Section: Reports */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#69758A] dark:text-[#A0A7B5]">
          Reports
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'trades', title: 'Trades & Charges', icon: FileText, desc: 'Simulated STT & brokerage fees' },
            { id: 'statements', title: 'Statements', icon: Wallet, desc: 'Double-entry paper cash ledger' },
            { id: 'pnl', title: 'Profit & Loss', icon: PieChart, desc: 'Realized & MTM returns report' },
            { id: 'download', title: 'Download Reports', icon: Download, desc: 'Export trade history CSV' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveReportModal(item.title)}
                className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4 cursor-pointer hover:border-[#405CF5] dark:hover:border-[#627BFF] transition-all group"
              >
                <Icon className="w-5 h-5 text-[#405CF5] dark:text-[#627BFF] mb-2 group-hover:scale-105 transition-transform" />
                <h4 className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">{item.title}</h4>
                <p className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Pledging & Pay Later */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#69758A] dark:text-[#A0A7B5]">
          Pledging & Pay Later
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">
              Pledge Holdings for Extra Margin
            </h4>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-1">
              Increase your trading balance using paper equity collateral.
            </p>
          </div>
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">MTF</h4>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-1">
              Buy up to 4 times quantity of equity stocks with virtual margin.
            </p>
          </div>
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">Transfer Stocks</h4>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-1">
              Transferring stocks to any paper Demat account quickly and securely.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Quick Settings (Interactive Appearance, Font Size, Accessibility, Order Re-confirm) */}
      <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-5 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4E9F2] dark:border-[#30333B] pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
            Quick Settings
          </h3>
          <span className="text-xs font-bold text-[#405CF5] dark:text-[#627BFF]">
            VIEW ALL &rsaquo;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Appearance Preference */}
          <div className="space-y-2">
            <label className="font-bold text-[#172033] dark:text-[#F4F6FC] block">
              Appearance Preference
            </label>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
              Choose your theme to look the best for your eyes.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-[#405CF5] text-white border-[#405CF5]'
                    : 'border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-[#627BFF] text-white border-[#627BFF]'
                    : 'border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] font-semibold"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="font-bold text-[#172033] dark:text-[#F4F6FC] block">
              Font Size
            </label>
            <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
              Customize your font size as per readability.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`capitalize px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                    fontSize === size
                      ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white border-transparent'
                      : 'border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Enable Accessibility Mode */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B]">
            <div>
              <div className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                Enable Accessibility Mode
              </div>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Turning this on will optimize contrast and keyboard focus.
              </p>
            </div>
            <input
              type="checkbox"
              checked={accessibilityMode}
              onChange={(e) => setAccessibilityMode(e.target.checked)}
              className="w-4 h-4 accent-[#405CF5] cursor-pointer"
            />
          </div>

          {/* Re-Confirm Order */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B]">
            <div>
              <div className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                Re-Confirm Order
              </div>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Show order preview and charges summary before final paper execution.
              </p>
            </div>
            <input
              type="checkbox"
              checked={reConfirmOrder}
              onChange={(e) => setReConfirmOrder(e.target.checked)}
              className="w-4 h-4 accent-[#405CF5] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Paper Trading Regulatory Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-[#69758A] dark:text-[#A0A7B5] leading-relaxed">
          <strong className="text-[#172033] dark:text-[#F4F6FC]">Disclaimer:</strong> StockSense-AI is strictly an educational paper trading simulation platform utilizing virtual currency. We are not a registered broker, do not accept real monetary deposits, and do not route orders to live stock exchanges.
        </div>
      </div>

      {/* Modal: Add Funds */}
      {showAddFundsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
              Add Simulated Virtual Capital
            </h3>
            <p className="text-xs text-[#69758A] dark:text-[#A0A7B5]">
              Select the amount of virtual paper money to credit to your trading wallet.
            </p>

            <form onSubmit={handleAddFunds} className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
                {['50000', '100000', '500000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFundAmount(amt)}
                    className={`py-1.5 rounded-lg border transition-colors ${
                      fundAmount === amt
                        ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white border-transparent'
                        : 'border-[#E4E9F2] dark:border-[#30333B] text-[#172033] dark:text-[#F4F6FC]'
                    }`}
                  >
                    +₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                  Custom Amount (₹)
                </label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-1.5 font-mono font-bold text-xs text-[#172033] dark:text-[#F4F6FC] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFundsModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#07966A] text-white"
                >
                  Credit Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simulated Report View */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown p-5 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
              {activeReportModal}
            </h3>
            <p className="text-xs text-[#69758A] dark:text-[#A0A7B5]">
              Simulated financial statement for user SS-90421. Zero tax liability in paper trading mode.
            </p>
            <div className="p-3 rounded-lg bg-[#F3F6FC] dark:bg-[#202228] text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span>Total Trades Executed:</span>
                <span className="font-bold">14</span>
              </div>
              <div className="flex justify-between">
                <span>Brokerage Fees:</span>
                <span className="font-bold text-[#07966A]">₹0.00 (Free)</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Turnover Charges:</span>
                <span className="font-bold">₹12.40</span>
              </div>
              <div className="flex justify-between">
                <span>Simulated STT:</span>
                <span className="font-bold">₹48.20</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveReportModal(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
