'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { MasteryBar } from '@/components/MasteryBar';
import { MasteryChart } from '@/components/MasteryChart';
import { ProgressBar } from '@/components/ProgressBar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Course, Concept, Misconception, StudyPlanBlock, CourseCertificateDetails } from '@/types';
import {
  BotMessageSquare,
  HelpCircle,
  Network,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Video,
  PlayCircle,
  Award,
  CheckCircle2,
} from 'lucide-react';

export default function CourseDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const { data: course } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId),
  });

  const { data: concepts = [] } = useQuery<Concept[]>({
    queryKey: ['concepts', courseId],
    queryFn: () => api.getConcepts(courseId),
  });

  const { data: misconceptions = [] } = useQuery<Misconception[]>({
    queryKey: ['misconceptions', courseId],
    queryFn: () => api.getMisconceptions(courseId),
  });

  const { data: studyPlan = [] } = useQuery<StudyPlanBlock[]>({
    queryKey: ['studyPlan', courseId],
    queryFn: () => api.getStudyPlan(courseId),
  });

  const { data: certDetails } = useQuery<CourseCertificateDetails>({
    queryKey: ['certificate', courseId],
    queryFn: () => api.getCertificate(courseId),
  });

  const weakConcepts = concepts.filter((c) => c.mastery < 60);
  const forgettingRiskConcepts = concepts.filter((c) => c.forgettingRisk === 'high');
  const activeMisconceptions = misconceptions.filter((m) => m.status === 'active');
  const todayTasks = studyPlan.filter((b) => b.day === 'today');

  const overallMastery = course?.overallMastery ?? 64;

  return (
    <AppShell courseId={courseId} title="Learning Dashboard">
      <div className="space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Adaptive Learning Path Active
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, Alex!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
                Your estimated exam readiness is at{' '}
                <strong className="text-white font-mono">{overallMastery}%</strong>. Focus on{' '}
                <span className="text-amber-300 font-semibold">{course?.name?.includes('Math') ? 'Mathematical Induction' : 'Regularization'}</span> and review the
                active lecture videos to reach your 85% goal.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 shrink-0">
              <Link
                href={`/courses/${courseId}/lectures`}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Lectures</span>
              </Link>

              <Link
                href={`/courses/${courseId}/tutor`}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-xs">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Ask Tutor</span>
              </Link>

              <Link
                href={`/courses/${courseId}/quiz/new`}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-xs">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Take Quiz</span>
              </Link>

              <Link
                href={`/courses/${courseId}/map`}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-xs">
                  <Network className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Concept Map</span>
              </Link>

              <Link
                href={`/courses/${courseId}/plan`}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-xs">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Study Plan</span>
              </Link>

              <Link
                href={`/courses/${courseId}/certificate`}
                className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-amber-200">Certificate</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
              Overall Mastery
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                {overallMastery}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +6% this week
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar progress={overallMastery} size="sm" showPercentage={false} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
              Weak Concepts
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400">
                {weakConcepts.length}
              </span>
              <span className="text-[11px] text-zinc-400">Below 60% mark</span>
            </div>
            <div className="text-xs text-zinc-500 mt-2 truncate">
              {weakConcepts.map((c) => c.name).join(', ') || 'None detected'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
              Active Misconceptions
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
                {activeMisconceptions.length}
              </span>
              <Link
                href={`/courses/${courseId}/misconceptions`}
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Remediate →
              </Link>
            </div>
            <div className="text-xs text-zinc-500 mt-2 truncate">
              {activeMisconceptions[0]?.title || 'All clear'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
              Forgetting Risk
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-black text-rose-500">
                {forgettingRiskConcepts.length}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Spaced decay</span>
            </div>
            <div className="text-xs text-zinc-500 mt-2 truncate">
              {forgettingRiskConcepts.map((c) => c.name).join(', ') || 'No decay alerts'}
            </div>
          </div>
        </div>

        {/* Certificate Eligibility & Accreditation Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Official Certification Available
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {certDetails?.source_platform || 'NPTEL'} • {certDetails?.institution || 'IIT Madras'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  {certDetails?.eligible ? 'Criteria Met - Ready to Claim' : `${certDetails?.overall_progress_pct ?? 78}% Overall Progress`}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Course Certificate & Academic Accreditation
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Earn an official Verified Certificate of Cognitive Mastery by fulfilling 4 benchmarks (80% Concept Mastery, 80% Lecture Watch Time, 75% Diagnostic Exam, and 0 Misconceptions). Includes {certDetails?.platform_info?.platform || 'NPTEL'} proctored exam center guidelines.
              </p>

              {certDetails?.criteria?.concept_mastery && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.concept_mastery?.met ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Mastery</span>
                      {certDetails.criteria.concept_mastery?.met && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5">{certDetails.criteria.concept_mastery?.current}% / {certDetails.criteria.concept_mastery?.required}%</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.lecture_progress?.met ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Lectures</span>
                      {certDetails.criteria.lecture_progress?.met && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5">{certDetails.criteria.lecture_progress?.current}% / {certDetails.criteria.lecture_progress?.required}%</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.diagnostic_exam?.met ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Exam Score</span>
                      {certDetails.criteria.diagnostic_exam?.met && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5">{certDetails.criteria.diagnostic_exam?.current}% / {certDetails.criteria.diagnostic_exam?.required}%</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.critical_misconceptions?.met ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Misconceptions</span>
                      {certDetails.criteria.critical_misconceptions?.met && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5">{certDetails.criteria.critical_misconceptions?.current} remaining</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href={`/courses/${courseId}/certificate`}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 text-center"
              >
                <Award className="w-4 h-4 text-zinc-950" />
                <span>How to Get Certificate →</span>
              </Link>
              <Link
                href={`/courses/${courseId}/certificate#official-portal`}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 text-zinc-700 dark:text-zinc-300 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <span>Platform Exam Info</span>
              </Link>
            </div>
          </div>
        </div>

        {activeMisconceptions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start justify-between flex-wrap gap-4 shadow-xs">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Active Misconception: {activeMisconceptions[0].title}
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  {activeMisconceptions[0].description}
                </p>
              </div>
            </div>

            <Link
              href={`/courses/${courseId}/misconceptions`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Review 5-Step Remediation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Mastery Trajectory Over Time
                </h3>
                <p className="text-xs text-zinc-400">
                  Progress across quizzes and adaptive practice sessions
                </p>
              </div>
              <Link
                href={`/courses/${courseId}/map`}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Inspect Graph →
              </Link>
            </div>

            <MasteryChart />
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-indigo-500" />
                  <span>Today&apos;s Study Schedule</span>
                </h3>
                <Link
                  href={`/courses/${courseId}/plan`}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Full Plan →
                </Link>
              </div>

              <div className="space-y-3">
                {todayTasks.slice(0, 3).map((task) => {
                  const targetHref = task.lectureId
                    ? `/courses/${courseId}/lectures?lectureId=${task.lectureId}`
                    : task.activity === 'Practice'
                    ? `/courses/${courseId}/quiz/new?concept=${task.conceptId}`
                    : `/courses/${courseId}/lectures`;

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                          {task.conceptName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                          {task.durationMinutes}m
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 font-medium">
                          {task.activity === 'Study' ? (
                            <Video className="w-3 h-3 text-rose-500" />
                          ) : task.activity === 'Practice' ? (
                            <HelpCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <CalendarCheck className="w-3 h-3 text-amber-500" />
                          )}
                          <span>{task.activity}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400">{task.timeSlot}</span>
                      </div>
                      <div className="pt-1 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                          {task.lectureId ? 'Recorded Lecture' : 'Interactive Practice'}
                        </span>
                        <Link
                          href={targetHref}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          {task.lectureId || task.activity === 'Study' ? (
                            <>
                              <PlayCircle className="w-3 h-3" />
                              <span>Watch Video</span>
                            </>
                          ) : (
                            <>
                              <span>Start</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              href={`/courses/${courseId}/plan`}
              className="w-full mt-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-300 font-bold text-xs text-center transition-colors block"
            >
              Continue Today&apos;s Plan
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Concept-Level Knowledge Tracing
              </h3>
              <p className="text-xs text-zinc-500">
                Calibrated mastery scores with Bayesian uncertainty bands (±) and forgetting risk
              </p>
            </div>
            <Link
              href={`/courses/${courseId}/quiz/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Start Diagnostic Quiz</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {concepts.map((concept) => (
              <MasteryBar
                key={concept.id}
                name={concept.name}
                mastery={concept.mastery}
                uncertainty={concept.uncertainty}
                forgettingRisk={concept.forgettingRisk}
                lastPracticedDaysAgo={concept.lastPracticedDaysAgo}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
