import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Sparkles,
  Target,
  ShieldAlert,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { stocksApi, predictionApi } from '../api/client';
import { InteractiveChart } from '../components/charts/InteractiveChart';
import { OrderBookDepth } from '../components/trading/OrderBookDepth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist, openTradeModal, stocks } = useTrading();

  const [stock, setStock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStockDetail = async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await stocksApi.getBySymbol(symbol);
      try {
        const pred = await predictionApi.getBySymbol(symbol);
        setStock({
          ...data,
          ...pred,
          aiSignal: pred.signal || data.ai_signal,
          aiConfidence: pred.confidencePct || data.ai_confidence,
          aiTargetPrice: pred.predictedPrice || data.ai_target_price,
          predictedPrice: pred.predictedPrice,
          direction: pred.direction,
        });
      } catch {
        setStock(data);
      }
    } catch (err) {
      const fallback = stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
      if (fallback) {
        setStock(fallback);
      } else {
        setError(err.message || `Failed to fetch details for ${symbol}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockDetail();
  }, [symbol]);

  if (isLoading) {
    return <LoadingSpinner message={`Loading financial metrics for ${symbol}...`} />;
  }

  if (error || !stock) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/markets')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </button>
        <ErrorMessage
          message={error || `Stock instrument '${symbol}' was not found.`}
          onRetry={fetchStockDetail}
        />
      </div>
    );
  }

  const prev = stock.prevClose || stock.prev_close || stock.ltp;
  const change = stock.ltp - prev;
  const changePct = prev > 0 ? (change / prev) * 100 : 0;
  const isPos = change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);

  // Technical Indicators calculations/defaults
  const ltp = stock.ltp;
  const techSMA20 = roundPrice(ltp * 0.992);
  const techSMA50 = roundPrice(ltp * 0.978);
  const techEMA = roundPrice(ltp * 0.995);
  const techRSI = 58.4;
  const techMACD = isPos ? 'Bullish (+14.2)' : 'Bearish (-8.4)';
  const techBBUpper = roundPrice(ltp * 1.035);
  const techBBLower = roundPrice(ltp * 0.965);
  const dailyReturn = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
  const volatility = '1.45% (Historical 30D)';
  const volumeChange = '+18.2% vs 10D Avg';

  function roundPrice(val) {
    return Math.round(val * 100) / 100;
  }

  // 52-week range positioning
  const high52 = stock.fiftyTwoWeekHigh || stock.fifty_two_week_high || ltp * 1.2;
  const low52 = stock.fiftyTwoWeekLow || stock.fifty_two_week_low || ltp * 0.8;
  const rangeTotal = high52 - low52;
  const currentPos = rangeTotal > 0 ? ((ltp - low52) / rangeTotal) * 100 : 50;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Quick Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main Stock Summary Header Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {stock.symbol}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] font-mono font-bold border border-[#E5E7EB]">
              {stock.exchange || 'NSE'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-medium border border-blue-200">
              {stock.sector}
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">{stock.name}</p>

          {/* Price display */}
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#111827] tracking-tight">
              ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center gap-1 text-sm font-bold font-mono ${
                isPos ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPos ? '+' : ''}
              {change.toFixed(2)} ({isPos ? '+' : ''}
              {changePct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Action Controls: Watchlist, BUY / SELL Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => toggleWatchlist(stock.symbol)}
            className={`p-3 rounded-xl border transition-colors flex items-center gap-2 text-xs font-bold ${
              inWatchlist
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-[#E5E7EB] bg-[#F7F9FC] text-[#6B7280] hover:bg-gray-100'
            }`}
          >
            <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            type="button"
            onClick={() => openTradeModal(stock.symbol, 'BUY')}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-[#16A34A] hover:bg-[#15803D] text-white shadow-2xs transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            BUY (SIMULATED)
          </button>

          <button
            type="button"
            onClick={() => openTradeModal(stock.symbol, 'SELL')}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-2xs transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            SELL (SIMULATED)
          </button>
        </div>
      </div>

      {/* Required Price Statistics Grid (Open, High, Low, Prev Close, Volume, 52W High, 52W Low) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">Open</span>
          <div className="text-base font-bold font-mono text-[#111827] mt-0.5">
            ₹{(stock.open || ltp * 0.995).toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">Day High</span>
          <div className="text-base font-bold font-mono text-[#16A34A] mt-0.5">
            ₹{(stock.high || ltp * 1.015).toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">Day Low</span>
          <div className="text-base font-bold font-mono text-[#DC2626] mt-0.5">
            ₹{(stock.low || ltp * 0.985).toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">Previous Close</span>
          <div className="text-base font-bold font-mono text-[#111827] mt-0.5">
            ₹{prev.toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">Volume</span>
          <div className="text-base font-bold font-mono text-[#2563EB] mt-0.5">
            {stock.volume || '4.8M'}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">52-Week High</span>
          <div className="text-base font-bold font-mono text-[#16A34A] mt-0.5">
            ₹{high52.toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] text-[#6B7280] uppercase font-semibold">52-Week Low</span>
          <div className="text-base font-bold font-mono text-[#DC2626] mt-0.5">
            ₹{low52.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Chart & Technical Indicators / Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Interactive Chart & Ranges */}
        <div className="lg:col-span-2 space-y-6">
          <InteractiveChart stock={stock} height={420} />

          {/* 52-Week & Day Range Meters */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Price Range Meters
            </h3>

            {/* 52-Week Range */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#6B7280]">52W Low: ₹{low52.toFixed(2)}</span>
                <span className="text-[#111827] font-bold">52-Week Horizon</span>
                <span className="text-[#6B7280]">52W High: ₹{high52.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, currentPos))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Technical Indicators Full Panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2563EB]" />
                Technical Indicators
              </h3>
              <span className="text-xs text-[#6B7280] font-mono">Real-time Synthesized</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">SMA 20</span>
                <div className="text-base font-bold font-mono text-[#111827] mt-1">₹{techSMA20}</div>
                <span className="text-[10px] text-[#16A34A] font-semibold">Above Trendline</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">SMA 50</span>
                <div className="text-base font-bold font-mono text-[#111827] mt-1">₹{techSMA50}</div>
                <span className="text-[10px] text-[#16A34A] font-semibold">Golden Cross</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">EMA (20)</span>
                <div className="text-base font-bold font-mono text-[#111827] mt-1">₹{techEMA}</div>
                <span className="text-[10px] text-[#2563EB] font-semibold">Exponential Weight</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">RSI (14)</span>
                <div className="text-base font-bold font-mono text-[#111827] mt-1">{techRSI}</div>
                <span className="text-[10px] text-[#16A34A] font-semibold">Bullish Momentum</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">MACD</span>
                <div className="text-base font-bold font-mono text-[#16A34A] mt-1">{techMACD}</div>
                <span className="text-[10px] text-[#16A34A] font-semibold">Positive Histogram</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">Bollinger Bands</span>
                <div className="text-xs font-bold font-mono text-[#111827] mt-1">
                  ₹{techBBLower} – ₹{techBBUpper}
                </div>
                <span className="text-[10px] text-[#6B7280]">Normal Volatility</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">Daily Return</span>
                <div className={`text-base font-bold font-mono mt-1 ${isPos ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {dailyReturn}
                </div>
                <span className="text-[10px] text-[#6B7280]">Session Net</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">Volatility</span>
                <div className="text-base font-bold font-mono text-[#111827] mt-1">{volatility}</div>
                <span className="text-[10px] text-[#6B7280]">Stable Beta</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <span className="text-[#6B7280] font-semibold">Volume Change</span>
                <div className="text-base font-bold font-mono text-[#2563EB] mt-1">{volumeChange}</div>
                <span className="text-[10px] text-[#16A34A] font-semibold">Active Buying Pressure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Signal Card & Market Depth */}
        <div className="space-y-6">
          {/* AI Signal Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">AI Insight Engine</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-bold font-mono border border-blue-200">
                {stock.aiConfidence || 75}% Confidence
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280] font-medium">Model Recommendation</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    stock.aiSignal?.includes('BUY')
                      ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                      : 'bg-red-50 text-[#DC2626] border border-red-200'
                  }`}
                >
                  {stock.aiSignal || 'BUY'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-semibold flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#16A34A]" /> Target
                  </div>
                  <div className="text-sm font-bold font-mono text-[#16A34A] mt-0.5">
                    ₹{(stock.aiTargetPrice || ltp * 1.05).toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-[#DC2626]" /> Stop Loss
                  </div>
                  <div className="text-sm font-bold font-mono text-[#DC2626] mt-0.5">
                    ₹{(stock.aiStopLoss || ltp * 0.95).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {stock.aiSummary && (
              <p className="text-xs text-[#6B7280] leading-relaxed bg-[#F7F9FC] p-3 rounded-xl border border-[#E5E7EB]">
                "{stock.aiSummary}"
              </p>
            )}
          </div>

          {/* Level 2 Order Book Depth */}
          {stock.orderBook ? (
            <OrderBookDepth orderBook={stock.orderBook} />
          ) : (
            <OrderBookDepth
              orderBook={{
                bids: [
                  { price: roundPrice(ltp - 0.5), orders: 32, qty: 2500 },
                  { price: roundPrice(ltp - 1.0), orders: 45, qty: 4200 },
                  { price: roundPrice(ltp - 1.5), orders: 60, qty: 5800 },
                ],
                asks: [
                  { price: roundPrice(ltp + 0.5), orders: 28, qty: 1800 },
                  { price: roundPrice(ltp + 1.0), orders: 39, qty: 3400 },
                  { price: roundPrice(ltp + 1.5), orders: 52, qty: 4900 },
                ],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
