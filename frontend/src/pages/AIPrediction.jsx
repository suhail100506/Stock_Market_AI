import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Cpu,
  Activity,
  RefreshCw,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { AIStockTerminal } from '../components/ai/AIStockTerminal';
import { ModelPerformanceDashboard } from '../components/ai/ModelPerformanceDashboard';
import { AIPredictionCard } from '../components/ai/AIPredictionCard';
import { SentimentGauge } from '../components/ai/SentimentGauge';
import { LoadingSpinner, SkeletonCard } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const AIPrediction = () => {
  const { stocks, isLoading, error, refreshAll } = useTrading();
  const [filterSignal, setFilterSignal] = useState('ALL'); // ALL, STRONG BUY, BUY, HOLD, SELL

  const filteredStocks = stocks.filter((s) => {
    if (filterSignal === 'ALL') return true;
    return s.aiSignal?.includes(filterSignal);
  });

  const highConvictionBuys = stocks.filter((s) => s.aiSignal?.includes('BUY'));

  return (
    <div className="space-y-8">
      {/* AI Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] shadow-xs overflow-hidden transition-colors">
        {/* Subtle decorative background tints */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF] border border-blue-200 dark:border-blue-900/40 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#405CF5] dark:text-[#627BFF]" />
            <span>Quantitative Machine Learning Engine • XGBoost Primary</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#172033] dark:text-[#F4F6FC] tracking-tight">
            AI Stock Prediction & Directional Forecaster
          </h1>

          <p className="text-sm text-[#69758A] dark:text-[#A0A7B5] leading-relaxed">
            Multi-factor machine learning models evaluating price momentum (RSI, MACD, SMA20, SMA50, EMA), volume liquidity, and volatility regimes. Chronologically trained with zero temporal lookahead leakage.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-[#69758A] dark:text-[#A0A7B5]">
            <span className="flex items-center gap-1.5 text-[#07966A] dark:text-[#19B88A] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#07966A] dark:bg-[#19B88A] animate-pulse" />
              Directional Accuracy (2025 Test Partition)
            </span>
            <span>• {stocks.length} Equities Scanned</span>
            <span>• Chronological Train / Val / Test Split</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={refreshAll} />}

      {/* Flagship AI Stock Terminal */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-[#F4F6FC] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#405CF5] dark:text-[#627BFF]" />
              Dedicated AI Prediction Terminal
            </h2>
            <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
              Target price forecasting, confidence interval, and multi-factor technical analysis.
            </p>
          </div>
        </div>

        <AIStockTerminal defaultSymbol="TCS" />
      </div>

      {/* Top Intelligence Stats & Sentiment Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#69758A] dark:text-[#A0A7B5] text-xs font-semibold uppercase">
              <span>Bullish Signals</span>
              <TrendingUp className="w-4 h-4 text-[#07966A] dark:text-[#19B88A]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold font-mono text-[#07966A] dark:text-[#19B88A]">
                {highConvictionBuys.length}
              </div>
              <div className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">Out of {stocks.length} equities scanned</div>
            </div>
            <div className="text-[11px] text-[#07966A] dark:text-[#19B88A] font-semibold font-mono">
              High conviction momentum
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#69758A] dark:text-[#A0A7B5] text-xs font-semibold uppercase">
              <span>Champion Model</span>
              <Activity className="w-4 h-4 text-[#405CF5] dark:text-[#627BFF]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold font-mono text-[#172033] dark:text-[#F4F6FC]">XGBoost</div>
              <div className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">Gradient Boosted Trees</div>
            </div>
            <div className="text-[11px] text-[#405CF5] dark:text-[#627BFF] font-semibold font-mono">
              Chronological 2025 Test Set
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#69758A] dark:text-[#A0A7B5] text-xs font-semibold uppercase">
              <span>Market Regime</span>
              <Cpu className="w-4 h-4 text-[#405CF5] dark:text-[#627BFF]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold font-mono text-[#172033] dark:text-[#F4F6FC]">Low VIX</div>
              <div className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">India VIX @ 14.77 (+6.1%)</div>
            </div>
            <div className="text-[11px] text-[#07966A] dark:text-[#19B88A] font-semibold font-mono">
              Optimal for trend continuation
            </div>
          </div>
        </div>

        <div>
          <SentimentGauge score={0.78} label="Strong Bullish" positivePct={84} />
        </div>
      </div>

      {/* Model Performance Diagnostics Dashboard */}
      <ModelPerformanceDashboard symbol="TCS" />

      {/* Filter Tabs for Market-Wide AI Predictions */}
      <div className="space-y-6 pt-4 border-t border-[#E4E9F2] dark:border-[#30333B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172033] dark:text-[#F4F6FC] tracking-tight">Active Universe Predictions</h2>
            <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-0.5">
              Browse all NSE/BSE equities scored by the StockSense-AI multi-factor engine.
            </p>
          </div>

          <div className="flex bg-[#F3F6FC] dark:bg-[#202228] rounded-xl p-1 border border-[#E4E9F2] dark:border-[#30333B] self-start sm:self-auto">
            {['ALL', 'STRONG BUY', 'BUY', 'HOLD', 'SELL'].map((sig) => (
              <button
                key={sig}
                onClick={() => setFilterSignal(sig)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterSignal === sig
                    ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-xs'
                    : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
                }`}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of AI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredStocks.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={`No ${filterSignal} Signals Found`}
            description="Try selecting a different signal tier or scan all equities."
            actionLabel="Show All Signals"
            onAction={() => setFilterSignal('ALL')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock) => (
              <AIPredictionCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Regulatory & Risk Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start sm:items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-xs sm:text-sm font-medium text-amber-900 leading-relaxed">
          AI predictions are experimental quantitative models for simulated paper trading and research, not financial advice.
        </p>
      </div>
    </div>
  );
};
