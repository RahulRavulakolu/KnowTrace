'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Course, CourseCertificateDetails } from '@/types';
import {
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Printer,
  Share2,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  ArrowRight,
  Video,
  HelpCircle,
  AlertTriangle,
  QrCode,
  Check,
  Copy,
  Lock,
} from 'lucide-react';

export default function CourseCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const queryClient = useQueryClient();

  const [copiedLink, setCopiedLink] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId),
  });

  const { data: certDetails, isLoading: certLoading } = useQuery<CourseCertificateDetails>({
    queryKey: ['certificate', courseId],
    queryFn: () => api.getCertificate(courseId),
  });

  const claimMutation = useMutation({
    mutationFn: () => api.claimCertificate(courseId),
    onSuccess: (res) => {
      setClaimSuccessMsg(res.message);
      queryClient.invalidateQueries({ queryKey: ['certificate', courseId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.completeCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['certificate', courseId] });
      queryClient.invalidateQueries({ queryKey: ['concepts', courseId] });
    },
  });

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/courses/${courseId}/certificate`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isLoading = courseLoading || certLoading;
  const criteria = certDetails?.criteria;
  const platformInfo = certDetails?.platform_info;
  const isEligible = certDetails?.eligible ?? false;
  const isCourseCompleted = Boolean(
    isEligible || ((course?.overallMastery ?? 0) >= (course?.targetMastery ?? 80) && (course?.activeMisconceptionsCount ?? 0) === 0)
  );

  const criteriaList = criteria && criteria.concept_mastery
    ? [
        {
          key: 'concept_mastery',
          name: criteria.concept_mastery.name || 'Concept Mastery',
          current: `${criteria.concept_mastery.current ?? 82.5}%`,
          target: `${criteria.concept_mastery.required ?? 80}%`,
          met: Boolean(criteria.concept_mastery.met),
          desc: criteria.concept_mastery.description || 'Demonstrate >= 80% Bayesian calibrated mastery across course concepts.',
          actionLabel: 'Take Practice Quiz',
          actionHref: `/courses/${courseId}/quiz/new`,
          actionIcon: HelpCircle,
        },
        {
          key: 'lecture_progress',
          name: criteria.lecture_progress?.name || 'Lecture Progress',
          current: `${criteria.lecture_progress?.current ?? 85}%`,
          target: `${criteria.lecture_progress?.required ?? 80}%`,
          met: Boolean(criteria.lecture_progress?.met),
          desc: criteria.lecture_progress?.description || 'Watch and complete at least 80% of course video lectures.',
          actionLabel: 'Watch Lectures',
          actionHref: `/courses/${courseId}/lectures`,
          actionIcon: Video,
        },
        {
          key: 'diagnostic_exam',
          name: criteria.diagnostic_exam?.name || 'Diagnostic / Final Exam',
          current: `${criteria.diagnostic_exam?.current ?? 88}%`,
          target: `${criteria.diagnostic_exam?.required ?? 75}%`,
          met: Boolean(criteria.diagnostic_exam?.met),
          desc: criteria.diagnostic_exam?.description || 'Pass the end-of-course diagnostic assessment with score >= 75%.',
          actionLabel: 'Take Final Diagnostic',
          actionHref: `/courses/${courseId}/quiz/new`,
          actionIcon: HelpCircle,
        },
        {
          key: 'critical_misconceptions',
          name: criteria.critical_misconceptions?.name || 'Zero Critical Misconceptions',
          current: `${criteria.critical_misconceptions?.current ?? 0} active`,
          target: '0 active',
          met: Boolean(criteria.critical_misconceptions?.met),
          desc: criteria.critical_misconceptions?.description || 'Remediate and clear all flagged misconceptions via AI Tutor.',
          actionLabel: 'Remediate Misconceptions',
          actionHref: `/courses/${courseId}/misconceptions`,
          actionIcon: AlertTriangle,
        },
      ]
    : [];

  const completedCriteriaCount = criteriaList.filter((c) => c.met).length;

  return (
    <AppShell courseId={courseId} title="Course Certificate & Accreditation">
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Page Hero Header */}
        <div className="no-print p-6 sm:p-8 rounded-3xl bg-gradient-to-br bg-[#141619] text-white shadow-xl relative overflow-hidden border border-amber-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Verified Certification Pathway
                </span>
                <span className="text-xs text-zinc-300 bg-white/10 px-2.5 py-1 rounded-full">
                  {certDetails?.source_platform || 'NPTEL'} • {certDetails?.institution || 'IIT Madras'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {course?.name || 'Course'} Certificate
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Understand the exact graduation criteria, verify your cognitive knowledge tracing scores, and review guidelines for official in-person proctored certification through {certDetails?.source_platform || 'the course platform'}.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
              {isCourseCompleted ? (
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                  title="Complete course milestones (>= 80% mastery) to unlock certificate printing"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Certificate Locked</span>
                </button>
              )}
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Verification Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: HOW TO GET THIS CERTIFICATE (CRITERIA CHECKLIST) */}
        <section className="no-print space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1D2024] pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#F6F5EE] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#E06D3B]" />
                <span>How to Get This Certificate</span>
              </h2>
              <p className="text-xs text-[#7E8078]">
                Fulfill all 4 core cognitive and syllabus benchmarks to earn your KnowTrace Verified Certificate.
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full bg-[#E06D3B]/10 text-[#E06D3B] border border-[#1D2024] shrink-0 self-start sm:self-auto font-mono">
              {completedCriteriaCount} of {criteriaList.length} Requirements Met ({certDetails?.overall_progress_pct ?? 0}% Ready)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criteriaList.map((item) => {
              const ActionIcon = item.actionIcon;
              return (
                <div
                  key={item.key}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.met
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : 'bg-[#141619] border-[#1D2024]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.met ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#1D2024] flex items-center justify-center text-[10px] font-bold text-[#7E8078]">
                            !
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#F6F5EE]">
                            {item.name}
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              item.met
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                            }`}
                          >
                            {item.met ? 'Satisfied' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-xs text-[#7E8078] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1D2024] flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-[#7E8078] font-medium">Current: </span>
                      <strong className="text-[#F6F5EE] font-mono">
                        {item.current}
                      </strong>
                      <span className="text-[#7E8078] mx-1.5">•</span>
                      <span className="text-[#7E8078] font-medium">Requirement: </span>
                      <span className="text-[#C8C6B9] font-mono font-medium">
                        {item.target}
                      </span>
                    </div>

                    {!item.met && (
                      <Link
                        href={item.actionHref}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E06D3B]/10 hover:bg-[#E06D3B]/20 text-[#E06D3B] border border-[#E06D3B]/30 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <ActionIcon className="w-3.5 h-3.5" />
                        <span>{item.actionLabel}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick claim banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141619] border border-[#1D2024] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#E06D3B] text-white shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F6F5EE]">
                  {isEligible
                    ? 'Congratulations! You are eligible to claim this certificate.'
                    : 'Certificate Issuance Status'}
                </h4>
                <p className="text-xs text-[#7E8078]">
                  {isEligible
                    ? 'All requirements are fulfilled. Claim below to stamp your digital credential and generate permanent verification hashes.'
                    : `Complete remaining milestones above to automatically unlock your official credential.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs inline-flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                isEligible
                  ? 'bg-[#E06D3B] hover:bg-[#FF9457] text-white shadow-md active:scale-95'
                  : 'bg-[#0C0D0E] border border-[#1D2024] text-[#7E8078]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{claimMutation.isPending ? 'Verifying...' : 'Claim & Stamp Certificate'}</span>
            </button>
          </div>

          {claimSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{claimSuccessMsg}</span>
            </div>
          )}
        </section>

        {/* SECTION 2: OFFICIAL PLATFORM ACCREDITATION & PROCTORED EXAM (NPTEL / SWAYAM / MITx) */}
        {platformInfo && (
          <section id="official-portal" className="no-print space-y-4">
            <div className="border-b border-[#1D2024] pb-3">
              <h2 className="text-xl font-extrabold text-[#F6F5EE] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>Official {platformInfo.platform} Proctored Certification Guidelines</span>
              </h2>
              <p className="text-xs text-[#7E8078]">
                Instructions for in-person proctored examination, exam center booking, and university credit transfer.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0C0D0E] border border-[#1D2024] space-y-1">
                  <div className="flex items-center gap-2 text-[#7E8078] text-xs font-semibold">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span>Exam Format</span>
                  </div>
                  <p className="text-xs font-bold text-[#F6F5EE] pt-1">
                    {platformInfo.exam_type}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0C0D0E] border border-[#1D2024] space-y-1">
                  <div className="flex items-center gap-2 text-[#7E8078] text-xs font-semibold">
                    <Calendar className="w-4 h-4 text-[#E06D3B]" />
                    <span>Registration Window</span>
                  </div>
                  <p className="text-xs font-bold text-[#F6F5EE] pt-1">
                    {platformInfo.exam_registration_window}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0C0D0E] border border-[#1D2024] space-y-1">
                  <div className="flex items-center gap-2 text-[#7E8078] text-xs font-semibold">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Examination Fee</span>
                  </div>
                  <p className="text-xs font-bold text-[#F6F5EE] pt-1">
                    {platformInfo.fee}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0C0D0E] border border-[#1D2024] space-y-1">
                  <div className="flex items-center gap-2 text-[#7E8078] text-xs font-semibold">
                    <Award className="w-4 h-4 text-[#E06D3B]" />
                    <span>Credit Transfer</span>
                  </div>
                  <p className="text-xs font-bold text-[#F6F5EE] pt-1">
                    {platformInfo.credit_transfer}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0D0E] border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 font-mono">
                  Platform Passing Criteria & Verification Formula
                </h4>
                <p className="text-xs text-[#C8C6B9] leading-relaxed font-medium">
                  {platformInfo.eligibility_rule}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#1D2024]">
                <div className="text-xs text-[#7E8078]">
                  Register for the official examination directly on the national portal to earn paper-printed hardcopy and QR-verified university certificates.
                </div>
                <a
                  href={platformInfo.portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-white font-bold text-xs inline-flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <span>Open {platformInfo.platform} Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: DIGITAL CERTIFICATE PREVIEW CANVAS */}
        <section className="space-y-4">
          <div className="no-print flex items-center justify-between border-b border-[#1D2024] pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#F6F5EE] flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Certificate of Cognitive Mastery Preview</span>
              </h2>
              <p className="text-xs text-[#7E8078]">
                Cryptographically signed credential with Bayesian knowledge tracing verification.
              </p>
            </div>
            {isCourseCompleted ? (
              <button
                onClick={handlePrint}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-zinc-400 inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Locked</span>
              </span>
            )}
          </div>

          {isCourseCompleted ? (
            /* Certificate Canvas / Card */
            <div
              id="certificate-print-area"
              className="p-8 sm:p-12 rounded-3xl bg-radial from-amber-50/60 via-white to-amber-50/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-4 border-double border-amber-600/40 dark:border-amber-500/30 shadow-2xl relative overflow-hidden"
            >
              {/* Watermark Logo Accent */}
              <div className="absolute inset-0 flex items-center justify-center opacity-3 dark:opacity-5 pointer-events-none select-none">
                <Award className="w-96 h-96 text-amber-500" />
              </div>

              {/* Corner Decorative Ornaments */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

              <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
                {/* Certificate Header */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black tracking-widest uppercase border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    KNOWTRACE ACADEMIC HONORS & COGNITIVE MASTERY
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-black tracking-wide text-[#F6F5EE] pt-1">
                    Certificate of Achievement
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-[#7E8078] font-semibold">
                    This is proudly presented to
                  </p>
                </div>

                {/* Recipient Name */}
                <div className="py-2 border-b-2 border-dashed border-amber-500/30 max-w-lg mx-auto">
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-300 italic tracking-wide">
                    {certDetails?.student?.name || 'Alex Chen'}
                  </div>
                </div>

                {/* Award Description */}
                <p className="text-xs sm:text-sm text-[#C8C6B9] leading-relaxed max-w-2xl mx-auto">
                  for demonstrating verified cognitive proficiency and surpassing rigorous Bayesian knowledge tracing standards in the course
                </p>

                {/* Course Title & Platform */}
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#F6F5EE] tracking-tight">
                    {course?.name || certDetails?.course_name || 'Machine Learning'}
                  </div>
                  <div className="text-xs font-semibold text-[#7E8078]">
                    Offered via {certDetails?.source_platform || 'NPTEL'} • {certDetails?.institution || 'IIT Madras'}
                  </div>
                </div>

                {/* Mastery Grade Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-mono font-black">
                    Calibrated Mastery: {course?.overallMastery ?? 82}% • Elite / Distinction
                  </span>
                </div>

                {/* Signatures & Verification Seal */}
                <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 border-t border-[#1D2024] text-left sm:text-center">
                  <div className="space-y-1">
                    <div className="font-serif italic text-base text-[#F6F5EE] font-bold border-b border-[#1D2024] pb-1">
                      {certDetails?.instructor || 'Prof. Balaraman Ravindran'}
                    </div>
                    <div className="text-[11px] font-semibold text-[#7E8078]">
                      Lead Course Instructor
                    </div>
                    <div className="text-[10px] text-[#7E8078]">
                      {certDetails?.institution || 'IIT Madras'}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center bg-amber-500/5">
                      <Award className="w-8 h-8 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Official Seal
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-serif italic text-base text-[#F6F5EE] font-bold border-b border-[#1D2024] pb-1">
                      KnowTrace Academic Council
                    </div>
                    <div className="text-[11px] font-semibold text-[#7E8078]">
                      Adaptive Engine Director
                    </div>
                    <div className="text-[10px] text-[#7E8078]">
                      Issued: {certDetails?.student?.completion_date || 'October 2026'}
                    </div>
                  </div>
                </div>

                {/* Cryptographic Footnote */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 gap-2">
                  <div>
                    Credential ID:{' '}
                    <span className="text-zinc-600 dark:text-zinc-300 font-bold">
                      {certDetails?.student?.certificate_id || 'KT-NPTE-23E9EF-2026'}
                    </span>
                  </div>
                  <div className="truncate max-w-xs">
                    SHA-256:{' '}
                    <span className="text-zinc-500">
                      {certDetails?.student?.verification_hash || 'd8f4e2c9a17b889360c7f12e9647201bc6f32890'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Locked State Card */
            <div className="no-print p-8 sm:p-12 rounded-3xl bg-zinc-900/60 dark:bg-zinc-900 border border-zinc-800 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-extrabold text-zinc-100">
                  Certificate Locked — Complete Course to Unlock
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your official KnowTrace Certificate of Cognitive Mastery will unlock automatically once you achieve at least 80% concept mastery and resolve any active misconceptions.
                </p>
              </div>

              {/* Progress Summary */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-left space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Concept Mastery</span>
                  <span className="font-mono font-bold text-amber-400">
                    {course?.overallMastery ?? 65}% / 80% Target
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (((course?.overallMastery ?? 65) / 80) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span>Active Misconceptions</span>
                  <span className="font-mono font-bold text-zinc-200">
                    {course?.activeMisconceptionsCount ?? 0} active (0 required)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href={`/courses/${courseId}/quiz/new`}
                  className="px-5 py-2.5 rounded-xl bg-[#E06D3B] hover:bg-[#E06D3B] text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Take Adaptive Quiz</span>
                </Link>
                <Link
                  href={`/courses/${courseId}/lectures`}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Watch Lectures</span>
                </Link>
                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  title="Fast-track to 100% completion for evaluation and testing"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{completeMutation.isPending ? 'Unlocking...' : 'Simulate 100% Course Completion (Demo)'}</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
