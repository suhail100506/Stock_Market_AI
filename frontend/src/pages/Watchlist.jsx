import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Search, Trash2, TrendingUp, TrendingDown, RefreshCw, Database } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { MiniSparkline } from '../components/common/MiniSparkline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const Watchlist = () => {
  const navigate = useNavigate();
  const { stocks, watchlist, toggleWatchlist, openTradeModal, isLoading, error, refreshAll } = useTrading();

  const [searchTerm, setSearchTerm] = useState('');

  const watchlistStocks = stocks.filter((s) => watchlist.includes(s.symbol));
  const availableToAdd = stocks.filter((s) => !watchlist.includes(s.symbol));

  const filteredWatchlist = watchlistStocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Watchlist
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-semibold">
              <Database className="w-3 h-3" />
              <span>MongoDB Synced</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Keep track of favorite equities with real-time price updates and quick paper order actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAll}
            className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] shadow-2xs transition-colors"
            title="Refresh Watchlist"
            aria-label="Refresh Watchlist"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter watchlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#F3F4F6] focus:bg-white border border-[#E5E7EB] focus:border-[#2563EB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111827] placeholder-[#6B7280] outline-none w-48 sm:w-64 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage message={error} onRetry={refreshAll} />}

      {/* Watchlist Quick Summary Cards */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
              Benchmark Equities
            </h2>
          </div>
          <span className="text-xs text-[#6B7280] font-mono">
            {watchlist.length} Tickers Tracked
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { symbol: 'TCS', price: '₹3,450', isPos: true },
            { symbol: 'INFY', price: '₹1,520', isPos: true },
            { symbol: 'RELIANCE', price: '₹1,425', isPos: false },
            { symbol: 'HDFC', price: '₹1,980', isPos: true },
          ].map((item) => {
            const liveStock = stocks.find((s) => s.symbol === item.symbol);
            const isStarred = watchlist.includes(item.symbol);
            const displayPrice = liveStock
              ? `₹${liveStock.ltp.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
              : item.price;
            const prev = liveStock?.prevClose || (liveStock?.ltp || 1000);
            const currentLtp = liveStock?.ltp || 1000;
            const pct = prev > 0 ? ((currentLtp - prev) / prev) * 100 : 1.2;
            const isPositive = pct >= 0;

            return (
              <div
                key={item.symbol}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  isStarred
                    ? 'bg-[#F7F9FC] border-[#E5E7EB] hover:border-blue-300'
                    : 'bg-white border-dashed border-[#E5E7EB] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-[#111827] text-sm group-hover:text-[#2563EB] transition-colors">
                    {item.symbol}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(item.symbol);
                    }}
                    className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                    title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    aria-label={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isStarred ? 'text-amber-500 fill-amber-500' : 'text-gray-300 hover:text-amber-400'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-bold text-[#111827] text-sm">
                    {displayPrice}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {isPositive ? '+' : ''}{pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Watchlist Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching watchlist equities..." />
      ) : filteredWatchlist.length === 0 ? (
        <EmptyState
          icon={Star}
          title={searchTerm ? 'No Matching Stocks in Watchlist' : 'Your Watchlist is Empty'}
          description={
            searchTerm
              ? `No stocks matching '${searchTerm}'.`
              : 'Add equities to your watchlist from the suggestions below or from the Markets directory.'
          }
          actionLabel="Browse Markets"
          onAction={() => navigate('/markets')}
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F9FC] text-[11px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3.5 px-3 text-center w-10">⭐</th>
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4 text-right">LTP (₹)</th>
                  <th className="py-3.5 px-4 text-right">Day Change</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">Trend (1D)</th>
                  <th className="py-3.5 px-4 text-center">AI Signal</th>
                  <th className="py-3.5 px-4 text-right">Quick Order</th>
                  <th className="py-3.5 px-4 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredWatchlist.map((stock) => {
                  const prev = stock.prevClose || stock.ltp;
                  const change = stock.ltp - prev;
                  const changePct = prev > 0 ? (change / prev) * 100 : 0;
                  const isPos = change >= 0;

                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                      className="hover:bg-[#F7F9FC] cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(stock.symbol)}
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Remove from watchlist"
                        >
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-[#6B7280] truncate max-w-[150px] sm:max-w-xs">
                            {stock.name}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-[#111827]">
                        ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-xs inline-flex items-center gap-1 ${
                            isPos ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {change.toFixed(2)} ({isPos ? '+' : ''}
                          {changePct.toFixed(2)}%)
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <MiniSparkline data={stock.sparkline} isPositive={isPos} width={80} height={26} />
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            stock.aiSignal?.includes('BUY')
                              ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                              : 'bg-red-50 text-[#DC2626] border border-red-200'
                          }`}
                        >
                          {stock.aiSignal || 'HOLD'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openTradeModal(stock.symbol, 'BUY')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-[#16A34A] text-[#16A34A] hover:text-white border border-emerald-200 transition-colors shadow-2xs"
                          >
                            BUY
                          </button>
                          <button
                            type="button"
                            onClick={() => openTradeModal(stock.symbol, 'SELL')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 hover:bg-[#DC2626] text-[#DC2626] hover:text-white border border-red-200 transition-colors shadow-2xs"
                          >
                            SELL
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(stock.symbol)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                          title="Remove from Watchlist"
                          aria-label="Remove from Watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Add Suggestions Strip */}
      {availableToAdd.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Suggested Stocks to Add
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {availableToAdd.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => toggleWatchlist(stock.symbol)}
                className="px-3 py-1.5 rounded-xl bg-[#F7F9FC] hover:bg-blue-50 border border-[#E5E7EB] hover:border-blue-200 text-xs font-semibold text-[#111827] hover:text-[#2563EB] flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{stock.symbol}</span>
                <span className="font-mono text-[#6B7280]">₹{stock.ltp.toFixed(0)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
