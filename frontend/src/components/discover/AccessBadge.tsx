'use client';

import React from 'react';
import { AccessType, ACCESS_TYPE_CONFIGS } from '@/types/discover';

interface AccessBadgeProps {
  accessType: AccessType;
  certificateAvailable?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function AccessBadge({
  accessType,
  certificateAvailable = false,
  size = 'md',
  className = '',
}: AccessBadgeProps) {
  const config = ACCESS_TYPE_CONFIGS[accessType] || ACCESS_TYPE_CONFIGS.free;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 rounded-full font-semibold border border-transparent ${config.bgColor} ${config.color} ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{config.label}</span>
      </span>

      {certificateAvailable && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
          title="Recognized academic or proctored certificate available upon completion"
        >
          📜 Certificate
        </span>
      )}
    </div>
  );
}
