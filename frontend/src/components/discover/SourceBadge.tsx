'use client';

import React from 'react';
import { SourcePlatform, PLATFORM_CONFIGS } from '@/types/discover';

interface SourceBadgeProps {
  platform: SourcePlatform;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function SourceBadge({
  platform,
  size = 'md',
  showIcon = true,
  className = '',
}: SourceBadgeProps) {
  const config = PLATFORM_CONFIGS[platform] || {
    id: platform,
    name: platform.toUpperCase(),
    icon: '📚',
    color: 'text-zinc-700 dark:text-zinc-300',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    borderColor: 'border-zinc-300 dark:border-zinc-700',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border transition-all ${config.bgColor} ${config.color} ${config.borderColor} ${sizeClasses} ${className}`}
      title={`Educational source: ${config.name}`}
    >
      {showIcon && <span className="text-xs leading-none">{config.icon}</span>}
      <span>{config.name}</span>
    </span>
  );
}
