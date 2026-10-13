'use client';

import React from 'react';
import {
  SourcePlatform,
  AccessType,
  PLATFORM_CONFIGS,
} from '@/types/discover';
import { Filter, RotateCcw } from 'lucide-react';

interface SourceFilterPanelProps {
  selectedPlatforms: SourcePlatform[];
  onTogglePlatform: (platform: SourcePlatform) => void;
  selectedAccessTypes: AccessType[];
  onToggleAccessType: (access: AccessType) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  availableCategories: string[];
  totalResults?: number;
  onResetFilters: () => void;
}

export function SourceFilterPanel({
  selectedPlatforms,
  onTogglePlatform,
  selectedAccessTypes,
  onToggleAccessType,
  selectedCategory,
  onSelectCategory,
  availableCategories,
  onResetFilters,
}: SourceFilterPanelProps) {
  const allPlatforms: SourcePlatform[] = [
    'nptel',
    'swayam',
    'mit_ocw',
    'mitx',
    'khan_academy',
    'edx',
    'coursera',
  ];

  const accessOptions: { id: AccessType; label: string }[] = [
    { id: 'free', label: '100% Free' },
    { id: 'free_paid_cert', label: 'Free Learning (Paid Cert)' },
    { id: 'audit_limited', label: 'Free Audit' },
  ];

  const hasActiveFilters =
    selectedPlatforms.length > 0 ||
    selectedAccessTypes.length > 0 ||
    selectedCategory !== null;

  return (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EDEDE8]">
          <Filter className="w-3.5 h-3.5 text-[#E06D3B]" />
          <span>Catalog Filters</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E06D3B] hover:text-indigo-300 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Platform Filter */}
      <div>
        <label className="block text-xs font-bold text-[#EDEDE8] mb-2.5">
          Learning Platforms
        </label>
        <div className="space-y-1.5">
          {allPlatforms.map((pId) => {
            const config = PLATFORM_CONFIGS[pId];
            const isSelected = selectedPlatforms.includes(pId);
            return (
              <label
                key={pId}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'bg-white/[0.02] text-[#9E9EA8] border-white/[0.06] hover:border-white/20 hover:text-[#EDEDE8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTogglePlatform(pId)}
                    className="w-3.5 h-3.5 rounded text-[#E06D3B] focus:ring-indigo-500 border-zinc-700 cursor-pointer"
                  />
                  <span>{config.icon}</span>
                  <span className="truncate">{config.name}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Access Type Filter */}
      <div>
        <label className="block text-xs font-bold text-[#EDEDE8] mb-2.5">
          Access Policy
        </label>
        <div className="space-y-1.5">
          {accessOptions.map((opt) => {
            const isSelected = selectedAccessTypes.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.02] text-[#9E9EA8] border-white/[0.06] hover:border-white/20 hover:text-[#EDEDE8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleAccessType(opt.id)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-700 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Categories Filter */}
      {availableCategories.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-[#EDEDE8] mb-2.5">
            Subject Domain
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all border cursor-pointer ${
                selectedCategory === null
                  ? 'bg-white text-black border-white shadow-xs'
                  : 'bg-white/[0.03] text-[#9E9EA8] border-white/[0.08] hover:border-white/20 hover:text-[#EDEDE8]'
              }`}
            >
              All Subjects
            </button>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(isSelected ? null : cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#E06D3B] text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'bg-white/[0.03] text-[#9E9EA8] border-white/[0.08] hover:border-white/20 hover:text-[#EDEDE8]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
