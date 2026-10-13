'use client';

import React, { use } from 'react';
import { AppShell } from '@/components/AppShell';
import { StudyPlan } from '@/components/StudyPlan';
import { PlanDiff } from '@/components/PlanDiff';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StudyPlanBlock, PlanUpdateDiff } from '@/types';
import { RefreshCw } from 'lucide-react';

export default function StudyPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const queryClient = useQueryClient();

  const { data: blocks = [] } = useQuery<StudyPlanBlock[]>({
    queryKey: ['studyPlan', courseId],
    queryFn: () => api.getStudyPlan(courseId),
  });

  const { data: diffs = [] } = useQuery<PlanUpdateDiff[]>({
    queryKey: ['planDiffs', courseId],
    queryFn: () => api.getPlanDiffs(courseId),
  });

  const toggleMutation = useMutation({
    mutationFn: (blockId: string) => api.toggleStudyBlock(courseId, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlan', courseId] });
    },
  });

  const handleRebalance = async () => {
    await api.updateStudyPlanAfterQuiz(courseId, ['Regularization (L1 & L2)', 'ROC & AUC Curves']);
    queryClient.invalidateQueries({ queryKey: ['planDiffs', courseId] });
  };

  return (
    <AppShell courseId={courseId} title="Personalized Study Plan">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141619] border border-[#1D2024]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D3B] font-mono">
              Adaptive Spaced Repetition Engine
            </span>
            <h1 className="text-2xl font-black text-[#F6F5EE] mt-1 tracking-tight">
              Personalized Study Schedule
            </h1>
            <p className="text-xs text-[#7E8078] mt-1 max-w-xl">
              Dynamically calibrated to your exam deadline, daily available hours, and live retention decay.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRebalance}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0C0D0E] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 text-xs font-semibold text-[#F6F5EE] shadow-xs transition-colors cursor-pointer font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E06D3B]" />
            <span>Simulate Adaptive Re-balance</span>
          </button>
        </div>

        {diffs.length > 0 && <PlanDiff diff={diffs[0]} />}

        <div className="p-6 sm:p-8 rounded-3xl bg-[#141619] border border-[#1D2024] shadow-sm">
          <StudyPlan
            blocks={blocks}
            courseId={courseId}
            onToggleBlock={(id) => toggleMutation.mutate(id)}
          />
        </div>
      </div>
    </AppShell>
  );
}
