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
        {/* ASYMMETRIC HORIZON HERO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141619] border border-[#1D2024] text-[#F6F5EE] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E06D3B]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Trajectory & Primary Urgent Action (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E06D3B]/15 text-[#E06D3B] border border-[#E06D3B]/30 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#E06D3B]" />
                  Bayesian Calibration Active
                </span>
                <span className="text-xs text-[#7E8078] font-mono">
                  Target: 85% Mastery Goal
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F6F5EE]">
                  Welcome back, Alex
                </h1>
                <p className="text-xs sm:text-sm text-[#C8C6B9] mt-1.5 leading-relaxed max-w-xl">
                  Estimated exam readiness sits at{' '}
                  <strong className="text-[#F6F5EE] font-mono font-bold">{overallMastery}%</strong>. Active retention decay detected in core prerequisites.
                </p>
              </div>

              {/* High-Impact Next Action Banner */}
              <div className="p-3.5 rounded-2xl bg-[#0C0D0E] border border-[#1D2024] flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E06D3B]/15 text-[#E06D3B] border border-[#E06D3B]/30 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#7E8078]">
                      Recommended Next Action
                    </div>
                    <div className="text-xs font-bold text-[#F6F5EE]">
                      Remediate: {weakConcepts[0]?.name || 'Regularization'}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/courses/${courseId}/quiz/new?concept=${weakConcepts[0]?.id || ''}`}
                  className="px-4 py-2 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-black text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 active:scale-95"
                >
                  <span>Launch Diagnostic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Unified Quick-Switch Command Matrix (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5 bg-[#0C0D0E]/60 p-3 rounded-2xl border border-[#1D2024]">
              <Link
                href={`/courses/${courseId}/lectures`}
                className="p-3 rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1D21] border border-[#1D2024] flex items-center justify-center text-[#E06D3B] group-hover:scale-105 transition-transform">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-[#F6F5EE]">Lectures</span>
              </Link>

              <Link
                href={`/courses/${courseId}/tutor`}
                className="p-3 rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1D21] border border-[#1D2024] flex items-center justify-center text-[#E06D3B] group-hover:scale-105 transition-transform">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-[#F6F5EE]">AI Tutor</span>
              </Link>

              <Link
                href={`/courses/${courseId}/quiz/new`}
                className="p-3 rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1D21] border border-[#1D2024] flex items-center justify-center text-[#E06D3B] group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-[#F6F5EE]">Quiz</span>
              </Link>

              <Link
                href={`/courses/${courseId}/map`}
                className="p-3 rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1D21] border border-[#1D2024] flex items-center justify-center text-[#E06D3B] group-hover:scale-105 transition-transform">
                  <Network className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-[#F6F5EE]">Map</span>
              </Link>

              <Link
                href={`/courses/${courseId}/plan`}
                className="p-3 rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1D21] border border-[#1D2024] flex items-center justify-center text-[#E06D3B] group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-[#F6F5EE]">Plan</span>
              </Link>

              <Link
                href={`/courses/${courseId}/certificate`}
                className="p-3 rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#D48838]/40 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1D21] border border-[#1D2024] flex items-center justify-center text-[#D48838] group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-[#D48838]">Certificate</span>
              </Link>
            </div>
          </div>
        </div>

        {/* COGNITIVE TELEMETRY LEDGER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl bg-[#141619] border border-[#1D2024] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#1D2024]">
          {/* Tile 1: Overall Mastery */}
          <div className="p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[#7E8078] font-mono font-semibold uppercase tracking-wider mb-2">
              Overall Mastery
            </div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-3xl font-mono font-black text-[#E06D3B]">
                {overallMastery}%
              </span>
              <span className="text-[11px] font-semibold text-[#3E8E68] flex items-center gap-0.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> +6% / wk
              </span>
            </div>
            <ProgressBar progress={overallMastery} size="sm" showPercentage={false} variant="terracotta" />
          </div>

          {/* Tile 2: Weak Concepts */}
          <div className="p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[#7E8078] font-mono font-semibold uppercase tracking-wider mb-2">
              Weak Concepts (&lt;60%)
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-mono font-black text-[#C94A44]">
                {weakConcepts.length}
              </span>
              <span className="text-[11px] text-[#7E8078] font-mono">High priority</span>
            </div>
            <div className="text-xs text-[#C8C6B9] truncate pt-2 border-t border-[#1D2024]/60">
              {weakConcepts.map((c) => c.name).join(', ') || 'No weak concepts'}
            </div>
          </div>

          {/* Tile 3: Misconceptions */}
          <div className="p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[#7E8078] font-mono font-semibold uppercase tracking-wider mb-2">
              Active Misconceptions
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-mono font-black text-[#D48838]">
                {activeMisconceptions.length}
              </span>
              <Link
                href={`/courses/${courseId}/misconceptions`}
                className="text-[11px] font-mono font-bold text-[#D48838] hover:text-[#FF9457] transition-colors"
              >
                Remediate →
              </Link>
            </div>
            <div className="text-xs text-[#C8C6B9] truncate pt-2 border-t border-[#1D2024]/60">
              {activeMisconceptions[0]?.title || 'All calibrated'}
            </div>
          </div>

          {/* Tile 4: Forgetting Risk */}
          <div className="p-5 flex flex-col justify-between">
            <div className="text-[11px] text-[#7E8078] font-mono font-semibold uppercase tracking-wider mb-2">
              Retention Decay
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-mono font-black text-[#C94A44]">
                {forgettingRiskConcepts.length}
              </span>
              <span className="text-[11px] text-[#7E8078] font-mono">Spaced decay</span>
            </div>
            <div className="text-xs text-[#C8C6B9] truncate pt-2 border-t border-[#1D2024]/60">
              {forgettingRiskConcepts.map((c) => c.name).join(', ') || 'Retention stable'}
            </div>
          </div>
        </div>

        {/* Certificate Eligibility & Accreditation Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#141619] border border-[#1D2024] shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D48838]/15 text-[#D48838] border border-[#D48838]/30 font-mono">
                  <Award className="w-3.5 h-3.5 text-[#D48838]" />
                  Official Accreditation Pathway
                </span>
                <span className="text-xs text-[#7E8078] font-mono">
                  {certDetails?.source_platform || 'NPTEL'} • {certDetails?.institution || 'IIT Madras'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#3E8E68]/15 text-[#3E8E68] font-mono font-semibold border border-[#3E8E68]/30">
                  {certDetails?.eligible ? 'Criteria Met - Ready to Claim' : `${certDetails?.overall_progress_pct ?? 78}% Verified Benchmark`}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#F6F5EE]">
                Cognitive Mastery Certification & Accreditation
              </h3>
              <p className="text-xs sm:text-sm text-[#C8C6B9] leading-relaxed">
                Earn an official Verified Certificate of Cognitive Mastery by fulfilling 4 benchmarks (80% Concept Mastery, 80% Lecture Watch Time, 75% Diagnostic Exam, and 0 Misconceptions). Includes {certDetails?.platform_info?.platform || 'NPTEL'} proctored exam center guidelines.
              </p>

              {certDetails?.criteria?.concept_mastery && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.concept_mastery?.met ? 'bg-[#3E8E68]/10 border-[#3E8E68]/30 text-[#3E8E68]' : 'bg-[#0C0D0E] border-[#1D2024] text-[#C8C6B9]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Mastery</span>
                      {certDetails.criteria.concept_mastery?.met && <CheckCircle2 className="w-3.5 h-3.5 text-[#3E8E68] shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5 text-[#F6F5EE]">{certDetails.criteria.concept_mastery?.current}% / {certDetails.criteria.concept_mastery?.required}%</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.lecture_progress?.met ? 'bg-[#3E8E68]/10 border-[#3E8E68]/30 text-[#3E8E68]' : 'bg-[#0C0D0E] border-[#1D2024] text-[#C8C6B9]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Lectures</span>
                      {certDetails.criteria.lecture_progress?.met && <CheckCircle2 className="w-3.5 h-3.5 text-[#3E8E68] shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5 text-[#F6F5EE]">{certDetails.criteria.lecture_progress?.current}% / {certDetails.criteria.lecture_progress?.required}%</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.diagnostic_exam?.met ? 'bg-[#3E8E68]/10 border-[#3E8E68]/30 text-[#3E8E68]' : 'bg-[#0C0D0E] border-[#1D2024] text-[#C8C6B9]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Exam Score</span>
                      {certDetails.criteria.diagnostic_exam?.met && <CheckCircle2 className="w-3.5 h-3.5 text-[#3E8E68] shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5 text-[#F6F5EE]">{certDetails.criteria.diagnostic_exam?.current}% / {certDetails.criteria.diagnostic_exam?.required}%</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${certDetails.criteria.critical_misconceptions?.met ? 'bg-[#3E8E68]/10 border-[#3E8E68]/30 text-[#3E8E68]' : 'bg-[#C94A44]/10 border-[#C94A44]/30 text-[#C94A44]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">Misconceptions</span>
                      {certDetails.criteria.critical_misconceptions?.met && <CheckCircle2 className="w-3.5 h-3.5 text-[#3E8E68] shrink-0" />}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5 text-[#F6F5EE]">{certDetails.criteria.critical_misconceptions?.current} remaining</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href={`/courses/${courseId}/certificate`}
                className="px-5 py-3 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-black font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 text-center"
              >
                <Award className="w-4 h-4 text-black" />
                <span>Certification Roadmap →</span>
              </Link>
              <Link
                href={`/courses/${courseId}/certificate#official-portal`}
                className="px-4 py-2.5 rounded-xl bg-[#0C0D0E] border border-[#1D2024] hover:border-[#E06D3B]/40 text-[#C8C6B9] hover:text-[#F6F5EE] font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <span>Platform Exam Info</span>
              </Link>
            </div>
          </div>
        </div>

        {activeMisconceptions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#C94A44]/10 border border-[#C94A44]/30 flex items-start justify-between flex-wrap gap-4 shadow-xs">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="p-2 rounded-xl bg-[#C94A44]/20 text-[#C94A44] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#F6F5EE]">
                  Active Misconception: {activeMisconceptions[0].title}
                </h4>
                <p className="text-xs text-[#C8C6B9] leading-relaxed">
                  {activeMisconceptions[0].description}
                </p>
              </div>
            </div>

            <Link
              href={`/courses/${courseId}/misconceptions`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C94A44] hover:bg-[#C94A44]/80 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer font-mono"
            >
              <span>5-Step Remediation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F6F5EE]">
                  Mastery Trajectory Over Time
                </h3>
                <p className="text-xs text-[#7E8078]">
                  Progress across quizzes and adaptive practice sessions
                </p>
              </div>
              <Link
                href={`/courses/${courseId}/map`}
                className="text-xs font-mono font-bold text-[#E06D3B] hover:underline"
              >
                Inspect Graph →
              </Link>
            </div>

            <MasteryChart />
          </div>

          <div className="p-6 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#F6F5EE] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#E06D3B]" />
                  <span>Today&apos;s Cognitive Schedule</span>
                </h3>
                <Link
                  href={`/courses/${courseId}/plan`}
                  className="text-xs font-mono font-bold text-[#E06D3B] hover:underline"
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
                      className="p-3 rounded-xl bg-[#0C0D0E] border border-[#1D2024] space-y-2 text-xs hover:border-[#E06D3B]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F6F5EE] truncate pr-2">
                          {task.conceptName}
                        </span>
                        <span className="text-[10px] font-mono text-[#7E8078] shrink-0">
                          {task.durationMinutes}m
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7E8078] flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 font-medium">
                          {task.activity === 'Study' ? (
                            <Video className="w-3 h-3 text-[#E06D3B]" />
                          ) : task.activity === 'Practice' ? (
                            <HelpCircle className="w-3 h-3 text-[#3E8E68]" />
                          ) : (
                            <CalendarCheck className="w-3 h-3 text-[#D48838]" />
                          )}
                          <span className="text-[#C8C6B9]">{task.activity}</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#7E8078]">{task.timeSlot}</span>
                      </div>
                      <div className="pt-1 flex items-center justify-between border-t border-[#1D2024]">
                        <span className="text-[10px] text-[#7E8078] truncate max-w-[140px]">
                          {task.lectureId ? 'Recorded Lecture' : 'Interactive Practice'}
                        </span>
                        <Link
                          href={targetHref}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141619] hover:bg-[#1A1D21] text-[#E06D3B] font-semibold text-[11px] border border-[#1D2024] hover:border-[#E06D3B]/40 transition-colors cursor-pointer"
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
              className="w-full mt-4 py-2.5 rounded-xl bg-[#0C0D0E] hover:bg-[#1A1D21] text-[#F6F5EE] border border-[#1D2024] hover:border-[#E06D3B]/40 font-bold text-xs text-center transition-colors block font-mono"
            >
              Continue Today&apos;s Plan
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F6F5EE]">
                Concept-Level Knowledge Tracing
              </h3>
              <p className="text-xs text-[#7E8078]">
                Calibrated mastery scores with Bayesian uncertainty bands (±) and forgetting risk
              </p>
            </div>
            <Link
              href={`/courses/${courseId}/quiz/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-black text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-black" />
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
