import React from 'react';

export default function CircularProgress({ 
  progress = 0, 
  label, 
  subLabel, 
  colorClass = 'text-blue-500', 
  trackClass = 'text-black/10 dark:text-white/10',
  glow,
  size = 40,
  strokeWidth = 4,
  compact = false
}) {
  const radius = size / 2;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const containerClasses = compact 
    ? "inline-flex items-center gap-2 px-2 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md shadow-sm"
    : "inline-flex items-center gap-4 px-5 py-3 rounded-full border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-md shadow-sm hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors";

  return (
    <div className={containerClasses}>
      {/* Circle container */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg height={size} width={size} className="-rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={trackClass}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ 
              strokeDashoffset, 
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              ...(glow ? { filter: `drop-shadow(${glow})` } : {})
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={colorClass}
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-slate-800 dark:text-slate-200">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Text block */}
      {(label || subLabel) && (
        <div className="flex flex-col justify-center">
          {label && <span className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">{label}</span>}
          {subLabel && <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">{subLabel}</span>}
        </div>
      )}
    </div>
  );
}
