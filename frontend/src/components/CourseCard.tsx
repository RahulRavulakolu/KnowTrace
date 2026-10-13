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
    <div className="group rounded-[1.75rem] p-1 bg-[#141619] border border-[#1D2024] hover:border-[#E06D3B]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between">
      <div className="rounded-[calc(1.75rem-0.25rem)] bg-[#0C0D0E] p-6 backdrop-blur-xl flex flex-col justify-between h-full border border-[#1D2024]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {course.source_platform && (
                <SourceBadge platform={course.source_platform as SourcePlatform} size="sm" />
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#141619] text-[#C8C6B9] border border-[#1D2024] font-mono">
                {course.domain}
              </span>
              {course.certificate_available && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#D48838]/15 text-[#D48838] border border-[#D48838]/30 font-mono">
                  <Award className="w-3 h-3 text-[#D48838]" />
                  Certificate
                </span>
              )}
            </div>
            {course.activeMisconceptionsCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#C94A44] bg-[#C94A44]/15 px-2.5 py-0.5 rounded-full border border-[#C94A44]/30 shadow-xs font-mono">
                <AlertTriangle className="w-3 h-3 text-[#C94A44]" />
                {course.activeMisconceptionsCount} Gaps
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#F6F5EE] group-hover:text-[#E06D3B] transition-colors mb-1.5 tracking-tight">
            {course.name}
          </h3>

          {(course.instructor || course.institution) && (
            <div className="flex items-center gap-1.5 text-xs text-[#7E8078] mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-[#E06D3B] shrink-0" />
              <span className="truncate">
                {[course.instructor, course.institution].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-[#7E8078] mb-6 p-2.5 rounded-xl bg-[#141619] border border-[#1D2024] font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7E8078]" />
              <span>Exam: {course.examDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7E8078]" />
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

        <div className="pt-4 border-t border-[#1D2024] flex items-center justify-between mt-auto">
          <div className="text-[11px] text-[#7E8078] font-mono">
            <span>{course.conceptCount} Concepts • {course.materialsCount} Sources</span>
          </div>

          <div className="flex items-center gap-2">
            {course.certificate_available && (
              <Link
                href={`/courses/${course.id}/certificate`}
                className="p-2 rounded-full border border-[#D48838]/30 bg-[#D48838]/10 hover:bg-[#D48838]/20 text-[#D48838] text-xs font-semibold transition-colors"
                title="View Course Certificate"
              >
                <Award className="w-3.5 h-3.5" />
              </Link>
            )}

            <Link
              href={`/courses/${course.id}/dashboard`}
              className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#141619] hover:bg-[#E06D3B] border border-[#1D2024] hover:border-[#E06D3B] text-[#F6F5EE] hover:text-black text-xs font-semibold shadow-md transition-all duration-300 group-hover:bg-[#E06D3B] group-hover:text-black cursor-pointer font-mono"
            >
              <span>Workspace</span>
              <span className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center transition-transform group-hover:scale-105">
                <ArrowRight className="w-3.5 h-3.5 text-[#F6F5EE] group-hover:text-black" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
