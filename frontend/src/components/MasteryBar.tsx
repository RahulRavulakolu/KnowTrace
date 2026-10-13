'use client';

import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { getMasteryColor } from '@/lib/utils';

interface MasteryBarProps {
  name: string;
  mastery: number; // 0 - 100
  uncertainty?: number; // +/- interval e.g. 15
  forgettingRisk?: 'low' | 'medium' | 'high';
  lastPracticedDaysAgo?: number;
  onClick?: () => void;
}

export function MasteryBar({
  name,
  mastery,
  uncertainty = 10,
  forgettingRisk,
  lastPracticedDaysAgo,
  onClick,
}: MasteryBarProps) {
  const color = getMasteryColor(mastery);
  const minEstimate = Math.max(0, mastery - uncertainty);
  const maxEstimate = Math.min(100, mastery + uncertainty);

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl border border-[#1D2024] bg-[#141619] shadow-xs hover:border-[#E06D3B]/40 transition-all ${
        onClick ? 'cursor-pointer hover:bg-[#1A1D21]' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[#F6F5EE] truncate">
              {name}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color.bg} ${color.border}`}
            >
              {color.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-[#7E8078]">
            {uncertainty !== undefined && (
              <span className="font-mono text-[11px]">
                Estimate: <strong className="text-[#F6F5EE]">{mastery}%</strong> (±{uncertainty}%)
              </span>
            )}
            {lastPracticedDaysAgo !== undefined && (
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-[#7E8078]" />
                {lastPracticedDaysAgo === 0 ? 'Today' : `${lastPracticedDaysAgo}d ago`}
              </span>
            )}
          </div>
        </div>

        {forgettingRisk === 'high' && (
          <div className="flex items-center gap-1 text-xs font-medium text-[#C94A44] bg-[#C94A44]/15 px-2 py-1 rounded-md border border-[#C94A44]/30 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-[#C94A44]" />
            <span className="text-[11px] font-mono uppercase">Decay Alert</span>
          </div>
        )}
      </div>

      {/* Bar with uncertainty shadow interval */}
      <div className="relative w-full h-2.5 bg-[#1D2024] rounded-full overflow-hidden">
        {/* Uncertainty Range Band (subtle hatched or lighter shade) */}
        <div
          className="absolute top-0 bottom-0 bg-[#E06D3B]/20 transition-all duration-500"
          style={{
            left: `${minEstimate}%`,
            width: `${maxEstimate - minEstimate}%`,
          }}
          title={`Bayesian confidence interval: ${minEstimate}% - ${maxEstimate}%`}
        />

        {/* Primary Mastery Bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            mastery >= 75
              ? 'bg-[#3E8E68]'
              : mastery >= 50
              ? 'bg-[#D48838]'
              : 'bg-[#C94A44]'
          }`}
          style={{ width: `${mastery}%` }}
        />
      </div>
    </div>
  );
}
