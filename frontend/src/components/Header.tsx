'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, AlertTriangle, ChevronRight, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { SidebarTrigger } from './ui/sidebar';

interface HeaderProps {
  courseId: string;
  courseName?: string;
  title?: string;
  onMenuToggle?: () => void;
  activeMisconceptions?: number;
}

export function Header({
  courseId,
  courseName = 'CS 229 Machine Learning',
  title,
  onMenuToggle,
  activeMisconceptions = 2,
}: HeaderProps) {
  const { user, openAuthModal, logout } = useAuth();

  const handleReset = () => {
    if (confirm('Reset demo course data to fresh initial state?')) {
      api.resetDemoData(courseId);
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0C0D0E]/85 backdrop-blur-md border-b border-[#1D2024] px-4 sm:px-6 flex items-center justify-between text-[#F6F5EE]">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger
          onClick={onMenuToggle}
          className="-ml-1"
        />

        <div className="flex items-center gap-2 text-xs text-[#7E8078]">
          <Link
            href={`/courses/${courseId}/dashboard`}
            className="font-medium text-[#C8C6B9] hover:text-[#F6F5EE] truncate max-w-[140px] sm:max-w-xs transition-colors"
          >
            {courseName}
          </Link>
          {title && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#7E8078]" />
              <span className="font-bold text-[#F6F5EE]">{title}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141619] hover:bg-[#1A1D21] text-[#F6F5EE] border border-[#1D2024] text-xs font-semibold transition-all shadow-2xs active:scale-95"
          title="View all your enrolled courses"
        >
          <GraduationCap className="w-3.5 h-3.5 text-[#E06D3B]" />
          <span>My Enrolled Courses</span>
        </Link>
        {activeMisconceptions > 0 && (
          <Link
            href={`/courses/${courseId}/misconceptions`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C94A44]/15 text-[#C94A44] border border-[#C94A44]/30 hover:bg-[#C94A44]/25 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#C94A44]" />
            <span>{activeMisconceptions} Misconceptions</span>
          </Link>
        )}

        <button
          type="button"
          onClick={handleReset}
          title="Reset demo data"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#7E8078] hover:text-[#F6F5EE] hover:bg-[#141619] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-[#1D2024]">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1A1D21] border border-[#1D2024] text-[#E06D3B] flex items-center justify-center font-bold text-xs uppercase">
                {user.name ? user.name[0] : user.email[0]}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-[#F6F5EE] max-w-[120px] truncate">
                  {user.name || user.email.split('@')[0]}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-[10px] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E06D3B] hover:bg-[#FF9457] text-black font-mono text-white transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
