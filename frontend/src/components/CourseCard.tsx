'use client';

import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { Calendar, Clock, ArrowRight, AlertTriangle, GraduationCap, Award } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { SourceBadge } from './discover/SourceBadge';
import { SourcePlatform } from '@/types/discover';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group rounded-[1.75rem] p-1 bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-2xl hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] flex flex-col justify-between">
      <div className="rounded-[calc(1.75rem-0.25rem)] bg-[#0C0C14]/95 p-6 backdrop-blur-xl flex flex-col justify-between h-full border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {course.source_platform && (
                <SourceBadge platform={course.source_platform as SourcePlatform} size="sm" />
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/80">
                {course.domain}
              </span>
              {course.certificate_available && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Award className="w-3 h-3 text-amber-400" />
                  Certificate
                </span>
              )}
            </div>
            {course.activeMisconceptionsCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-300 bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-800/70 shadow-xs">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                {course.activeMisconceptionsCount} Gaps
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#EDEDE8] group-hover:text-white transition-colors mb-1.5 tracking-tight">
            {course.name}
          </h3>

          {(course.instructor || course.institution) && (
            <div className="flex items-center gap-1.5 text-xs text-[#9E9EA8] mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
              <span className="truncate">
                {[course.instructor, course.institution].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-[#9E9EA8] mb-6 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400/80" />
              <span>Exam: {course.examDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400/80" />
              <span>{course.hoursAvailablePerDay}h / day</span>
            </div>
          </div>

          <div className="mb-6">
            <ProgressBar
              progress={course.overallMastery}
              label="Overall Mastery"
              variant={course.overallMastery >= 75 ? 'emerald' : course.overallMastery >= 50 ? 'amber' : 'rose'}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between mt-auto">
          <div className="text-[11px] text-[#9E9EA8]">
            <span>{course.conceptCount} Concepts • {course.materialsCount} Sources</span>
          </div>

          <div className="flex items-center gap-2">
            {course.certificate_available && (
              <Link
                href={`/courses/${course.id}/certificate`}
                className="p-2 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors"
                title="View Course Certificate"
              >
                <Award className="w-3.5 h-3.5" />
              </Link>
            )}

            <Link
              href={`/courses/${course.id}/dashboard`}
              className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white/10 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 text-[#EDEDE8] hover:text-white text-xs font-semibold shadow-md transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white cursor-pointer"
            >
              <span>Workspace</span>
              <span className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center transition-transform group-hover:scale-105">
                <ArrowRight className="w-3.5 h-3.5 text-[#EDEDE8]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
