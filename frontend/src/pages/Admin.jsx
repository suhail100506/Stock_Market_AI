import React, { useState } from 'react';
import {
  Shield,
  Database,
  Cpu,
  Users,
  FileText,
  Briefcase,
  Star,
  Activity,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  KeyRound,
  RotateCcw,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrading } from '../context/TradingContext';

export const Admin = () => {
  const { user } = useAuth();
  const { orders, watchlist, holdings, virtualCash, resetVirtualPortfolio, addVirtualFunds } = useTrading();

  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());
  const [mongoStatus, setMongoStatus] = useState('Connected (Active)');

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Admin & System Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>SUPERUSER</span>
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            Real-time inspection of MongoDB collections, FastAPI services, and ML inference pipelines.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-[#2563EB]" />
          <span>Refreshed: {lastRefreshed}</span>
        </button>
      </div>

      {/* Database Collections Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#16A34A]" />
            <h2 className="text-lg font-bold text-[#111827] tracking-tight">
              MongoDB Database: <code className="text-[#2563EB] font-mono">stocksense</code>
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{mongoStatus}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Users Collection */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Active
              </span>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] font-medium">Collection: users</div>
              <div className="text-xl font-bold font-mono text-[#111827] mt-0.5">1+ Accounts</div>
              <p className="text-[11px] text-[#6B7280] mt-1">
                Salted PBKDF2-SHA256 • No plain text
              </p>
            </div>
          </div>

          {/* Orders Collection */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Synced
              </span>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] font-medium">Collection: orders</div>
              <div className="text-xl font-bold font-mono text-[#111827] mt-0.5">{orders.length} Trades</div>
              <p className="text-[11px] text-[#6B7280] mt-1">
                Simulated execution ledger with timestamps
              </p>
            </div>
          </div>

          {/* Portfolio Collection */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Live
              </span>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] font-medium">Collection: portfolio</div>
              <div className="text-xl font-bold font-mono text-[#111827] mt-0.5">{holdings.length} Positions</div>
              <p className="text-[11px] text-[#6B7280] mt-1">
                Paper AUM: ₹{((virtualCash + holdings.reduce((a, b) => a + (b.avgPrice * b.quantity), 0)) / 100000).toFixed(1)}L
              </p>
            </div>
          </div>

          {/* Watchlists Collection */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-rose-50 text-[#DC2626]">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Starred
              </span>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] font-medium">Collection: watchlists</div>
              <div className="text-xl font-bold font-mono text-[#111827] mt-0.5">{watchlist.length} Symbols</div>
              <p className="text-[11px] text-[#6B7280] mt-1">
                TCS, INFY, RELIANCE, HDFC calibrated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Learning Pipeline Monitor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-[#111827] tracking-tight">Machine Learning Model Registry</h2>
          </div>
          <span className="text-xs text-[#6B7280] font-mono">2025 Chronological Out-of-Sample Test Partition</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="extrabold text-[#111827] font-bold text-sm">XGBoost</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-[#16A34A] font-bold">CHAMPION</span>
            </div>
            <div className="text-xs text-[#6B7280]">Directional Accuracy</div>
            <div className="text-2xl font-mono font-extrabold text-[#111827]">53.5%</div>
            <div className="text-[11px] text-[#6B7280] space-y-0.5 pt-1 border-t border-blue-200/60">
              <div className="flex justify-between"><span>Precision:</span><strong className="text-[#111827]">60.9%</strong></div>
              <div className="flex justify-between"><span>Recall:</span><strong className="text-[#111827]">28.9%</strong></div>
              <div className="flex justify-between"><span>F1 Score:</span><strong className="text-[#111827]">39.2%</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] text-sm">LSTM Recurrent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold">DEEP LEARNING</span>
            </div>
            <div className="text-xs text-[#6B7280]">Sequence Window</div>
            <div className="text-2xl font-mono font-extrabold text-[#111827]">10 Steps</div>
            <div className="text-[11px] text-[#6B7280] space-y-0.5 pt-1 border-t border-[#E5E7EB]">
              <div className="flex justify-between"><span>Hidden Dim:</span><strong className="text-[#111827]">32 Units</strong></div>
              <div className="flex justify-between"><span>Features:</span><strong className="text-[#111827]">6 Variates</strong></div>
              <div className="flex justify-between"><span>Loss Metric:</span><strong className="text-[#111827]">MSE / Huber</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] text-sm">Random Forest</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-[#6B7280] font-bold">ENSEMBLE</span>
            </div>
            <div className="text-xs text-[#6B7280]">Directional Accuracy</div>
            <div className="text-2xl font-mono font-extrabold text-[#111827]">52.1%</div>
            <div className="text-[11px] text-[#6B7280] space-y-0.5 pt-1 border-t border-[#E5E7EB]">
              <div className="flex justify-between"><span>Trees (n_est):</span><strong className="text-[#111827]">100</strong></div>
              <div className="flex justify-between"><span>Max Depth:</span><strong className="text-[#111827]">12</strong></div>
              <div className="flex justify-between"><span>F1 Score:</span><strong className="text-[#111827]">37.8%</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] text-sm">Logistic Regression</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-[#6B7280] font-bold">BASELINE</span>
            </div>
            <div className="text-xs text-[#6B7280]">Directional Accuracy</div>
            <div className="text-2xl font-mono font-extrabold text-[#111827]">50.8%</div>
            <div className="text-[11px] text-[#6B7280] space-y-0.5 pt-1 border-t border-[#E5E7EB]">
              <div className="flex justify-between"><span>Regularization:</span><strong className="text-[#111827]">L2 (Ridge)</strong></div>
              <div className="flex justify-between"><span>ROC-AUC:</span><strong className="text-[#111827]">0.521</strong></div>
              <div className="flex justify-between"><span>Convergence:</span><strong className="text-[#111827]">Optimal</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered User Management Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#111827] tracking-tight">Active User Record (MongoDB: users)</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F9FC] text-[11px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3.5 px-4">User ID (_id)</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-right">Paper Balance</th>
                <th className="py-3.5 px-4 text-center">Password Hash</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono text-xs">
              <tr className="hover:bg-[#F7F9FC] transition-colors">
                <td className="py-4 px-4 text-[#2563EB] font-bold">{user?.id || user?._id || 'usr_78912'}</td>
                <td className="py-4 px-4 font-sans font-bold text-[#111827]">{user?.name || 'Arjun Mehta'}</td>
                <td className="py-4 px-4 text-[#6B7280] font-sans">{user?.email || 'arjun.mehta@stocksense.ai'}</td>
                <td className="py-4 px-4 text-right font-bold text-[#16A34A]">
                  ₹{virtualCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-4 px-4 text-center text-[11px] text-[#6B7280]">
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-[#E5E7EB] text-[#6B7280]">pbkdf2:sha256:100000$*</span>
                </td>
                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => addVirtualFunds(100000)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-200 hover:bg-[#2563EB] hover:text-white transition-all font-sans"
                    >
                      +₹1L
                    </button>
                    <button
                      onClick={resetVirtualPortfolio}
                      className="p-1 rounded-lg text-amber-600 hover:bg-amber-50"
                      title="Reset Wallet"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
