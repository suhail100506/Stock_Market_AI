import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { useTheme } from '../../context/ThemeContext';

export const OrderModal = () => {
  const { stocks, tradeModal, closeTradeModal, placeOrder, virtualCash } = useTrading();
  const { isDark, reConfirmOrder } = useTheme();
  const { isOpen, symbol, initialSide } = tradeModal;

  const stock = stocks.find((s) => s.symbol === symbol) || stocks[0];

  const [side, setSide] = useState(initialSide || 'BUY');
  const [product, setProduct] = useState('CNC'); // CNC (Delivery) or MIS (Intraday)
  const [orderType, setOrderType] = useState('MARKET'); // MARKET, LIMIT, SL
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  useEffect(() => {
    if (stock) {
      const initPrice = stock.ltp || 1000;
      setLimitPrice(initPrice.toFixed(2));
      setQuantity(10);
      setShowConfirmStep(false);
    }
    if (initialSide) {
      setSide(initialSide);
    }
  }, [stock, initialSide, isOpen]);

  if (!isOpen || !stock) return null;

  const currentPrice =
    orderType === 'LIMIT' && Number(limitPrice) > 0 ? Number(limitPrice) : stock.ltp;
  const totalValue = currentPrice * quantity;
  const hasEnoughFunds = side === 'BUY' ? virtualCash >= totalValue : true;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) return;

    if (reConfirmOrder && !showConfirmStep) {
      setShowConfirmStep(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        symbol: stock.symbol,
        side,
        type: orderType,
        product,
        quantity,
        limitPrice: orderType === 'LIMIT' ? limitPrice : undefined,
      });
      setIsSubmitting(false);
      setShowConfirmStep(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-2xl shadow-dropdown overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC] dark:bg-[#202228]">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#172033] dark:text-[#F4F6FC] tracking-tight">
                  {stock.symbol}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white dark:bg-[#18191D] text-[#69758A] dark:text-[#A0A7B5] font-mono border border-[#E4E9F2] dark:border-[#30333B]">
                  {stock.exchange || 'NSE'}
                </span>
              </div>
              <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] truncate max-w-xs">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-base font-bold font-mono text-[#172033] dark:text-[#F4F6FC]">
                ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`text-xs font-semibold ${
                  stock.change >= 0 ? 'text-[#07966A] dark:text-[#19B88A]' : 'text-[#E5484D] dark:text-[#FF6268]'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}
                {stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </div>
            </div>
            <button
              onClick={closeTradeModal}
              className="p-1.5 rounded-lg text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC] hover:bg-gray-200 dark:hover:bg-[#30333B] transition-colors"
              aria-label="Close trade modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* BUY / SELL Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3F6FC] dark:bg-[#202228] rounded-xl border border-[#E4E9F2] dark:border-[#30333B]">
            <button
              type="button"
              onClick={() => {
                setSide('BUY');
                setShowConfirmStep(false);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                side === 'BUY'
                  ? 'bg-[#07966A] dark:bg-[#19B88A] text-white shadow-xs'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              BUY ORDER
            </button>
            <button
              type="button"
              onClick={() => {
                setSide('SELL');
                setShowConfirmStep(false);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                side === 'SELL'
                  ? 'bg-[#E5484D] dark:bg-[#FF6268] text-white shadow-xs'
                  : 'text-[#69758A] dark:text-[#A0A7B5] hover:text-[#172033] dark:hover:text-[#F4F6FC]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              SELL ORDER
            </button>
          </div>

          {/* Product Type: Delivery (CNC) vs Intraday (MIS) */}
          <div>
            <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] uppercase tracking-wider mb-2">
              Product Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProduct('CNC')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  product === 'CNC'
                    ? 'border-[#405CF5] dark:border-[#627BFF] bg-blue-50/70 dark:bg-blue-950/40'
                    : 'border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">Delivery (CNC)</div>
                <div className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-0.5">Hold with virtual cash</div>
              </button>

              <button
                type="button"
                onClick={() => setProduct('MIS')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  product === 'MIS'
                    ? 'border-[#405CF5] dark:border-[#627BFF] bg-blue-50/70 dark:bg-blue-950/40'
                    : 'border-[#E4E9F2] dark:border-[#30333B] bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5]'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between text-[#172033] dark:text-[#F4F6FC]">
                  <span>Intraday (MIS)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#405CF5] dark:text-[#627BFF] font-mono font-bold">
                    5x LEV
                  </span>
                </div>
                <div className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-0.5">Auto square-off before 15:30</div>
              </button>
            </div>
          </div>

          {/* Order Type: Market / Limit / SL */}
          <div>
            <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] uppercase tracking-wider mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['MARKET', 'LIMIT', 'SL'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    orderType === type
                      ? 'bg-white dark:bg-[#18191D] text-[#405CF5] dark:text-[#627BFF] border-2 border-[#405CF5] dark:border-[#627BFF] shadow-2xs'
                      : 'bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border border-[#E4E9F2] dark:border-[#30333B]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs: Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] mb-1.5">
                Quantity (Shares)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] rounded-xl px-4 py-2 font-mono text-sm text-[#172033] dark:text-[#F4F6FC] outline-none"
              />
              <div className="flex gap-1.5 mt-2">
                {[5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F6FC] dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] mb-1.5">
                {orderType === 'MARKET' ? 'Market Price (Auto)' : 'Limit Price (₹)'}
              </label>
              <input
                type="number"
                step="0.05"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? stock.ltp.toFixed(2) : limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2 font-mono text-sm outline-none transition-colors ${
                  orderType === 'MARKET'
                    ? 'bg-gray-100 dark:bg-[#202228] text-[#69758A] dark:text-[#A0A7B5] border-[#E4E9F2] dark:border-[#30333B] cursor-not-allowed'
                    : 'bg-[#F3F6FC] dark:bg-[#101114] text-[#172033] dark:text-[#F4F6FC] border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF]'
                }`}
              />
              <div className="text-[11px] text-[#69758A] dark:text-[#A0A7B5] mt-2 font-mono">
                Tick Size: ₹0.05
              </div>
            </div>
          </div>

          {/* Paper Trading Ledger & Balance Calculation */}
          <div className="p-4 rounded-xl bg-[#F3F6FC] dark:bg-[#202228] border border-[#E4E9F2] dark:border-[#30333B] space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E4E9F2] dark:border-[#30333B] pb-2">
              <span className="font-bold text-[#172033] dark:text-[#F4F6FC] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#07966A] animate-pulse"></span>
                Paper Trading Ledger
              </span>
              <span className="text-[11px] text-[#405CF5] dark:text-[#627BFF] font-mono font-semibold">
                Simulated Virtual Demat
              </span>
            </div>

            {/* Quantity × Price = Amount Calculation */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center bg-white dark:bg-[#18191D] rounded-lg p-2.5 border border-[#E4E9F2] dark:border-[#30333B]">
              <div>
                <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] uppercase font-semibold">Quantity</div>
                <div className="font-mono font-bold text-xs text-[#172033] dark:text-[#F4F6FC] mt-0.5">{quantity}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] uppercase font-semibold">Price</div>
                <div className="font-mono font-bold text-xs text-[#172033] dark:text-[#F4F6FC] mt-0.5">
                  ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] uppercase font-semibold">Amount</div>
                <div className="font-mono font-bold text-xs text-[#405CF5] dark:text-[#627BFF] mt-0.5">
                  ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Virtual Balance Calculation */}
            <div className="bg-white dark:bg-[#18191D] rounded-lg p-3 border border-[#E4E9F2] dark:border-[#30333B] space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[#69758A] dark:text-[#A0A7B5]">
                <span>Available Cash</span>
                <span className="font-bold text-[#172033] dark:text-[#F4F6FC]">
                  ₹{virtualCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`flex justify-between items-center ${side === 'BUY' ? 'text-[#E5484D] dark:text-[#FF6268]' : 'text-[#07966A] dark:text-[#19B88A]'}`}>
                <span className="font-sans text-xs">
                  {side === 'BUY' ? '− Order Amount' : '+ Order Amount'}
                </span>
                <span className="font-bold">
                  {side === 'BUY' ? '− ' : '+ '}₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E4E9F2] dark:border-[#30333B] flex justify-between items-center text-[#172033] dark:text-[#F4F6FC] font-bold">
                <span className="font-sans text-xs text-[#69758A] dark:text-[#A0A7B5]">= Estimated Balance</span>
                <span className="text-xs">
                  ₹{Math.max(0, side === 'BUY' ? virtualCash - totalValue : virtualCash + totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Submit Button */}
          {showConfirmStep ? (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
                Please confirm: Submit paper {side} of {quantity} {stock.symbol} @ ₹{currentPrice.toFixed(2)}?
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmStep(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-[#E4E9F2] dark:border-[#30333B] text-[#69758A] dark:text-[#A0A7B5] hover:bg-gray-100 dark:hover:bg-[#202228]"
                >
                  Edit Order
                </button>
                <button
                  type="submit"
                  disabled={!hasEnoughFunds || isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-2xs ${
                    side === 'BUY' ? 'bg-[#07966A] hover:bg-[#067a56]' : 'bg-[#E5484D] hover:bg-[#c93b40]'
                  }`}
                >
                  Confirm Execution
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!hasEnoughFunds || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 ${
                side === 'BUY'
                  ? 'bg-[#07966A] hover:bg-[#067a56] text-white disabled:opacity-50'
                  : 'bg-[#E5484D] hover:bg-[#c93b40] text-white disabled:opacity-50'
              }`}
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {side} {quantity} {stock.symbol} (SIMULATED)
            </button>
          )}

          <p className="text-[11px] text-center text-[#69758A] dark:text-[#A0A7B5] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Simulated paper trading only. Zero monetary risk.
          </p>
        </form>
      </div>
    </div>
  );
};
