'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ExternalLink,
  GraduationCap,
  Clock,
  Video,
  FileText,
  FileQuestion,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
} from 'lucide-react';
import { CatalogCourse, CatalogCourseDetail } from '@/types/discover';
import { SourceBadge } from './SourceBadge';
import { AccessBadge } from './AccessBadge';
import { api } from '@/lib/api';

interface CourseDetailModalProps {
  course: CatalogCourse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetailModal({
  course,
  isOpen,
  onClose,
}: CourseDetailModalProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<CatalogCourseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  useEffect(() => {
    if (!course || !isOpen) {
      setDetail(null);
      setEnrolled(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .getCatalogCourse(course.source_platform, course.source_id)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [course, isOpen]);

  if (!isOpen || !course) return null;

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await api.ingestCatalogCourse(course.source_platform, course.source_id);
      setEnrolled(true);
      setTimeout(() => {
        onClose();
        router.push(`/courses/${res.courseId}/dashboard`);
      }, 700);
    } catch (err) {
      console.error('Failed to enroll course', err);
      setEnrolling(false);
    }
  };

  const modules = detail?.modules || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge platform={course.source_platform} size="md" />
              <AccessBadge
                accessType={course.access_type}
                certificateAvailable={course.certificate_available}
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight mb-2">
            {course.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
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
              <span>View on {course.source_platform_name}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Course Overview
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Resource Highlights */}
          {course.resource_summary && course.resource_summary.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Included Learning Resources
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {course.resource_summary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus & Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Detailed Syllabus & Structure ({modules.length} Modules)
              </h4>
              {modules.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = Object.keys(expandedModules).length === modules.length;
                    if (allOpen) {
                      setExpandedModules({});
                    } else {
                      const all: Record<number, boolean> = {};
                      modules.forEach((_, i) => (all[i] = true));
                      setExpandedModules(all);
                    }
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Toggle All
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                Loading syllabus structure...
              </div>
            ) : modules.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
                Module list is available directly on the original course page at {course.source_platform_name}.
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod, idx) => {
                  const isOpenMod = expandedModules[idx] ?? false;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleModule(idx)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {mod.title}
                          </div>
                          {mod.description && (
                            <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                              {mod.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <span className="text-[11px] font-mono font-medium">
                            {mod.resources.length} items
                          </span>
                          {isOpenMod ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isOpenMod && (
                        <div className="px-4 pb-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                          {mod.resources.map((res, rIdx) => {
                            const isVideo = res.resource_type === 'video';
                            const isNote = res.resource_type === 'lecture_note';
                            return (
                              <div
                                key={rIdx}
                                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 text-xs"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  {isVideo ? (
                                    <Video className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  ) : isNote ? (
                                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  ) : (
                                    <FileQuestion className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  )}
                                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                    {res.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 shrink-0">
                                  {res.duration_minutes && (
                                    <span>{res.duration_minutes}m</span>
                                  )}
                                  {res.downloadable && (
                                    <Download className="w-3 h-3 text-zinc-400" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            Enrolling integrates course lectures & notes with KnowTrace AI grounding.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
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
                  <span>Enrolled! Launching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enroll in KnowTrace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
