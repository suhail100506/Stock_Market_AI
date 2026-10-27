import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star, Sparkles } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';
import { useTrading } from '../../context/TradingContext';

export const StockCard = ({ stock }) => {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist, openTradeModal } = useTrading();

  if (!stock) return null;

  const change = stock.ltp - (stock.prevClose || stock.ltp);
  const changePercent = stock.prevClose ? (change / stock.prevClose) * 100 : 0;
  const isPositive = change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);

  // AI signal styling
  const isAiBullish = stock.aiSignal?.includes('BUY');
  const isAiBearish = stock.aiSignal?.includes('SELL');

  return (
    <div
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      className="group relative bg-white hover:bg-[#F7F9FC] border border-[#E5E7EB] hover:border-gray-300 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-card-hover flex flex-col justify-between"
    >
      {/* Top Header: Symbol, Name & Watchlist Toggle */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111827] text-base tracking-tight group-hover:text-[#2563EB] transition-colors">
              {stock.symbol}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
              {stock.exchange || 'NSE'}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] truncate mt-0.5 font-medium">{stock.name}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(stock.symbol);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            inWatchlist
              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Middle Row: Price, Change & Sparkline */}
      <div className="flex items-center justify-between gap-3 my-2">
        <div>
          <div className="text-xl font-bold font-mono text-[#111827] tracking-tight">
            ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${
              isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(2)} ({isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <MiniSparkline data={stock.sparkline} isPositive={isPositive} width={95} height={34} />
        </div>
      </div>

      {/* AI Signal Badge & Quick Orders */}
      <div className="mt-2.5 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isAiBullish
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : isAiBearish
                ? 'bg-red-50 text-[#DC2626] border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {stock.aiSignal || 'NEUTRAL'} • {stock.aiConfidence || 70}%
          </span>
        </div>

        {/* Quick Buy/Sell Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openTradeModal(stock.symbol, 'BUY');
            }}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-[#16A34A] text-[#16A34A] hover:text-white border border-emerald-300 transition-colors shadow-2xs"
          >
            BUY
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openTradeModal(stock.symbol, 'SELL');
            }}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-[#DC2626] text-[#DC2626] hover:text-white border border-red-300 transition-colors shadow-2xs"
          >
            SELL
          </button>
        </div>
      </div>
    </div>
  );
};
