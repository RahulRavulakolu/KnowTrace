'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, useCitationViewer } from '@/components/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { QuizAttempt } from '@/types';
import { CitationChip } from '@/components/CitationChip';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string; aid: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const attemptId = resolvedParams.aid;
  const router = useRouter();
  const { openCitation } = useCitationViewer();

  const { data: attempt, isLoading } = useQuery<QuizAttempt | null>({
    queryKey: ['quizAttempt', attemptId],
    queryFn: () => api.getQuizAttempt(attemptId),
  });

  if (isLoading) {
    return (
      <AppShell courseId={courseId} title="Quiz Results">
        <div className="py-12 text-center text-xs text-zinc-400 font-mono">
          Compiling Adaptive Learning Report...
        </div>
      </AppShell>
    );
  }

  if (!attempt) {
    return (
      <AppShell courseId={courseId} title="Results Not Found">
        <div className="max-w-md mx-auto py-12 text-center space-y-4">
          <h2 className="text-base font-bold">Result report not found</h2>
          <button
            onClick={() => router.push(`/courses/${courseId}/dashboard`)}
            className="px-4 py-2 bg-[#E06D3B] rounded-xl text-white text-xs font-semibold cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  const resultsList = Object.values(attempt.results);
  const total = attempt.totalQuestions || 4;
  const correctCount = resultsList.filter((r) => r.isCorrect).length;
  const scorePct = attempt.scorePercentage ?? Math.round((correctCount / total) * 100);

  const triggeredMisconceptions = resultsList
    .filter((r) => r.detectedMisconception)
    .map((r) => r.detectedMisconception!);

  return (
    <AppShell courseId={courseId} title="Quiz Diagnostic Report">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141619] border border-[#1D2024] text-[#F6F5EE] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#E06D3B]/10 border border-[#E06D3B]/30 flex items-center justify-center text-[#E06D3B] shrink-0">
              <Trophy className="w-8 h-8 text-[#E06D3B]" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#E06D3B] font-bold">
                Adaptive Assessment Completed
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#F6F5EE]">Diagnostic Summary</h1>
              <p className="text-xs text-[#7E8078]">
                Answered <strong className="text-[#F6F5EE]">{correctCount} of {total}</strong> questions correctly ({scorePct}% accuracy).
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0C0D0E] border border-[#1D2024] min-w-[120px]">
            <span className="text-3xl font-mono font-black text-[#F6F5EE]">{scorePct}%</span>
            <span className="text-[10px] text-[#7E8078] uppercase font-semibold tracking-wider">
              Score
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#F6F5EE] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Concept Mastery Updates</span>
            </h3>

            <div className="space-y-3">
              {resultsList.map((res) => (
                <div
                  key={res.questionId}
                  className="p-3.5 rounded-xl bg-[#0C0D0E] border border-[#1D2024] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {res.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-[#F6F5EE]">
                      {res.conceptName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#7E8078]">{res.masteryBefore}%</span>
                    <span className="text-[#7E8078]">→</span>
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        res.masteryDelta >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {res.masteryDelta >= 0 ? '+' : ''}
                      {res.masteryDelta}% ({res.masteryAfter}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#F6F5EE] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E06D3B]" />
              <span>Recommended Next Steps</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#E06D3B]/10 border border-[#E06D3B]/30 space-y-1">
                <span className="font-bold text-[#FF9457]">
                  1. Review Regularization (L1 vs L2)
                </span>
                <p className="text-[11px] text-[#C8C6B9]">
                  Re-examine why L1 creates diamond corner tangency leading to sparsity.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-900/40 space-y-1">
                <span className="font-bold text-amber-300">
                  2. Remediate Precision vs Recall Inversion
                </span>
                <p className="text-[11px] text-[#C8C6B9]">
                  Complete the 5-step quick drill on classification threshold adjustment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/40 space-y-1">
                <span className="font-bold text-emerald-300">
                  3. Take a 3-Question Follow-up
                </span>
                <p className="text-[11px] text-[#C8C6B9]">
                  Adaptive model scheduled a brief calibration drill for tomorrow morning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {triggeredMisconceptions.length > 0 && (
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Misconception Detected During Quiz</span>
            </div>
            <div className="space-y-2">
              {triggeredMisconceptions.map((m) => (
                <div key={m.id} className="text-xs text-rose-200">
                  <strong className="text-white">{m.title}: </strong>
                  <span>{m.description}</span>
                </div>
              ))}
            </div>
            <Link
              href={`/courses/${courseId}/misconceptions`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E06D3B] hover:text-[#FF9457] hover:underline pt-1"
            >
              <span>Go to Remediation Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#F6F5EE]">
            Question Review & Citations
          </h3>

          <div className="space-y-4">
            {attempt.questions.map((q, idx) => {
              const res = attempt.results[q.id];
              const isCorrect = res?.isCorrect;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-[#141619] border border-[#1D2024] space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#7E8078]">Q{idx + 1}</span>
                      <span className="font-semibold text-[#F6F5EE]">
                        {q.conceptName}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <p className="font-medium text-[#F6F5EE] text-sm leading-snug">
                    {q.question}
                  </p>

                  <div className="p-3 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-[#C8C6B9] leading-relaxed">
                    <span className="font-semibold text-[#F6F5EE]">Explanation: </span>
                    {q.explanation}
                  </div>

                  {q.citation && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[#7E8078] font-semibold text-[11px]">Exact Source:</span>
                      <CitationChip citation={q.citation} onClick={() => openCitation(q.citation)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#1D2024] flex items-center justify-between flex-wrap gap-4">
          <Link
            href={`/courses/${courseId}/dashboard`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1D2024] bg-[#141619] hover:bg-[#1A1D21] text-[#C8C6B9] hover:text-[#F6F5EE] text-xs font-semibold transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${courseId}/quiz/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Quiz</span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
