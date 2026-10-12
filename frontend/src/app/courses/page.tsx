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
    <div className="min-h-screen bg-black text-[#EDEDE8] flex flex-col relative selection:bg-[#DEDBC8] selection:text-black">
      {/* Noise Texture */}
      <div className="fixed inset-0 noise-overlay opacity-[0.5] mix-blend-overlay pointer-events-none z-0" />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Floating Island Navbar */}
      <header className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4">
        <nav className="bg-[#0A0A0E]/80 backdrop-blur-2xl rounded-full px-4 sm:px-6 py-2.5 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" priority />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-[#9E9EA8] hover:text-[#EDEDE8] px-3 py-1.5 rounded-full transition-colors hover:bg-white/5"
            >
              Overview
            </Link>

            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#EDEDE8] text-xs font-semibold transition-all hover:border-white/20"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Discover</span>
            </Link>

            <Link
              href="/courses/new"
              className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-white text-black hover:bg-[#DEDBC8] text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>+ Course</span>
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                <Plus className="w-3 h-3 text-black" />
              </span>
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10">
              {user ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs text-indigo-300 font-medium hidden md:inline-block max-w-[110px] truncate"
                    title={user.email}
                  >
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-[#9E9EA8] hover:text-rose-400 px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-[#EDEDE8] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors font-medium cursor-pointer"
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider font-semibold mb-3">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Adaptive Bayesian Learning Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#EDEDE8] tracking-tight">
              Learning Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#9E9EA8] mt-2 max-w-xl leading-relaxed">
              Enrolled university courses with real-time concept knowledge tracing, misconception diagnostics, and grounded tutor citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all active:scale-95"
            >
              <span>Explore Course Catalogs</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
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
