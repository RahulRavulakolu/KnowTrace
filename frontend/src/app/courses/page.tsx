'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Plus, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Course } from '@/types';
import { CourseCard } from '@/components/CourseCard';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';

export default function CoursesListPage() {
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
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Logo href="/" size="md" priority />

        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Courses</span>
          </Link>

          <Link
            href="/courses/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Course</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              My Learning Workspace
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Active courses with adaptive knowledge tracing and grounded tutoring
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Multi-Platform Catalog</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto">
            <BookOpen className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              No enrolled courses yet
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Discover free courses from NPTEL, SWAYAM, MIT OCW, MITx, Khan Academy, and more.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Course Catalog</span>
            </Link>
          </div>
        ) : (
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
