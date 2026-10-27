import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Wallet,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  Mail,
  Phone,
  Hash,
  Sliders,
  AlertTriangle,
  LogOut,
  Database,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrading } from '../context/TradingContext';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile } = useAuth();
  const {
    virtualCash,
    addVirtualFunds,
    resetVirtualPortfolio,
    totalPortfolioValue,
    holdings,
    orders,
  } = useTrading();

  const [fundAmount, setFundAmount] = useState('100000');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, email });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddFunds = (amt) => {
    if (!isNaN(amt) && amt > 0) {
      addVirtualFunds(amt);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header with Logout Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              User Profile & Paper Wallet
            </h1>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-semibold">
              <Database className="w-3 h-3" />
              <span>MongoDB / JWT</span>
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            Authenticated via signed JWT with salted hashed credentials stored in MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-[#DC2626] text-[#DC2626] hover:text-white border border-rose-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: User Info Card & Virtual Paper Wallet Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#2563EB] shadow-sm mb-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-[#111827]">{user?.name}</h2>
            <p className="text-xs text-[#2563EB] font-mono mt-0.5">{user?.clientCode || user?.id || user?._id || 'SS-DEMO-01'}</p>

            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{user?.kycStatus || 'Active Paper Trader'}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E5E7EB] text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Account ID</span>
              <span className="font-mono text-[#111827] font-semibold">{user?._id || user?.id || 'usr_demo'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Email Address</span>
              <span className="font-semibold text-[#111827]">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Paper Balance</span>
              <span className="font-mono font-bold text-[#16A34A]">
                ₹{(user?.balance || virtualCash || 1000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Auth Mode</span>
              <span className="text-[#16A34A] font-mono flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>JWT HS256</span>
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Trading Mode</span>
              <span className="font-semibold text-[#111827]">Paper Trading (Simulated)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#6B7280]">Member Since</span>
              <span className="text-[#111827] font-mono">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'October 2026'}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-rose-50 border border-[#E5E7EB] hover:border-rose-200 text-[#6B7280] hover:text-[#DC2626] text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Trading Session</span>
            </button>
          </div>
        </div>

        {/* Right Column (2 Cols): Paper Wallet Manager */}
        <div className="lg:col-span-2 space-y-6">
          {/* Virtual Wallet Box */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Simulated Paper Wallet</h3>
                  <p className="text-xs text-[#6B7280]">Initial allocation: ₹10,00,000 INR • Zero financial risk</p>
                </div>
              </div>

              <button
                onClick={resetVirtualPortfolio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs text-[#6B7280] hover:text-[#111827] transition-colors shadow-sm"
                title="Reset wallet to starting ₹10,00,000"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset to ₹10L</span>
              </button>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <div className="text-xs text-[#6B7280]">Available Paper Cash</div>
                <div className="text-2xl font-extrabold font-mono text-[#111827] mt-1">
                  ₹{virtualCash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#16A34A] font-semibold mt-1">Ready for simulated execution</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <div className="text-xs text-[#6B7280]">Total Portfolio Value</div>
                <div className="text-2xl font-extrabold font-mono text-[#2563EB] mt-1">
                  ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-1">Cash + Equity Holdings</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <div className="text-xs text-[#6B7280]">Total Orders Placed</div>
                <div className="text-2xl font-extrabold font-mono text-[#111827] mt-1">
                  {orders.length}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-1">{holdings.length} Active Positions</div>
              </div>
            </div>

            {/* Add Funds Simulation Strip */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Add Simulated Margin (Virtual Top-up)
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {['50000', '100000', '200000', '500000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAddFunds(parseFloat(amt))}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-mono font-semibold text-[#111827] shadow-sm transition-colors"
                  >
                    +₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#111827]">Account Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2 text-sm text-[#111827] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2 text-sm text-[#111827] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition-all"
                >
                  Save Profile Changes
                </button>

                {savedSuccess && (
                  <span className="text-xs text-[#16A34A] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Updated successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
