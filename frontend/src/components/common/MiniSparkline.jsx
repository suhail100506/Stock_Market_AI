import React from 'react';

export const MiniSparkline = ({ data = [], isPositive = true, width = 110, height = 36 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Build points
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const lineString = points.join(' ');
  const areaString = `${points[0]} ${lineString} ${width},${height} 0,${height}`;

  const strokeColor = isPositive ? '#16A34A' : '#DC2626';
  const fillColor = isPositive ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)';
  const gradId = `spark-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaString} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={lineString}
      />
    </svg>
  );
};
