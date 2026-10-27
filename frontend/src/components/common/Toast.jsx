import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useTrading();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-[#2563EB] shrink-0" />;
        let borderColor = 'border-blue-200';
        let iconBg = 'bg-blue-50';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />;
          borderColor = 'border-emerald-200';
          iconBg = 'bg-emerald-50';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />;
          borderColor = 'border-red-200';
          iconBg = 'bg-red-50';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          borderColor = 'border-amber-200';
          iconBg = 'bg-amber-50';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border ${borderColor} bg-white shadow-dropdown text-sm text-[#111827] transition-all`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1 rounded-lg ${iconBg}`}>{icon}</div>
              <p className="font-medium text-[#111827] leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B7280] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
