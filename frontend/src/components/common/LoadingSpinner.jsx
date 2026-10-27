import React from 'react';

export const LoadingSpinner = ({ message = 'Loading market data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-2 border-blue-200 border-t-[#2563EB] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-100 animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-semibold text-[#6B7280] tracking-wide">{message}</p>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 animate-pulse space-y-4 shadow-xs">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-6 bg-gray-200 rounded-lg" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-1.5">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
};
