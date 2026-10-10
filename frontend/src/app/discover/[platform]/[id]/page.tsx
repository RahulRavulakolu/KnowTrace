'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Video,
  FileText,
  FileQuestion,
  Download,
  Check,
} from 'lucide-react';
import { CatalogCourseDetail } from '@/types/discover';
import { SourceBadge } from '@/components/discover/SourceBadge';
import { AccessBadge } from '@/components/discover/AccessBadge';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';

export default function DiscoverCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params?.platform as string;
  const id = params?.id as string;

  const [course, setCourse] = useState<CatalogCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!platform || !id) return;
    let isMounted = true;
    setLoading(true);

    api
      .getCatalogCourse(platform, id)
      .then((data) => {
        if (isMounted) {
          setCourse(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load course detail', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [platform, id]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const res = await api.ingestCatalogCourse(course.source_platform, course.source_id);
      setEnrolled(true);
      setTimeout(() => {
        router.push(`/courses/${res.courseId}/dashboard`);
      }, 700);
    } catch (err) {
      console.error('Failed to enroll', err);
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center">
          <Logo href="/" size="md" />
        </header>
        <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
          Loading course details from {platform}...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center">
          <Logo href="/" size="md" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-lg font-bold mb-2">Course Not Found</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Could not locate course "{id}" on platform "{platform}".
          </p>
          <Link
            href="/discover"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/discover"
            className="p-2 -ml-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Logo href="/" size="md" />
        </div>

        <Link
          href="/discover"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Explore All Courses
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Course Banner */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <SourceBadge platform={course.source_platform} size="md" />
            <AccessBadge
              accessType={course.access_type}
              certificateAvailable={course.certificate_available}
            />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 leading-tight mb-4">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 mb-6">
            <span className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              {course.institution}
            </span>
            {course.instructor && (
              <span>Instructor: {course.instructor}</span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {course.duration}
              </span>
            )}
            <a
              href={course.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              <span>Original Source Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl mb-8">
            {course.description}
          </p>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {course.video_count > 0 && <span>🎥 {course.video_count} Video Lectures</span>}
              {course.lecture_note_count > 0 && <span>📄 {course.lecture_note_count} Lecture Notes</span>}
              {course.assignment_count > 0 && <span>📝 {course.assignment_count} Assignments</span>}
            </div>

            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                enrolled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/20'
              }`}
            >
              {enrolling ? (
                <span className="animate-spin text-sm">🌀</span>
              ) : enrolled ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enrolled! Launching KnowTrace...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enroll Free in KnowTrace Tutor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modules Breakdown */}
        {course.modules && course.modules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Course Structure & Syllabus
            </h2>

            {course.modules.map((mod, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  {mod.title}
                </div>
                {mod.description && (
                  <p className="text-xs text-zinc-500 mb-3">{mod.description}</p>
                )}

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {mod.resources.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950"
                    >
                      <div className="flex items-center gap-2">
                        {res.resource_type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-rose-500" />
                        ) : res.resource_type === 'lecture_note' ? (
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <FileQuestion className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {res.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {res.duration_minutes && <span>{res.duration_minutes}m</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
