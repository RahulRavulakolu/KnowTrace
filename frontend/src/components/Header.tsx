'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, RotateCcw, AlertTriangle, User, ChevronRight, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 md:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link
            href={`/courses/${courseId}/dashboard`}
            className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 truncate max-w-[140px] sm:max-w-xs"
          >
            {courseName}
          </Link>
          {title && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shadow-2xs active:scale-95"
          title="View all your enrolled courses"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>My Enrolled Courses</span>
        </Link>
        {activeMisconceptions > 0 && (
          <Link
            href={`/courses/${courseId}/misconceptions`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>{activeMisconceptions} Misconceptions</span>
          </Link>
        )}

        <button
          type="button"
          onClick={handleReset}
          title="Reset demo data"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xs font-bold text-xs uppercase">
                {user.name ? user.name[0] : user.email[0]}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate">
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
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
