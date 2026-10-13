'use client';

import React, { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Concept } from '@/types';
import { getMasteryColor } from '@/lib/utils';
import { ArrowRight, Zap, Target } from 'lucide-react';

export default function QuizSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedConcept = searchParams.get('concept');

  const { data: concepts = [] } = useQuery<Concept[]>({
    queryKey: ['concepts', courseId],
    queryFn: () => api.getConcepts(courseId),
  });

  const [selectedConcepts, setSelectedConcepts] = useState<string[]>(
    preselectedConcept ? [preselectedConcept] : ['c1', 'c2', 'c4']
  );
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [mode, setMode] = useState<'adaptive' | 'mock'>('adaptive');

  const createMutation = useMutation({
    mutationFn: () =>
      api.createQuizAttempt(courseId, {
        conceptIds: selectedConcepts,
        questionCount,
        mode,
      }),
    onSuccess: (attempt) => {
      router.push(`/courses/${courseId}/quiz/${attempt.id}`);
    },
  });

  const toggleConcept = (conceptId: string) => {
    setSelectedConcepts((prev) =>
      prev.includes(conceptId) ? prev.filter((id) => id !== conceptId) : [...prev, conceptId]
    );
  };

  const selectAll = () => {
    setSelectedConcepts(concepts.map((c) => c.id));
  };

  const selectWeakOnly = () => {
    setSelectedConcepts(concepts.filter((c) => c.mastery < 60).map((c) => c.id));
  };

  return (
    <AppShell courseId={courseId} title="Configure Adaptive Quiz">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D3B]">
            Diagnostic & Practice Engine
          </span>
          <h1 className="text-2xl font-extrabold text-[#F6F5EE] mt-0.5">
            Configure Your Quiz Session
          </h1>
          <p className="text-xs text-[#7E8078] mt-1">
            Questions adapt in real-time to your confidence and mastery level.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#141619] border border-[#1D2024] shadow-md space-y-8 text-xs">
          {/* Quiz Mode Selection */}
          <div>
            <label className="block font-bold text-[#F6F5EE] mb-2">
              Quiz Evaluation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode('adaptive')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  mode === 'adaptive'
                    ? 'border-[#E06D3B] bg-[#E06D3B]/10 text-[#F6F5EE] shadow-xs'
                    : 'border-[#1D2024] bg-[#0C0D0E] hover:border-[#1D2024]/80 text-[#C8C6B9]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1 text-sm text-[#E06D3B]">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Adaptive Mode (Recommended)</span>
                </div>
                <p className="text-[#7E8078] text-[11px] leading-relaxed">
                  Selects questions dynamically based on prerequisite mastery, detected misconceptions,
                  and item response difficulty.
                </p>
              </div>

              <div
                onClick={() => setMode('mock')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  mode === 'mock'
                    ? 'border-[#E06D3B] bg-[#E06D3B]/10 text-[#F6F5EE] shadow-xs'
                    : 'border-[#1D2024] bg-[#0C0D0E] hover:border-[#1D2024]/80 text-[#C8C6B9]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1 text-sm text-[#F6F5EE]">
                  <Target className="w-4 h-4 text-[#E06D3B]" />
                  <span>Mock Exam Simulation</span>
                </div>
                <p className="text-[#7E8078] text-[11px] leading-relaxed">
                  Fixed set of balanced questions simulating actual exam distribution without intermediate
                  hints.
                </p>
              </div>
            </div>
          </div>

          {/* Question Count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-[#F6F5EE]">
                Number of Questions
              </label>
              <span className="font-mono font-bold text-[#E06D3B]">
                {questionCount} Questions (~{questionCount * 2} mins)
              </span>
            </div>
            <div className="flex gap-2">
              {[4, 8, 12, 16].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    questionCount === num
                      ? 'bg-[#E06D3B] text-white border-[#E06D3B] shadow-xs'
                      : 'border-[#1D2024] bg-[#0C0D0E] hover:bg-[#1A1D21] text-[#C8C6B9] hover:text-[#F6F5EE]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Concepts Selector */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="font-bold text-[#F6F5EE]">
                Target Concepts ({selectedConcepts.length} selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectWeakOnly}
                  className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
                >
                  Weak Only (&lt;60%)
                </button>
                <span className="text-[#7E8078]">•</span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] font-semibold text-[#E06D3B] hover:underline cursor-pointer"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {concepts.map((concept) => {
                const isSelected = selectedConcepts.includes(concept.id);
                const color = getMasteryColor(concept.mastery);

                return (
                  <div
                    key={concept.id}
                    onClick={() => toggleConcept(concept.id)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#E06D3B] bg-[#E06D3B]/10 text-[#F6F5EE] shadow-2xs'
                        : 'border-[#1D2024] bg-[#0C0D0E] hover:bg-[#1A1D21] text-[#C8C6B9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#E06D3B] bg-[#E06D3B] text-white' : 'border-[#1D2024] bg-[#141619]'
                        }`}
                      >
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="font-semibold text-xs truncate text-[#F6F5EE]">{concept.name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${color.bg} ${color.border}`}
                    >
                      {concept.mastery}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1D2024] flex justify-end">
            <button
              type="button"
              disabled={selectedConcepts.length === 0 || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] disabled:opacity-40 text-white font-bold text-sm shadow-md hover:shadow-[#E06D3B]/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>{createMutation.isPending ? 'Preparing Quiz...' : 'Start Diagnostic Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
