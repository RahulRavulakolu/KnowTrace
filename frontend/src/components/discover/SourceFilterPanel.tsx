'use client';

import React from 'react';
import {
  SourcePlatform,
  AccessType,
  PLATFORM_CONFIGS,
  ACCESS_TYPE_CONFIGS,
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
  totalResults: number;
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
  totalResults,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Catalog Filters</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Platform Filter */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2.5">
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
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTogglePlatform(pId)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
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
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2.5">
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
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleAccessType(opt.id)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
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
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2.5">
            Subject Domain
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
