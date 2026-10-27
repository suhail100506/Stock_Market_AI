import React from 'react';

export const SentimentGauge = ({ score = 0.65, label = 'Bullish', positivePct = 78 }) => {
  // score from -1 to 1 normalized to 0 to 180 degrees
  const angle = ((score + 1) / 2) * 180;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col items-center">
      <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
        Market AI Sentiment Meter
      </div>

      <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
        {/* Semi circle arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="65%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Gradient Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Needle / Pointer */}
          <g transform={`rotate(${angle - 90}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke="#111827"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        </svg>
      </div>

      <div className="text-center mt-2">
        <div
          className={`text-lg font-bold ${
            label.includes('Bullish')
              ? 'text-[#16A34A]'
              : label.includes('Bearish')
              ? 'text-[#DC2626]'
              : 'text-amber-600'
          }`}
        >
          {label}
        </div>
        <div className="text-xs text-[#6B7280] mt-0.5">
          {positivePct}% Positive Media & Social Mentions
        </div>
      </div>
    </div>
  );
};
