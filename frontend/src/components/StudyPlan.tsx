'use client';

import React from 'react';
import { StudyPlanBlock } from '@/types';
import { Clock, CheckCircle2, Circle, ArrowRight, BookOpen, HelpCircle, RotateCcw, Video, BotMessageSquare } from 'lucide-react';
import Link from 'next/link';

interface StudyPlanProps {
  blocks: StudyPlanBlock[];
  courseId: string;
  onToggleBlock: (blockId: string) => void;
}

export function StudyPlan({ blocks, courseId, onToggleBlock }: StudyPlanProps) {
  const grouped = {
    today: blocks.filter((b) => b.day === 'today'),
    tomorrow: blocks.filter((b) => b.day === 'tomorrow'),
    upcoming: blocks.filter((b) => b.day === 'upcoming'),
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'Study':
        return <BookOpen className="w-3.5 h-3.5 text-[#E06D3B]" />;
      case 'Practice':
        return <HelpCircle className="w-3.5 h-3.5 text-[#3E8E68]" />;
      case 'Revise':
        return <RotateCcw className="w-3.5 h-3.5 text-[#D48838]" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-[#E06D3B]" />;
    }
  };

  const getActivityBadge = (activity: string) => {
    switch (activity) {
      case 'Study':
        return 'bg-[#E06D3B]/15 text-[#E06D3B] border-[#E06D3B]/30';
      case 'Practice':
        return 'bg-[#3E8E68]/15 text-[#3E8E68] border-[#3E8E68]/30';
      case 'Revise':
        return 'bg-[#D48838]/15 text-[#D48838] border-[#D48838]/30';
      default:
        return 'bg-[#141619] text-[#C8C6B9] border-[#1D2024]';
    }
  };

  const renderSection = (title: string, list: StudyPlanBlock[], isToday = false) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3
            className={`text-xs font-bold uppercase tracking-wider font-mono ${
              isToday ? 'text-[#E06D3B]' : 'text-[#7E8078]'
            }`}
          >
            {title}
          </h3>
          <span className="text-[11px] text-[#7E8078] font-mono">
            {list.reduce((acc, b) => acc + (b.completed ? 0 : b.durationMinutes), 0)} min remaining
          </span>
        </div>

        {list.length === 0 ? (
          <div className="p-4 rounded-xl border border-[#1D2024] bg-[#0C0D0E] text-xs text-[#7E8078] text-center font-mono">
            No tasks scheduled for this period.
          </div>
        ) : (
          <div className="space-y-2.5">
            {list.map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  block.completed
                    ? 'bg-[#0C0D0E]/60 border-[#1D2024] opacity-50'
                    : 'bg-[#0C0D0E] border-[#1D2024] shadow-xs hover:border-[#E06D3B]/40'
                }`}
              >
                {/* Left check and info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleBlock(block.id)}
                    className="mt-0.5 text-[#7E8078] hover:text-[#E06D3B] transition-colors cursor-pointer shrink-0"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#3E8E68]" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-[#E06D3B]" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          block.completed
                            ? 'line-through text-[#7E8078]'
                            : 'text-[#F6F5EE]'
                        }`}
                      >
                        {block.conceptName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${getActivityBadge(
                          block.activity
                        )}`}
                      >
                        {getActivityIcon(block.activity)}
                        <span>{block.activity}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#7E8078] font-mono">
                      <span>{block.timeSlot}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {block.durationMinutes} min
                      </span>
                    </div>

                    <p className="text-xs text-[#7E8078] pt-1 leading-relaxed">
                      <span className="font-semibold text-[#C8C6B9]">Reason: </span>
                      {block.reason}
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                {!block.completed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={
                        block.activity === 'Practice'
                          ? `/courses/${courseId}/quiz/new?concept=${block.conceptId}`
                          : block.lectureId
                          ? `/courses/${courseId}/lectures?lectureId=${block.lectureId}`
                          : `/courses/${courseId}/lectures`
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E06D3B] hover:bg-[#FF9457] text-white text-xs font-bold transition-all shrink-0 active:scale-95 shadow-xs font-mono"
                    >
                      {block.activity === 'Practice' ? (
                        <>
                          <span>Practice Quiz</span>
                          <ArrowRight className="w-3 h-3 text-white" />
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5 text-white" />
                          <span>Watch Lecture</span>
                        </>
                      )}
                    </Link>

                    <Link
                      href={`/courses/${courseId}/tutor?prompt=${encodeURIComponent(`Can you explain the key intuition behind ${block.conceptName}?`)}`}
                      title="Ask AI Tutor about this concept"
                      className="p-1.5 rounded-lg bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 text-[#C8C6B9] hover:text-[#F6F5EE] transition-colors"
                    >
                      <BotMessageSquare className="w-3.5 h-3.5 text-[#E06D3B]" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderSection('Today', grouped.today, true)}
      {renderSection('Tomorrow', grouped.tomorrow)}
      {renderSection('Later This Week', grouped.upcoming)}
    </div>
  );
}
