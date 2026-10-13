'use client';

import React from 'react';
import { PlanUpdateDiff } from '@/types';
import { ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle, Sparkles, Clock } from 'lucide-react';

interface PlanDiffProps {
  diff: PlanUpdateDiff;
}

export function PlanDiff({ diff }: PlanDiffProps) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'moved_up':
        return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'moved_down':
        return <ArrowDownRight className="w-4 h-4 text-emerald-500" />;
      case 'added':
        return <PlusCircle className="w-4 h-4 text-[#E06D3B]" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-zinc-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#E06D3B]" />;
    }
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'moved_up':
        return 'bg-[#C94A44]/15 text-[#C94A44] border-[#C94A44]/30';
      case 'moved_down':
        return 'bg-[#3E8E68]/15 text-[#3E8E68] border-[#3E8E68]/30';
      case 'added':
        return 'bg-[#E06D3B]/15 text-[#E06D3B] border-[#E06D3B]/30';
      default:
        return 'bg-[#141619] text-[#C8C6B9] border-[#1D2024]';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-xs space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E06D3B] animate-ping" />
          <span className="font-bold text-[#F6F5EE] flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#E06D3B]" />
            Adaptive Schedule Re-balanced
          </span>
        </div>
        <span className="text-[11px] text-[#7E8078] font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {diff.timestamp}
        </span>
      </div>

      <div className="text-xs text-[#C8C6B9] font-medium font-mono">
        {diff.triggerEvent}
      </div>

      <div className="space-y-2 pt-1">
        {diff.changes.map((ch, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-xs"
          >
            <div className="mt-0.5">{getChangeIcon(ch.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#F6F5EE]">
                  {ch.conceptName}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono ${getChangeBadge(
                    ch.type
                  )}`}
                >
                  {ch.type === 'moved_up'
                    ? '↑ Prioritized'
                    : ch.type === 'moved_down'
                    ? '↓ Deprioritized'
                    : '+ Added'}
                </span>
              </div>
              <p className="text-[#7E8078] text-[11px] mt-0.5">{ch.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
