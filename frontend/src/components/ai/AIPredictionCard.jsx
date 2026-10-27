import React from 'react';
import {
  Sparkles,
  Target,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const AIPredictionCard = ({ stock }) => {
  const { openTradeModal } = useTrading();

  if (!stock) return null;

  const ltp = stock.currentPrice ?? stock.current_price ?? stock.ltp ?? 0;
  const predictedPrice = stock.predictedPrice ?? stock.predicted_price ?? stock.aiTargetPrice ?? ltp;
  const confidencePct =
    stock.confidencePct ??
    stock.aiConfidence ??
    (stock.confidence <= 1.0 ? Math.round(stock.confidence * 100) : stock.confidence) ??
    75;

  const isBullish = (stock.signal || stock.aiSignal)?.includes('BUY') || stock.direction === 'UP';
  const isBearish = (stock.signal || stock.aiSignal)?.includes('SELL') || stock.direction === 'DOWN';
  const direction = stock.direction || (isBullish ? 'UP' : 'DOWN');

  const upside = ltp > 0 ? (((predictedPrice - ltp) / ltp) * 100).toFixed(1) : '0.0';
  const stopLossPrice = stock.aiStopLoss ?? ltp * 0.965;
  const stopLossPct = ltp > 0 ? (((ltp - stopLossPrice) / ltp) * 100).toFixed(1) : '3.5';

  return (
    <div className="bg-white border border-[#E5E7EB] hover:border-blue-300 rounded-2xl p-5 shadow-xs hover:shadow-card-hover transition-all flex flex-col justify-between">
      {/* Top Banner: Symbol & AI Signal Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#111827] group-hover:text-[#2563EB] transition-colors">
                {stock.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] font-mono border border-[#E5E7EB]">
                {stock.sector}
              </span>
            </div>
            <div className="text-xs text-[#6B7280] font-medium truncate mt-0.5">{stock.name}</div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isBullish
                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                  : isBearish
                  ? 'bg-red-50 text-[#DC2626] border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stock.aiSignal || 'BUY'}</span>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                direction === 'UP'
                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                  : 'bg-red-50 text-[#DC2626] border border-red-200'
              }`}
            >
              {direction === 'UP' ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#16A34A]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#DC2626]" />
              )}
              <span>ML: {direction}</span>
            </div>
          </div>
        </div>

        {/* Confidence & Price Target Bar */}
        <div className="my-4 bg-[#F7F9FC] rounded-xl p-3.5 border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280] font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
              Model Confidence
            </span>
            <span className="font-bold font-mono text-[#2563EB]">{confidencePct}%</span>
          </div>

          {/* Confidence Meter Bar */}
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>

          {/* Target & Stop Loss Levels */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2 rounded-lg bg-white border border-[#E5E7EB]">
              <div className="text-[10px] text-[#6B7280] font-semibold uppercase flex items-center gap-1">
                <Target className="w-3 h-3 text-[#16A34A]" />
                Predicted Price
              </div>
              <div className="text-sm font-bold font-mono text-[#16A34A] mt-0.5">
                ₹{Number(predictedPrice).toFixed(2)}
                <span className="text-[10px] ml-1 font-sans text-emerald-600 font-semibold">
                  (+{upside}%)
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-white border border-[#E5E7EB]">
              <div className="text-[10px] text-[#6B7280] font-semibold uppercase flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
                Stop Loss
              </div>
              <div className="text-sm font-bold font-mono text-[#DC2626] mt-0.5">
                ₹{Number(stopLossPrice).toFixed(2)}
                <span className="text-[10px] ml-1 font-sans text-red-600 font-semibold">
                  (-{stopLossPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Feature Inputs Group */}
          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] text-[#6B7280]">
            <span className="flex items-center gap-1 font-semibold uppercase">
              <Layers className="w-3 h-3 text-[#2563EB]" />
              ML Inputs
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded">RSI</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded">MACD</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded">SMA20/50</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded">EMA</span>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <p className="text-xs text-[#6B7280] leading-relaxed font-normal bg-[#F7F9FC] p-3 rounded-xl border border-[#E5E7EB] mb-4">
          "{stock.aiSummary || 'Quantitative signals indicate positive momentum with low volatility.'}"
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
        <div className="text-xs">
          <span className="text-[#6B7280]">LTP: </span>
          <span className="font-mono font-bold text-[#111827]">₹{stock.ltp.toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={() => openTradeModal(stock.symbol, isBullish ? 'BUY' : 'SELL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs ${
            isBullish
              ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
              : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
          }`}
        >
          <span>Trade on Signal</span>
          {isBullish ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
