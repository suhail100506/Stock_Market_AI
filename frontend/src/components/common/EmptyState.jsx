import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Found',
  description = 'There are currently no items matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-14 px-6 bg-white border border-[#E5E7EB] rounded-2xl max-w-xl mx-auto my-6 space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mx-auto border border-[#E5E7EB]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#111827]">{title}</h3>
      <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-2xs transition-colors"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
