import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subvalue,
  change,
  isPositive,
  icon: Icon,
  badge,
  actionButton,
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-[#6B7280] tracking-wider uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-blue-100">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-2xl font-bold font-mono text-[#111827] tracking-tight">
          {value}
        </div>
        {subvalue && <div className="text-xs text-[#6B7280] mt-0.5">{subvalue}</div>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#E5E7EB]">
        {change !== undefined ? (
          <div
            className={`flex items-center gap-1 text-xs font-bold ${
              isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        ) : badge ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
            {badge}
          </span>
        ) : (
          <div />
        )}

        {actionButton}
      </div>
    </div>
  );
};
