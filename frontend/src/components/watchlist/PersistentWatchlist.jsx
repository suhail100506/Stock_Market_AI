import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Trash2,
  Bell,
  Sliders,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const PersistentWatchlist = ({
  selectedSymbol,
  onSelectStock,
  onOpenAlertModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const {
    stocks,
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    openTradeModal,
  } = useTrading();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('mywatchlist');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  // Filter stocks present in watchlist
  const watchlistStocks = stocks.filter((s) => watchlist.includes(s.symbol));

  // If user is searching, also allow searching entire universe
  const displayStocks = searchFilter.trim()
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
          s.name.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : watchlistStocks.length > 0
    ? watchlistStocks
    : stocks.slice(0, 14);

  const handleStockClick = (symbol) => {
    if (onSelectStock) {
      onSelectStock(symbol);
    } else {
      navigate(`/trade?symbol=${symbol}`);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-[#18191D] border-r border-[#E4E9F2] dark:border-[#30333B] flex flex-col items-center py-4 select-none shrink-0 transition-all duration-200">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors"
          title="Expand Watchlist"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-6 [writing-mode:vertical-rl] rotate-180 text-xs font-bold tracking-wider text-[#69758A] dark:text-[#A0A7B5] uppercase">
          Watchlist ({watchlist.length})
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 sm:w-72 bg-white dark:bg-[#18191D] border-r border-[#E4E9F2] dark:border-[#30333B] flex flex-col h-full select-none shrink-0 transition-all duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[#E4E9F2] dark:border-[#30333B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
              Watchlist
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]">
              {displayStocks.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 rounded text-[#69758A] dark:text-[#A0A7B5] hover:text-[#405CF5] dark:hover:text-[#627BFF] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors"
              title="Add New Watchlist"
            >
              <Plus className="w-4 h-4" />
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-[#F3F6FC] dark:hover:bg-[#202228] transition-colors"
                title="Collapse Watchlist"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Watchlist Tabs */}
        <div className="flex items-center gap-2 mt-2 text-xs">
          <button
            onClick={() => setActiveTab('mywatchlist')}
            className={`font-semibold pb-1 border-b-2 text-[11px] transition-colors ${
              activeTab === 'mywatchlist'
                ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
            }`}
          >
            mywatchlist
          </button>
          <button
            onClick={() => setActiveTab('nifty50')}
            className={`font-semibold pb-1 border-b-2 text-[11px] transition-colors ${
              activeTab === 'nifty50'
                ? 'border-[#405CF5] dark:border-[#627BFF] text-[#405CF5] dark:text-[#627BFF]'
                : 'border-transparent text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
            }`}
          >
            NIFTY 50
          </button>
        </div>

        {/* Search Input inside Watchlist */}
        <div className="relative mt-2">
          <Search className="w-3.5 h-3.5 text-[#69758A] dark:text-[#A0A7B5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#172033] dark:text-[#F4F6FC] placeholder-[#69758A] dark:placeholder-[#64748B] outline-none transition-all"
          />
        </div>
      </div>

      {/* Stock List Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E4E9F2]/60 dark:divide-[#30333B]/60">
        {displayStocks.map((stock) => {
          const isSelected = selectedSymbol === stock.symbol;
          const isFavorited = isInWatchlist(stock.symbol);
          const isPositive = (stock.change ?? 0) >= 0;

          return (
            <div
              key={stock.symbol}
              onClick={() => handleStockClick(stock.symbol)}
              className={`group relative px-3 py-2.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-3 border-[#405CF5] dark:border-[#627BFF]'
                  : 'hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Symbol & Exchange */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                      {stock.symbol}
                    </span>
                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border border-[#E4E9F2]/60 dark:border-[#30333B]/60">
                      {stock.exchange || 'NSE'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] truncate max-w-[130px]">
                    {stock.name}
                  </span>
                </div>

                {/* LTP & Price Change */}
                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-[#172033] dark:text-[#F4F6FC]">
                    ₹{(stock.ltp ?? 0).toFixed(2)}
                  </div>
                  <div
                    className={`flex items-center justify-end text-[10px] font-mono font-semibold ${
                      isPositive
                        ? 'text-[#07966A] dark:text-[#19B88A]'
                        : 'text-[#E5484D] dark:text-[#FF6268]'
                    }`}
                  >
                    <span>
                      {isPositive ? '+' : ''}{(stock.change ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%)
                    </span>
                    {isPositive ? (
                      <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5 ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Hover Action Bar: B (Buy), S (Sell), Chart, Alert, Star */}
              <div className="absolute inset-y-0 right-2 hidden group-hover:flex items-center gap-1 bg-white/95 dark:bg-[#18191D]/95 pl-2">
                {/* Buy Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTradeModal(stock.symbol, 'BUY');
                  }}
                  className="w-6 h-6 rounded bg-[#07966A] hover:bg-[#067a56] dark:bg-[#19B88A] dark:hover:bg-[#159a73] text-white text-[11px] font-bold flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                  title="Quick Buy"
                >
                  B
                </button>

                {/* Sell Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTradeModal(stock.symbol, 'SELL');
                  }}
                  className="w-6 h-6 rounded bg-[#E5484D] hover:bg-[#c93b40] dark:bg-[#FF6268] dark:hover:bg-[#e04f55] text-white text-[11px] font-bold flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                  title="Quick Sell"
                >
                  S
                </button>

                {/* Chart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/trade?symbol=${stock.symbol}`);
                  }}
                  className="w-6 h-6 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#172033] dark:text-[#F4F6FC] hover:text-[#405CF5] dark:hover:text-[#627BFF] border border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-center transition-colors"
                  title="Open Chart in TradeOne"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                </button>

                {/* Price Alert */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenAlertModal) {
                      onOpenAlertModal(stock.symbol);
                    } else {
                      navigate(`/alerts?symbol=${stock.symbol}`);
                    }
                  }}
                  className="w-6 h-6 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#405CF5] dark:hover:text-[#627BFF] border border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-center transition-colors"
                  title="Set Price Alert"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>

                {/* Favorite Star */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(stock.symbol);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                    isFavorited
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-200 dark:border-amber-800/40'
                      : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B]'
                  }`}
                  title={isFavorited ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Watchlist Footer */}
      <div className="p-2.5 border-t border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC]/60 dark:bg-[#202228]/40 flex items-center justify-between text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
        <button
          onClick={() => navigate('/markets')}
          className="font-bold hover:text-[#405CF5] dark:hover:text-[#627BFF] transition-colors"
        >
          OPTIONS QUICK LIST &rsaquo;
        </button>
        <span className="text-[10px] font-mono text-gray-400">
          MongoDB Synced
        </span>
      </div>

      {/* Add Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl shadow-dropdown p-4 w-full max-w-sm space-y-3">
            <h3 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
              Create New Watchlist
            </h3>
            <input
              type="text"
              placeholder="Watchlist Name (e.g. High Growth, Midcap)..."
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-2 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newWatchlistName.trim()) {
                    setShowAddModal(false);
                    setNewWatchlistName('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
