'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { MisconceptionCard } from '@/components/MisconceptionCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Misconception } from '@/types';
import { ShieldAlert } from 'lucide-react';

export default function MisconceptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: misconceptions = [] } = useQuery<Misconception[]>({
    queryKey: ['misconceptions', courseId],
    queryFn: () => api.getMisconceptions(courseId),
  });

  const remediateMutation = useMutation({
    mutationFn: (id: string) => api.remediateMisconception(courseId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misconceptions', courseId] });
      queryClient.invalidateQueries({ queryKey: ['concepts', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const activeCount = misconceptions.filter((m) => m.status === 'active').length;
  const remediatedCount = misconceptions.filter((m) => m.status === 'remediated').length;

  return (
    <AppShell courseId={courseId} title="Misconception Remediation Center">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141619] border border-[#1D2024]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C94A44] font-mono">
              Cognitive Diagnosis & Metacognition
            </span>
            <h1 className="text-2xl font-black text-[#F6F5EE] mt-1 tracking-tight">
              Detected Learning Misconceptions
            </h1>
            <p className="text-xs text-[#7E8078] mt-1 max-w-xl">
              KnowTrace isolates systemic misunderstandings before they solidify into permanent cognitive barriers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#C94A44]/15 text-[#C94A44] border border-[#C94A44]/30 font-mono">
              {activeCount} Active Confusions
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#3E8E68]/15 text-[#3E8E68] border border-[#3E8E68]/30 font-mono">
              {remediatedCount} Remediated
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141619] border border-[#1D2024] flex items-start gap-3.5 text-xs text-[#C8C6B9]">
          <ShieldAlert className="w-5 h-5 text-[#C94A44] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#F6F5EE]">
              Why Remediation Beats Repetitive Questions
            </span>
            <p className="text-[#7E8078] leading-relaxed text-[11px]">
              Simply repeating quizzes when a conceptual misconception exists reinforces errors. Each
              remediation card below provides an intuitive contrast, deep mathematical explanation,
              real-world application, and an analogy before verifying understanding with a quick check.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {misconceptions.map((m) => (
            <MisconceptionCard
              key={m.id}
              misconception={m}
              onRemediate={async (id) => {
                await remediateMutation.mutateAsync(id);
              }}
              onPracticeConcept={(conceptId) => {
                router.push(`/courses/${courseId}/quiz/new?concept=${conceptId}`);
              }}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
