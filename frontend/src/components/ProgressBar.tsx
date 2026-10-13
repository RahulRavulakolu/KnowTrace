'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'indigo' | 'terracotta' | 'emerald' | 'amber' | 'rose' | 'gradient';
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  label,
  subLabel,
  size = 'md',
  variant = 'indigo',
  showPercentage = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantGradients = {
    indigo: 'bg-[#E06D3B]',
    terracotta: 'bg-[#E06D3B]',
    emerald: 'bg-[#3E8E68]',
    amber: 'bg-[#D48838]',
    rose: 'bg-[#C94A44]',
    gradient: 'bg-gradient-to-r from-[#E06D3B] via-[#D48838] to-[#3E8E68]',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <div className="flex items-center gap-2">
            {label && <span className="font-semibold text-[#F6F5EE]">{label}</span>}
            {subLabel && <span className="text-[#7E8078] text-[11px]">{subLabel}</span>}
          </div>
          {showPercentage && (
            <span className="font-mono font-bold text-[#C8C6B9]">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-[#1D2024] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantGradients[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
