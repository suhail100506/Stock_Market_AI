import React from 'react';

export const OrderBookDepth = ({ orderBook }) => {
  if (!orderBook) return null;

  const totalBidQty = orderBook.bids.reduce((acc, b) => acc + b.qty, 0);
  const totalAskQty = orderBook.asks.reduce((acc, a) => acc + a.qty, 0);
  const totalVolume = totalBidQty + totalAskQty || 1;
  const bidRatio = Math.round((totalBidQty / totalVolume) * 100);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
          Market Depth (Level 2)
        </h3>
        <div className="text-xs text-[#6B7280] font-mono">
          Bids <span className="text-[#16A34A] font-bold">{bidRatio}%</span> / Asks{' '}
          <span className="text-[#DC2626] font-bold">{100 - bidRatio}%</span>
        </div>
      </div>

      {/* Depth Volume Ratio Bar */}
      <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden flex mb-4">
        <div className="bg-[#16A34A] transition-all duration-300" style={{ width: `${bidRatio}%` }} />
        <div className="bg-[#DC2626] transition-all duration-300" style={{ width: `${100 - bidRatio}%` }} />
      </div>

      {/* Dual Column: Bids & Asks */}
      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
        {/* Bid Side */}
        <div>
          <div className="grid grid-cols-3 text-[#6B7280] text-[11px] pb-2 border-b border-[#E5E7EB] font-sans font-semibold">
            <span>Orders</span>
            <span className="text-right">Qty</span>
            <span className="text-right text-[#16A34A]">Bid (₹)</span>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {orderBook.bids.map((bid, i) => (
              <div key={i} className="grid grid-cols-3 py-1.5 relative overflow-hidden group">
                <div
                  className="absolute inset-y-0 right-0 bg-emerald-50 pointer-events-none"
                  style={{ width: `${(bid.qty / totalBidQty) * 100}%` }}
                />
                <span className="text-[#6B7280]">{bid.orders}</span>
                <span className="text-right text-[#111827]">{bid.qty.toLocaleString('en-IN')}</span>
                <span className="text-right font-bold text-[#16A34A]">{bid.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 mt-2 border-t border-[#E5E7EB] flex justify-between font-semibold text-[#111827]">
            <span>Total</span>
            <span className="text-[#16A34A]">{totalBidQty.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Ask Side */}
        <div>
          <div className="grid grid-cols-3 text-[#6B7280] text-[11px] pb-2 border-b border-[#E5E7EB] font-sans font-semibold">
            <span className="text-[#DC2626]">Ask (₹)</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Orders</span>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {orderBook.asks.map((ask, i) => (
              <div key={i} className="grid grid-cols-3 py-1.5 relative overflow-hidden group">
                <div
                  className="absolute inset-y-0 left-0 bg-red-50 pointer-events-none"
                  style={{ width: `${(ask.qty / totalAskQty) * 100}%` }}
                />
                <span className="font-bold text-[#DC2626]">{ask.price.toFixed(2)}</span>
                <span className="text-right text-[#111827]">{ask.qty.toLocaleString('en-IN')}</span>
                <span className="text-right text-[#6B7280]">{ask.orders}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 mt-2 border-t border-[#E5E7EB] flex justify-between font-semibold text-[#111827]">
            <span>Total</span>
            <span className="text-[#DC2626]">{totalAskQty.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
