'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  FileText,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { CatalogCourse } from '@/types/discover';
import { SourceBadge } from './SourceBadge';
import { AccessBadge } from './AccessBadge';
import { api } from '@/lib/api';

interface CatalogCourseCardProps {
  course: CatalogCourse;
  onPreview?: (course: CatalogCourse) => void;
  isEnrolled?: boolean;
}

export function CatalogCourseCard({
  course,
  onPreview,
  isEnrolled = false,
}: CatalogCourseCardProps) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  const handleEnroll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enrolled) {
      router.push('/courses');
      return;
    }
    setEnrolling(true);
    try {
      const res = await api.ingestCatalogCourse(course.source_platform, course.source_id);
      setEnrolled(true);
      setTimeout(() => {
        router.push(`/courses/${res.courseId}/dashboard`);
      }, 600);
    } catch (err) {
      console.error('Enrollment failed', err);
      setEnrolling(false);
    }
  };

  return (
    <div
      onClick={() => onPreview?.(course)}
      className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer text-left"
    >
      <div>
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <SourceBadge platform={course.source_platform} size="sm" />
          <AccessBadge
            accessType={course.access_type}
            certificateAvailable={course.certificate_available}
            size="sm"
          />
        </div>

        {/* Institution & Instructor */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
            {course.institution}
          </span>
          {course.instructor && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="truncate">{course.instructor}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2">
          {course.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {course.description}
        </p>

        {/* Resource Breakdown Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] text-zinc-600 dark:text-zinc-400">
          {course.video_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-medium">
              <Video className="w-3 h-3 text-rose-500" />
              <span>{course.video_count} Videos</span>
            </span>
          )}
          {course.lecture_note_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-medium">
              <FileText className="w-3 h-3 text-blue-500" />
              <span>{course.lecture_note_count} Notes</span>
            </span>
          )}
          {course.duration && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-medium">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{course.duration}</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        <a
          href={course.source_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          title="Open original course page"
        >
          <span>Source</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(course);
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Syllabus
          </button>

          <button
            type="button"
            onClick={handleEnroll}
            disabled={enrolling}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              enrolled
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            {enrolling ? (
              <span className="animate-spin text-xs">🌀</span>
            ) : enrolled ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Enrolled</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enroll Free</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
