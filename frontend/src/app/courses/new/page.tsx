'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Clock, Target } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';

export default function CreateCoursePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('Computer Science & AI');
  const [examDate, setExamDate] = useState('2026-11-20');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [targetMastery, setTargetMastery] = useState(85);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const course = await api.createCourse({
        name,
        domain,
        examDate,
        hoursAvailablePerDay: Number(hoursPerDay),
        targetMastery: Number(targetMastery),
      });
      router.push(`/courses/${course.id}/upload`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#EDEDE8] flex flex-col justify-between p-4 sm:p-6 relative selection:bg-[#DEDBC8] selection:text-black">
      {/* Noise Texture */}
      <div className="fixed inset-0 noise-overlay opacity-[0.5] mix-blend-overlay pointer-events-none z-0" />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="relative z-10 max-w-2xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E9EA8] hover:text-[#EDEDE8] px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>

        <Logo href="/" size="sm" />
      </div>

      <div className="relative z-10 max-w-xl w-full mx-auto my-8 rounded-[2rem] p-1 bg-white/[0.03] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="rounded-[calc(2rem-0.25rem)] bg-[#0C0C14]/95 p-8 sm:p-10 backdrop-blur-xl border border-white/[0.02]">
          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800">
              Step 1 of 3 • Course Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EDEDE8] mt-3 tracking-tight">
              Create a New Learning Course
            </h1>
            <p className="text-xs text-[#9E9EA8] mt-2 leading-relaxed">
              Specify your course details and target timeline so our adaptive engine can formulate
              personalized study schedules and knowledge graph constraints.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-[#EDEDE8] mb-1.5">
                Course Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CS 229: Machine Learning & Optimization"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#EDEDE8] placeholder:text-[#9E9EA8]/60 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#EDEDE8] mb-1.5">
                Domain / Subject
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Computer Science, Medicine, Organic Chemistry"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#EDEDE8] placeholder:text-[#9E9EA8]/60 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#EDEDE8] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Exam / Deadline Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#EDEDE8] focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-[#EDEDE8] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Hours Available Per Day</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  required
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#EDEDE8] focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-[#EDEDE8] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Mastery Threshold</span>
                </label>
                <span className="font-mono font-bold text-indigo-400 text-xs">
                  {targetMastery}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={targetMastery}
                onChange={(e) => setTargetMastery(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-[#9E9EA8] mt-1">
                <span>60% (Competency)</span>
                <span>80% (Proficiency)</span>
                <span>95% (Excellence)</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Creating Course...' : 'Create Course & Proceed to Upload'}</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="relative z-10 text-center text-xs text-[#9E9EA8]/60">
        KnowTrace Adaptive Learning System • Step 1: Course Configuration
      </div>
    </div>
  );
}
