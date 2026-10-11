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
      className="group rounded-[1.75rem] p-1 bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-2xl hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] flex flex-col justify-between cursor-pointer text-left"
    >
      <div className="rounded-[calc(1.75rem-0.25rem)] bg-[#0C0C14]/95 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between h-full border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div>
          {/* Top Badges Header */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <SourceBadge platform={course.source_platform} size="sm" />
            <AccessBadge
              accessType={course.access_type}
              certificateAvailable={course.certificate_available}
              size="sm"
            />
          </div>

          {/* Institution & Instructor */}
          <div className="flex items-center gap-1.5 text-xs text-[#9E9EA8] font-medium mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
            <span className="font-semibold text-[#EDEDE8] truncate">
              {course.institution}
            </span>
            {course.instructor && (
              <>
                <span className="text-white/20">•</span>
                <span className="truncate">{course.instructor}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[#EDEDE8] group-hover:text-white transition-colors line-clamp-2 leading-snug mb-2.5">
            {course.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#9E9EA8] line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>

          {/* Resource Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] text-[#EDEDE8]">
            {course.video_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] font-medium">
                <Video className="w-3 h-3 text-rose-400" />
                <span>{course.video_count} Videos</span>
              </span>
            )}
            {course.lecture_note_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] font-medium">
                <FileText className="w-3 h-3 text-blue-400" />
                <span>{course.lecture_note_count} Notes</span>
              </span>
            )}
            {course.duration && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] font-medium">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{course.duration}</span>
              </span>
            )}
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {course.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.02] text-[#9E9EA8] border border-white/[0.06]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2 mt-auto">
          <a
            href={course.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9E9EA8] hover:text-[#EDEDE8] transition-colors"
            title="Open original course page"
          >
            <span>Source</span>
            <ExternalLink className="w-3 h-3 text-[#9E9EA8]" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(course);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#9E9EA8] hover:text-[#EDEDE8] hover:bg-white/5 transition-colors cursor-pointer"
            >
              Syllabus
            </button>

            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className={`inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
                enrolled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95'
              }`}
            >
              {enrolling ? (
                <span className="animate-spin text-xs">🌀 Ingesting...</span>
              ) : enrolled ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Enrolled</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enroll Free</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center ml-0.5">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
