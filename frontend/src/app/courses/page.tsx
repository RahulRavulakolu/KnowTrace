'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Plus, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Course } from '@/types';
import { CourseCard } from '@/components/CourseCard';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CoursesListPage() {
  const { user, openAuthModal, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getAllCourses()
      .then((data) => {
        if (isMounted) {
          setCourses(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load courses', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F6F5EE] flex flex-col relative selection:bg-[#E06D3B] selection:text-black">
      {/* Noise Texture */}
      <div className="fixed inset-0 noise-overlay opacity-[0.5] mix-blend-overlay pointer-events-none z-0" />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[350px] bg-[#E06D3B]/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Floating Island Navbar */}
      <header className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4">
        <nav className="bg-[#141619]/90 backdrop-blur-2xl rounded-full px-4 sm:px-6 py-2.5 border border-[#1D2024] shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" priority />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1D21] border border-[#1D2024] text-[#E06D3B] text-[10px] font-bold uppercase tracking-wider font-mono">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-[#7E8078] hover:text-[#F6F5EE] px-3 py-1.5 rounded-full transition-colors hover:bg-[#1A1D21]"
            >
              Overview
            </Link>

            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A1D21] hover:bg-[#1D2024] border border-[#1D2024] text-[#F6F5EE] text-xs font-semibold transition-all hover:border-[#E06D3B]/40"
            >
              <Compass className="w-3.5 h-3.5 text-[#E06D3B]" />
              <span>Discover</span>
            </Link>

            <Link
              href="/courses/new"
              className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-[#E06D3B] text-black hover:bg-[#FF9457] text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer font-mono"
            >
              <span>+ Course</span>
              <span className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center">
                <Plus className="w-3 h-3 text-black" />
              </span>
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#1D2024]">
              {user ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs text-[#E06D3B] font-medium hidden md:inline-block max-w-[110px] truncate font-mono"
                    title={user.email}
                  >
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-[#7E8078] hover:text-[#C94A44] px-2.5 py-1 rounded-full hover:bg-[#1A1D21] transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-[#F6F5EE] bg-[#1A1D21] hover:bg-[#1D2024] px-3 py-1 rounded-full transition-colors font-medium cursor-pointer border border-[#1D2024]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Workspace Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Workspace Title & Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#1D2024]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E06D3B]/10 border border-[#E06D3B]/25 text-[#E06D3B] text-[10px] uppercase tracking-wider font-semibold mb-3 font-mono">
              <Layers className="w-3.5 h-3.5 text-[#E06D3B]" />
              <span>Adaptive Bayesian Learning Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F6F5EE] tracking-tight">
              Learning Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#7E8078] mt-2 max-w-xl leading-relaxed">
              Enrolled university courses with real-time concept knowledge tracing, misconception diagnostics, and grounded tutor citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-[#E06D3B] hover:bg-[#FF9457] text-black text-xs font-bold shadow-md transition-all active:scale-95 font-mono"
            >
              <span>Explore Course Catalogs</span>
              <span className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </span>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-[1.75rem] p-1 bg-white/[0.02] border border-white/[0.05] animate-pulse"
              >
                <div className="h-full rounded-[calc(1.75rem-0.25rem)] bg-[#0C0C14]/70 p-6" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center rounded-[2rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-[#EDEDE8] mb-2 tracking-tight">
              No enrolled courses yet
            </h3>
            <p className="text-xs sm:text-sm text-[#9E9EA8] mb-8 leading-relaxed max-w-sm mx-auto">
              Discover free open-access courses across NPTEL, MIT OpenCourseWare, Stanford, and more.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 pl-5 pr-2 py-2.5 rounded-full bg-white hover:bg-[#DEDBC8] text-black text-xs font-bold shadow-lg transition-all"
            >
              <span>Browse Catalog</span>
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5 text-black" />
              </span>
            </Link>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
