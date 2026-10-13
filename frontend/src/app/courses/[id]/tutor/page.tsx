'use client';

import React, { useRef, useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell, useCitationViewer } from '@/components/AppShell';
import { TutorChat } from '@/components/TutorChat';
import { LiveKitVoiceTutor } from '@/components/tutor/LiveKitVoiceTutor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TutorMessage, Citation, Course } from '@/types';
import { Mic, MessageSquare, Sparkles } from 'lucide-react';

export default function CourseTutorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { openCitation } = useCitationViewer();

  // Mode: Default to LiveKit Voice & Avatar, with switchable Text Chat
  const [interfaceMode, setInterfaceMode] = useState<'avatar' | 'chat'>('avatar');

  const hasTriggeredRef = useRef(false);

  const { data: course } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId),
  });

  const { data: messages = [] } = useQuery<TutorMessage[]>({
    queryKey: ['tutorMessages', courseId],
    queryFn: () => api.getTutorMessages(courseId),
  });

  const sendMutation = useMutation({
    mutationFn: ({ text, allowOutside }: { text: string; allowOutside: boolean }) =>
      api.sendTutorMessage(courseId, text, allowOutside),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorMessages', courseId] });
    },
  });

  // Handle URL prefilled prompt if coming from Concept Panel or Study Plan
  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt && !hasTriggeredRef.current && messages.length > 0) {
      hasTriggeredRef.current = true;
      sendMutation.mutate({ text: initialPrompt, allowOutside: false });
    }
  }, [searchParams, messages.length, sendMutation]);

  const handleSendMessage = async (text: string, allowOutside: boolean) => {
    await sendMutation.mutateAsync({ text, allowOutside });
  };

  const handleCitationClick = (citation: Citation) => {
    openCitation(citation);
  };

  return (
    <AppShell
      courseId={courseId}
      title="Source-Grounded AI Tutor"
    >
      <div className="space-y-6 w-full">
        {/* Top Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1D2024]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D3B] font-mono">
                Conversational Socratic Agent
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E06D3B]/10 text-[#E06D3B] border border-[#E06D3B]/20 font-mono">
                LiveKit WebRTC
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F6F5EE] mt-0.5">
              Source-Grounded AI Tutor
            </h1>
            <p className="text-xs text-[#7E8078] mt-0.5">
              Every claim is attributed to textbook pages, slide figures, or lecture speech spans.
            </p>
          </div>

          {/* Mode Switcher Toggle Pill */}
          <div className="flex items-center p-1 bg-[#141619] border border-[#1D2024] rounded-2xl shadow-inner w-fit">
            <button
              type="button"
              onClick={() => setInterfaceMode('avatar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                interfaceMode === 'avatar'
                  ? 'bg-[#E06D3B] text-black shadow-md'
                  : 'text-[#C8C6B9] hover:text-[#F6F5EE]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>LiveKit Avatar Voice</span>
            </button>

            <button
              type="button"
              onClick={() => setInterfaceMode('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                interfaceMode === 'chat'
                  ? 'bg-[#E06D3B] text-black shadow-md'
                  : 'text-[#C8C6B9] hover:text-[#F6F5EE]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Text Chat</span>
            </button>
          </div>
        </div>

        {/* View Content based on selected mode */}
        {interfaceMode === 'avatar' ? (
          <LiveKitVoiceTutor
            courseId={courseId}
            courseTitle={course?.name || 'Machine Learning (CS 229)'}
            initialMessages={messages}
            onSendMessage={handleSendMessage}
            onCitationClick={handleCitationClick}
          />
        ) : (
          <TutorChat
            messages={messages}
            onSendMessage={handleSendMessage}
            onCitationClick={handleCitationClick}
            isLoading={sendMutation.isPending}
          />
        )}
      </div>
    </AppShell>
  );
}
