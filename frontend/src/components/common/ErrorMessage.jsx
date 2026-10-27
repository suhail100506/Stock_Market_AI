import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({
  message = 'Failed to connect to backend server. Please make sure the FastAPI backend is running.',
  onRetry,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-red-50/80 border border-red-200 text-center max-w-lg mx-auto my-6 space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto border border-red-200">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#111827]">Connection Notice</h3>
      <p className="text-xs text-[#DC2626] leading-relaxed max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#DC2626] hover:bg-red-700 text-white shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
