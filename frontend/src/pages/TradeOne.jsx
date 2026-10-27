import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Sliders,
  Maximize2,
  Minimize2,
  Crosshair,
  Minus,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Layers,
  ChevronRight,
  ChevronLeft,
  Bell,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { PersistentWatchlist } from '../components/watchlist/PersistentWatchlist';
import { InteractiveChart } from '../components/charts/InteractiveChart';

export const TradeOne = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { symbol: routeSymbol } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    stocks,
    openTradeModal,
    placeOrder,
    positions,
    orders,
    virtualCash,
  } = useTrading();

  // Watchlist collapse state
  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);

  // Active symbol
  const symbolParam = routeSymbol || searchParams.get('symbol') || 'RELIANCE';
  const currentStock = stocks.find((s) => s.symbol === symbolParam) || stocks[0] || {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    ltp: 1425.00,
    change: -5.72,
    changePercent: -0.40,
    exchange: 'NSE',
    sector: 'Oil & Gas',
  };

  // Instant order quantity
  const [instantQty, setInstantQty] = useState(1);
  const [isInstantExecuting, setIsInstantExecuting] = useState(false);

  // Right utility panel tabs: 'depth' | 'positions' | 'orders' | 'options' | 'alerts'
  const [activeRightTab, setActiveRightTab] = useState('depth');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Drawing tools state
  const [activeTool, setActiveTool] = useState('crosshair'); // 'crosshair' | 'trendline' | 'hline' | 'vline' | 'text'
  const [drawings, setDrawings] = useState([]);
  const [alertPrice, setAlertPrice] = useState(currentStock?.ltp || 1000);
  const [alertSet, setAlertSet] = useState(false);

  const isPos = (currentStock?.change ?? 0) >= 0;

  const handleStockSelect = (sym) => {
    setSearchParams({ symbol: sym });
    setAlertPrice(stocks.find((s) => s.symbol === sym)?.ltp || 1000);
    setAlertSet(false);
  };

  // Instant paper trade execution
  const handleInstantTrade = async (side) => {
    if (isInstantExecuting) return;
    setIsInstantExecuting(true);
    try {
      await placeOrder({
        symbol: currentStock.symbol,
        side,
        type: 'MARKET',
        product: 'CNC',
        quantity: Number(instantQty) || 1,
        limitPrice: currentStock.ltp,
      });
    } finally {
      setIsInstantExecuting(false);
    }
  };

  const handleToolClick = (tool) => {
    if (tool === 'clear') {
      setDrawings([]);
    } else {
      setActiveTool(tool);
    }
  };

  // Stock positions & orders
  const stockPositions = positions.filter((p) => p.symbol === currentStock.symbol);
  const stockOrders = orders.filter((o) => o.symbol === currentStock.symbol);

  // Market Depth Data (5-level Bid/Ask ladder)
  const baseLtp = Number(currentStock?.ltp) || 1000;
  const bids = currentStock?.orderBook?.bids || [
    { price: (baseLtp * 0.999).toFixed(2), orders: 48, qty: 1840 },
    { price: (baseLtp * 0.998).toFixed(2), orders: 32, qty: 3200 },
    { price: (baseLtp * 0.997).toFixed(2), orders: 85, qty: 5900 },
    { price: (baseLtp * 0.996).toFixed(2), orders: 41, qty: 2450 },
    { price: (baseLtp * 0.995).toFixed(2), orders: 96, qty: 8120 },
  ];

  const asks = currentStock?.orderBook?.asks || [
    { price: (baseLtp * 1.001).toFixed(2), orders: 25, qty: 1120 },
    { price: (baseLtp * 1.002).toFixed(2), orders: 54, qty: 2890 },
    { price: (baseLtp * 1.003).toFixed(2), orders: 78, qty: 4760 },
    { price: (baseLtp * 1.004).toFixed(2), orders: 39, qty: 3100 },
    { price: (baseLtp * 1.005).toFixed(2), orders: 110, qty: 9400 },
  ];

  const totalBidQty = bids.reduce((acc, b) => acc + (b.qty || 0), 0);
  const totalAskQty = asks.reduce((acc, a) => acc + (a.qty || 0), 0);

  return (
    <div className="flex-1 flex h-[calc(100vh-53px)] overflow-hidden select-none">
      {/* Persistent Left Watchlist */}
      <PersistentWatchlist
        selectedSymbol={currentStock.symbol}
        onSelectStock={handleStockSelect}
        isCollapsed={isWatchlistCollapsed}
        onToggleCollapse={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
      />

      {/* Main Pro Chart Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F3F6FC] dark:bg-[#101114] overflow-hidden">
        {/* Top Chart Header Bar (Screenshots 5 & 12) */}
        <div className="bg-white dark:bg-[#18191D] border-b border-[#E4E9F2] dark:border-[#30333B] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Symbol Title & OHLC readout */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#172033] dark:text-[#F4F6FC]">
                  {currentStock.symbol}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border border-[#E4E9F2] dark:border-[#30333B]">
                  {currentStock.exchange || 'NSE'}
                </span>
                <span className="text-xs text-[#69758A] dark:text-[#A0A7B5] hidden sm:inline truncate max-w-[140px]">
                  {currentStock.name}
                </span>
              </div>

              {/* OHLC Bar */}
              <div className="flex items-center gap-3 text-[11px] font-mono mt-0.5">
                <span className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                  ₹{Number(currentStock?.ltp ?? 0).toFixed(2)}
                </span>
                <span
                  className={`font-semibold ${
                    isPos ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                  }`}
                >
                  {isPos ? '+' : ''}{Number(currentStock?.change ?? 0).toFixed(2)} ({isPos ? '+' : ''}{Number(currentStock?.changePercent ?? 0).toFixed(2)}%)
                </span>
                <span className="text-[#69758A] dark:text-[#A0A7B5] hidden md:inline">
                  O: {Number(currentStock?.open ?? currentStock?.ltp ?? 0).toFixed(2)} H: {Number(currentStock?.high ?? (currentStock?.ltp ?? 0) * 1.01).toFixed(2)} L: {Number(currentStock?.low ?? (currentStock?.ltp ?? 0) * 0.99).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Instant Paper Trade Bar (Buy / Qty / Sell) */}
          <div className="flex items-center gap-2 bg-[#F3F6FC] dark:bg-[#202228] p-1 rounded-lg border border-[#E4E9F2] dark:border-[#30333B]">
            {/* Quick BUY */}
            <button
              onClick={() => handleInstantTrade('BUY')}
              disabled={isInstantExecuting}
              className="px-3 py-1 rounded-md text-xs font-bold bg-[#07966A] hover:bg-[#067a56] text-white shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              BUY ₹{Number(currentStock?.ltp ?? 0).toFixed(2)}
            </button>

            {/* Qty Input */}
            <input
              type="number"
              min="1"
              max="10000"
              value={instantQty}
              onChange={(e) => setInstantQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center text-xs font-mono font-bold bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded py-1 text-[#172033] dark:text-[#F4F6FC] outline-none"
              title="Order Quantity"
            />

            {/* Quick SELL */}
            <button
              onClick={() => handleInstantTrade('SELL')}
              disabled={isInstantExecuting}
              className="px-3 py-1 rounded-md text-xs font-bold bg-[#E5484D] hover:bg-[#c93b40] text-white shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              SELL ₹{Number(currentStock?.ltp ?? 0).toFixed(2)}
            </button>

            {/* Detailed Order Pad Button */}
            <button
              onClick={() => openTradeModal(currentStock.symbol, 'BUY')}
              className="text-[11px] font-bold text-[#405CF5] dark:text-[#627BFF] px-2 hover:underline"
            >
              Order Pad &rsaquo;
            </button>
          </div>
        </div>

        {/* Chart Viewport & Drawing Tools Layout */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Left Vertical Drawing Toolbar (Screenshots 5 & 12) */}
          <div className="w-10 bg-white dark:bg-[#18191D] border-r border-[#E4E9F2] dark:border-[#30333B] flex flex-col items-center py-2 gap-1 shrink-0 z-10">
            <button
              onClick={() => handleToolClick('crosshair')}
              className={`p-2 rounded-lg transition-colors ${
                activeTool === 'crosshair'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF]'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
              }`}
              title="Crosshair Cursor"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToolClick('trendline')}
              className={`p-2 rounded-lg transition-colors ${
                activeTool === 'trendline'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF]'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
              }`}
              title="Trendline Tool"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToolClick('hline')}
              className={`p-2 rounded-lg transition-colors ${
                activeTool === 'hline'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF]'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
              }`}
              title="Horizontal Support/Resistance Line"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToolClick('text')}
              className={`p-2 rounded-lg transition-colors ${
                activeTool === 'text'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#405CF5] dark:text-[#627BFF]'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
              }`}
              title="Text Annotation"
            >
              <Type className="w-4 h-4" />
            </button>
            <div className="w-6 h-[1px] bg-[#E4E9F2] dark:border-[#30333B] my-1" />
            <button
              onClick={() => handleToolClick('clear')}
              className="p-2 rounded-lg text-[#69758A] dark:text-[#A0A7B5] hover:text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Reset Drawings"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Central Interactive Chart Canvas */}
          <div className="flex-1 flex flex-col p-3 overflow-y-auto">
            <InteractiveChart stock={currentStock} height={460} />
          </div>

          {/* Right Utility Drawer (Collapsible) */}
          {isRightPanelOpen ? (
            <div className="w-72 sm:w-80 bg-white dark:bg-[#18191D] border-l border-[#E4E9F2] dark:border-[#30333B] flex flex-col shrink-0">
              {/* Utility Tabs */}
              <div className="p-2 border-b border-[#E4E9F2] dark:border-[#30333B] flex items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                  <button
                    onClick={() => setActiveRightTab('depth')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeRightTab === 'depth'
                        ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                        : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
                    }`}
                  >
                    Depth
                  </button>
                  <button
                    onClick={() => setActiveRightTab('positions')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeRightTab === 'positions'
                        ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                        : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
                    }`}
                  >
                    Positions ({stockPositions.length})
                  </button>
                  <button
                    onClick={() => setActiveRightTab('alerts')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeRightTab === 'alerts'
                        ? 'bg-[#405CF5] dark:bg-[#627BFF] text-white'
                        : 'text-[#69758A] dark:text-[#A0A7B5] hover:bg-[#F3F6FC] dark:hover:bg-[#202228]'
                    }`}
                  >
                    Alerts
                  </button>
                </div>

                <button
                  onClick={() => setIsRightPanelOpen(false)}
                  className="p-1 rounded text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]"
                  title="Close Side Panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Utility Tab Content */}
              <div className="flex-1 overflow-y-auto p-3">
                {/* 1. Market Depth Ladder */}
                {activeRightTab === 'depth' && (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5]">
                      <span>BID (BUYERS)</span>
                      <span>ASK (SELLERS)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Bids Column */}
                      <div className="space-y-1">
                        {bids.slice(0, 5).map((bid, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-1 rounded bg-emerald-50/50 dark:bg-emerald-950/20 text-[#07966A] dark:text-[#19B88A]"
                          >
                            <span>{bid.orders}</span>
                            <span className="font-semibold">{bid.qty}</span>
                            <span className="font-bold">₹{bid.price}</span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-[#E4E9F2] dark:border-[#30333B] flex justify-between text-[10px] text-[#69758A] dark:text-[#A0A7B5]">
                          <span>Total:</span>
                          <span className="font-bold text-[#07966A] dark:text-[#19B88A]">{totalBidQty}</span>
                        </div>
                      </div>

                      {/* Asks Column */}
                      <div className="space-y-1">
                        {asks.slice(0, 5).map((ask, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-1 rounded bg-red-50/50 dark:bg-red-950/20 text-[#E5484D] dark:text-[#FF6268]"
                          >
                            <span className="font-bold">₹{ask.price}</span>
                            <span className="font-semibold">{ask.qty}</span>
                            <span>{ask.orders}</span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-[#E4E9F2] dark:border-[#30333B] flex justify-between text-[10px] text-[#69758A] dark:text-[#A0A7B5]">
                          <span>Total:</span>
                          <span className="font-bold text-[#E5484D] dark:text-[#FF6268]">{totalAskQty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Fundamentals Snapshot */}
                    <div className="pt-3 border-t border-[#E4E9F2] dark:border-[#30333B] space-y-2 font-sans text-xs">
                      <div className="font-bold text-[11px] uppercase tracking-wider text-[#172033] dark:text-[#F4F6FC]">
                        Stats & Valuation
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-[#F3F6FC] dark:bg-[#202228]">
                          <span className="text-[#69758A] dark:text-[#A0A7B5]">Market Cap</span>
                          <div className="font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                            {currentStock.marketCap || '₹18.4L Cr'}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#F3F6FC] dark:bg-[#202228]">
                          <span className="text-[#69758A] dark:text-[#A0A7B5]">P/E Ratio</span>
                          <div className="font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                            {currentStock.peRatio || '27.4'}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#F3F6FC] dark:bg-[#202228]">
                          <span className="text-[#69758A] dark:text-[#A0A7B5]">52W High</span>
                          <div className="font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                            ₹{currentStock.fiftyTwoWeekHigh || (baseLtp * 1.15).toFixed(2)}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#F3F6FC] dark:bg-[#202228]">
                          <span className="text-[#69758A] dark:text-[#A0A7B5]">52W Low</span>
                          <div className="font-mono font-bold text-[#172033] dark:text-[#F4F6FC]">
                            ₹{currentStock.fiftyTwoWeekLow || (baseLtp * 0.85).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Positions for this Stock */}
                {activeRightTab === 'positions' && (
                  <div className="space-y-3">
                    {stockPositions.length > 0 ? (
                      stockPositions.map((pos, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC] dark:bg-[#202228] space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span className="text-[#172033] dark:text-[#F4F6FC]">{pos.symbol}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-[#405CF5] dark:text-[#627BFF]">
                              {pos.product || 'INTRADAY'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span>Qty: {pos.quantity}</span>
                            <span>Avg: ₹{Number(pos.avgPrice ?? pos.avg_price ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span>P&L:</span>
                            <span className={(pos.unrealizedPnl ?? pos.unrealized_pnl ?? 0) >= 0 ? 'text-[#07966A]' : 'text-[#E5484D]'}>
                              {(pos.unrealizedPnl ?? pos.unrealized_pnl ?? 0) >= 0 ? '+' : ''}₹{Number(pos.unrealizedPnl ?? pos.unrealized_pnl ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#69758A] dark:text-[#A0A7B5] space-y-2">
                        <Activity className="w-6 h-6 mx-auto opacity-50" />
                        <div>No open positions in {currentStock.symbol}.</div>
                        <button
                          onClick={() => openTradeModal(currentStock.symbol, 'BUY')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#07966A] text-white"
                        >
                          Buy {currentStock.symbol}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Price Alerts */}
                {activeRightTab === 'alerts' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-[#69758A] dark:text-[#A0A7B5] block mb-1">
                        Set Alert for {currentStock.symbol}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(Number(e.target.value))}
                          className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#172033] dark:text-[#F4F6FC] outline-none"
                        />
                        <button
                          onClick={() => setAlertSet(true)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shrink-0"
                        >
                          Set
                        </button>
                      </div>
                    </div>

                    {alertSet && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[#07966A] dark:text-[#19B88A] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Alert active: Notify when price crosses ₹{alertPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsRightPanelOpen(true)}
              className="p-1.5 bg-white dark:bg-[#18191D] border-l border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] flex items-center justify-center shrink-0"
              title="Open Depth & Positions Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeOne;
