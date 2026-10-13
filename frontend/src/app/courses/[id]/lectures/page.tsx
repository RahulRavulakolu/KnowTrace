'use client';

import React, { useState, useMemo, useEffect, useRef, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Course, CourseLecturesResponse, Lecture } from '@/types';
import {
  Play,
  PlayCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  BotMessageSquare,
  Search,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Download,
  RefreshCw,
  Code2,
  GripVertical,
  Lock,
  Award,
  Printer,
  X,
} from 'lucide-react';
import { CodingEnvironment } from '@/components/lectures/CodingEnvironment';

export default function CourseLecturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const searchParams = useSearchParams();
  const initialLectureId = searchParams.get('lectureId');

  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'resources'>('transcript');
  const [rightPanelTab, setRightPanelTab] = useState<'code' | 'syllabus'>('code');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [completedLectures, setCompletedLectures] = useState<Record<string, boolean>>({});
  const [isHandoutModalOpen, setIsHandoutModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Load persisted syllabus completion on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('knowtrace_completed_lectures_' + courseId);
        if (saved) {
          setCompletedLectures(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load completed lectures', e);
      }
    }
  }, [courseId]);

  // Resizable split panel state
  const [leftPanelPercent, setLeftPanelPercent] = useState<number>(55);
  const [isDraggingDivider, setIsDraggingDivider] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return true;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor desktop screen size & load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(min-width: 1024px)');
      const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
      mq.addEventListener('change', handler);

      const saved = window.localStorage.getItem('knowtrace_lectures_split_pct');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 25 && parsed <= 75) {
          setLeftPanelPercent(parsed);
        }
      }

      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  const updateSplitPercent = (pct: number) => {
    const clamped = Math.max(25, Math.min(75, pct));
    setLeftPanelPercent(clamped);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('knowtrace_lectures_split_pct', clamped.toString());
    }
  };

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const relativeX = currentX - rect.left;
      let newPercent = (relativeX / rect.width) * 100;
      newPercent = Math.max(25, Math.min(75, newPercent));
      setLeftPanelPercent(newPercent);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDraggingDivider(false);
      const currentX = upEvent.clientX;
      const relativeX = currentX - rect.left;
      let newPercent = (relativeX / rect.width) * 100;
      newPercent = Math.max(25, Math.min(75, newPercent));
      updateSplitPercent(newPercent);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Fetch course details
  const { data: course } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId),
  });

  // Fetch recorded lectures
  const { data: lecturesData, refetch } = useQuery<CourseLecturesResponse>({
    queryKey: ['courseLectures', courseId],
    queryFn: () => api.getCourseLectures(courseId),
  });

  // Clear stale local storage cache once on mount if it contains old truncated data, broken video IDs, or hallucinated URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('knowtrace_lectures_' + courseId);
        if (raw) {
          let shouldClear = false;
          const badIds = ['PPLop442CuU', 'ytpJdnlu9ug', '4b4MUYve_U8', 'NuDgq0Lp8l4', 'wblW_M_SXh8', 'h9wStqSkNU4'];
          const brokenPatterns = ['lec01.pdf', 'lec0', 'lec1', 'lec2', 'notes1.pdf', 'notes2.pdf', 'textbook-ch', '6-042j/'];
          if (badIds.some((bid) => raw.includes(bid)) || brokenPatterns.some((bp) => raw.includes(bp))) {
            shouldClear = true;
          } else {
            try {
              const parsed = JSON.parse(raw);
              if (!parsed.lectures || parsed.lectures.length < 8) {
                shouldClear = true;
              }
            } catch {
              shouldClear = true;
            }
          }
          if (shouldClear) {
            window.localStorage.removeItem('knowtrace_lectures_' + courseId);
            refetch();
          }
        }
      } catch {
        // ignore
      }
    }
  }, [courseId, refetch]);

  // Normalize each lecture so both camelCase and snake_case properties are guaranteed
  const lectures: Lecture[] = useMemo(() => {
    const rawLectures = (lecturesData?.lectures || []) as (Lecture & Record<string, unknown>)[];
    return rawLectures.map((l, idx: number): Lecture => {
      const ytId = (l.youtubeId as string) || (l.youtube_id as string) || '';
      const dur = (l.durationMinutes as number) ?? (l.duration_minutes as number) ?? 75;
      const mod = (l.moduleTitle as string) || (l.module_title as string) || 'Course Modules';
      const concept = (l.conceptName as string) || (l.concept_name as string) || 'Core Concept';

      return {
        ...l,
        id: l.id || `lec-${idx + 1}`,
        courseId: l.courseId || (l.course_id as string) || courseId,
        moduleId: l.moduleId || (l.module_id as string) || `mod-${idx + 1}`,
        moduleTitle: mod,
        order: l.order || idx + 1,
        title: l.title || `Lecture ${idx + 1}`,
        durationMinutes: dur,
        instructor: l.instructor || 'Prof. Tom Leighton, MIT',
        platform: l.platform || 'MIT OpenCourseWare',
        youtubeId: ytId,
        videoUrl: l.videoUrl || (l.video_url as string) || (ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1` : ''),
        downloadUrl: l.downloadUrl || (l.download_url as string) || '',
        thumbnailUrl: l.thumbnailUrl || (l.thumbnail_url as string) || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
        conceptName: concept,
        notes: l.notes || [],
        transcript: l.transcript || [],
        resources: l.resources || [],
      };
    });
  }, [lecturesData?.lectures, courseId]);

  // Selected lecture state
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  const activeLecture = useMemo(() => {
    if (selectedLectureId) {
      const found = lectures.find((l) => l.id === selectedLectureId);
      if (found) return found;
    }
    if (initialLectureId) {
      const found = lectures.find((l) => l.id === initialLectureId);
      if (found) return found;
    }
    return lectures[0] || null;
  }, [lectures, selectedLectureId, initialLectureId]);

  // Group lectures by module
  const groupedModules = useMemo(() => {
    const map = new Map<string, Lecture[]>();
    for (const lec of lectures) {
      const mod = lec.moduleTitle || 'Course Modules';
      if (!map.has(mod)) {
        map.set(mod, []);
      }
      map.get(mod)!.push(lec);
    }
    return Array.from(map.entries()).map(([moduleTitle, items]) => ({
      moduleTitle,
      lectures: items.sort((a, b) => a.order - b.order),
    }));
  }, [lectures]);

  const toggleCompleted = (lecId: string) => {
    setCompletedLectures((prev) => {
      const updated = {
        ...prev,
        [lecId]: !prev[lecId],
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('knowtrace_completed_lectures_' + courseId, JSON.stringify(updated));
      }
      queryClient.invalidateQueries({ queryKey: ['certificate', courseId] });
      return updated;
    });
  };

  const completedCount = useMemo(() => {
    return Object.values(completedLectures).filter(Boolean).length;
  }, [completedLectures]);

  const totalLecturesCount = lectures.length;
  const lectureCompletionPct = totalLecturesCount > 0 ? Math.round((completedCount / totalLecturesCount) * 100) : 0;

  const filteredTranscript = useMemo(() => {
    if (!activeLecture?.transcript) return [];
    if (!transcriptSearch.trim()) return activeLecture.transcript;
    const lower = transcriptSearch.toLowerCase();
    return activeLecture.transcript.filter((t) => t.text.toLowerCase().includes(lower));
  }, [activeLecture, transcriptSearch]);

  const platformBadge = lecturesData?.platform || course?.source_platform || 'Educational Source';
  const activeYtId = activeLecture?.youtubeId || '';
  const activeDuration = activeLecture?.durationMinutes || 60;
  const activeModuleTitle = activeLecture?.moduleTitle || 'Course Module';

  return (
    <AppShell courseId={courseId} title="Recorded Course Lectures" fullWidth>
      <div className="space-y-6 w-full">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1D2024]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#7E8078]">
              <Link href={`/courses/${courseId}/dashboard`} className="hover:text-[#E06D3B] transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#C8C6B9] font-medium">Lecture Videos</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#E06D3B] font-semibold truncate max-w-xs">
                {activeLecture?.title || 'Lecture Player'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F6F5EE] flex items-center gap-2.5">
              <span>{course?.name || lecturesData?.course_title || 'Course Lectures'}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E06D3B]/10 text-[#E06D3B] border border-[#E06D3B]/30">
                {platformBadge}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Quick Layout Split Presets (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-[11px] font-mono shadow-2xs">
              <span className="text-[#7E8078] pl-0.5 pr-1 font-sans font-semibold">Layout:</span>
              <button
                type="button"
                onClick={() => updateSplitPercent(65)}
                className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  Math.round(leftPanelPercent) === 65
                    ? 'bg-[#E06D3B] text-white font-bold shadow-xs'
                    : 'text-[#7E8078] hover:text-[#F6F5EE]'
                }`}
                title="Video Focus (65% Video / 35% Code)"
              >
                65/35
              </button>
              <button
                type="button"
                onClick={() => updateSplitPercent(50)}
                className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  Math.round(leftPanelPercent) === 50
                    ? 'bg-[#E06D3B] text-white font-bold shadow-xs'
                    : 'text-[#7E8078] hover:text-[#F6F5EE]'
                }`}
                title="Balanced (50% Video / 50% Code)"
              >
                50/50
              </button>
              <button
                type="button"
                onClick={() => updateSplitPercent(35)}
                className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  Math.round(leftPanelPercent) === 35
                    ? 'bg-[#E06D3B] text-white font-bold shadow-xs'
                    : 'text-[#7E8078] hover:text-[#F6F5EE]'
                }`}
                title="Code Focus (35% Video / 65% Code)"
              >
                35/65
              </button>
            </div>

            {activeYtId && (
              <a
                href={`https://www.youtube.com/watch?v=${activeYtId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Source Platform</span>
              </a>
            )}

            <Link
              href={`/courses/${courseId}/tutor?prompt=${encodeURIComponent(`I am studying ${activeLecture?.title || 'this lecture'}. Can you summarize its core concepts and explain them with examples?`)}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-white font-bold transition-all shadow-xs active:scale-95"
            >
              <BotMessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </Link>

            <Link
              href={`/courses/${courseId}/quiz/new`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1D21] hover:bg-[#1D2024] text-[#C8C6B9] hover:text-[#F6F5EE] border border-[#1D2024] font-semibold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Take Quiz</span>
            </Link>

            <Link
              href={`/courses/${courseId}/certificate`}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                lectureCompletionPct >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300/80 text-amber-700 dark:text-amber-300'
              }`}
              title={
                lectureCompletionPct >= 80
                  ? 'Certificate requirements met! Click to claim'
                  : `Complete at least 80% to unlock certificate (${lectureCompletionPct}% completed)`
              }
            >
              {lectureCompletionPct >= 80 ? (
                <>
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Certificate Ready</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Certificate ({lectureCompletionPct}% / 80%)</span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Main Flexible Split View: Video Theater & Code / Syllabus Panel */}
        <div
          ref={containerRef}
          className={`flex flex-col lg:flex-row items-stretch relative ${
            isDraggingDivider ? 'select-none cursor-col-resize' : ''
          }`}
        >
          {/* Left Panel: Video Player & Tabs */}
          <div
            style={{ width: isDesktop ? `${leftPanelPercent}%` : '100%' }}
            className={`w-full lg:shrink-0 space-y-5 lg:pr-3 transition-[width] duration-75 ${
              isDraggingDivider ? 'select-none pointer-events-none' : ''
            }`}
          >
            {/* Embedded Video Theater */}
            <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl ${
              isDraggingDivider ? 'pointer-events-none select-none' : ''
            }`}>
              {activeYtId ? (
                <iframe
                  key={activeLecture?.id || activeYtId}
                  src={`https://www.youtube.com/embed/${activeYtId}?autoplay=1&rel=0&enablejsapi=1`}
                  title={activeLecture?.title || 'Course Lecture Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0"
                />
              ) : activeLecture?.videoUrl ? (
                <video
                  key={activeLecture.id}
                  src={activeLecture.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-6 space-y-3">
                  <PlayCircle className="w-16 h-16 text-[#E06D3B] animate-pulse" />
                  <p className="text-sm font-medium">Loading lecture stream from {platformBadge}...</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reload Video Stream</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video Controls & External Link Banner */}
            {activeLecture && (
              <div className="p-4 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D3B] font-mono">
                        {activeModuleTitle}
                      </span>
                      <span className="text-[#7E8078]">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#7E8078] font-mono">
                        <Clock className="w-3 h-3" />
                        {activeDuration} min
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-[#F6F5EE]">
                      {activeLecture.title}
                    </h2>
                    {activeLecture.instructor && (
                      <p className="text-xs text-[#7E8078]">
                        Instructor: <strong className="text-[#C8C6B9]">{activeLecture.instructor}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRightPanelTab('code')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${rightPanelTab === 'code'
                        ? 'bg-[#E06D3B] text-white border-[#E06D3B] shadow-xs'
                        : 'bg-[#E06D3B]/10 text-[#E06D3B] border-[#E06D3B]/30 hover:bg-[#E06D3B]/20'
                        }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Practice in Code Lab</span>
                    </button>

                    {activeYtId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${activeYtId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A1D21] hover:bg-[#1D2024] border border-[#1D2024] text-[#C8C6B9] hover:text-[#F6F5EE] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Source Video</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleCompleted(activeLecture.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${completedLectures[activeLecture.id]
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        : 'bg-[#1A1D21] border-[#1D2024] text-[#C8C6B9] hover:border-[#E06D3B]/50 hover:text-[#F6F5EE]'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{completedLectures[activeLecture.id] ? 'Completed' : 'Mark as Watched'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabbed Content Navigation */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-[#1D2024] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('transcript')}
                  className={`pb-2.5 font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'transcript'
                    ? 'text-[#E06D3B] border-b-2 border-[#E06D3B]'
                    : 'text-[#7E8078] hover:text-[#F6F5EE]'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Synchronized Transcript</span>
                  {activeLecture?.transcript && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1A1D21] text-[#7E8078] font-mono border border-[#1D2024]">
                      {activeLecture.transcript.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2.5 font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'notes'
                    ? 'text-[#E06D3B] border-b-2 border-[#E06D3B]'
                    : 'text-[#7E8078] hover:text-[#F6F5EE]'
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Key Concepts & Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('resources')}
                  className={`pb-2.5 font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'resources'
                    ? 'text-[#E06D3B] border-b-2 border-[#E06D3B]'
                    : 'text-[#7E8078] hover:text-[#F6F5EE]'
                    }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Lecture Handouts (PDF)</span>
                </button>
              </div>

              {/* Tab 1: Transcript */}
              {activeTab === 'transcript' && (
                <div className="p-5 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-[#7E8078] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                        placeholder="Search spoken terms in lecture..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-xs text-[#F6F5EE] placeholder-[#7E8078] focus:outline-hidden focus:ring-2 focus:ring-[#E06D3B]"
                      />
                    </div>
                    <span className="text-[11px] text-[#7E8078] font-mono">
                      {filteredTranscript.length} segments
                    </span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {filteredTranscript.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7E8078]">
                        No transcript segments found matching &quot;{transcriptSearch}&quot;.
                      </div>
                    ) : (
                      filteredTranscript.map((segment, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl hover:bg-[#1A1D21] border border-transparent hover:border-[#1D2024] transition-colors flex items-start gap-3 group text-xs"
                        >
                          <a
                            href={`https://www.youtube.com/watch?v=${activeYtId}&t=${Math.floor(segment.seconds)}s`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[#E06D3B] font-bold shrink-0 hover:underline px-1.5 py-0.5 rounded bg-[#E06D3B]/10 border border-[#E06D3B]/30"
                            title="Jump to this timestamp in video"
                          >
                            {segment.timestamp}
                          </a>
                          <p className="flex-1 text-[#C8C6B9] leading-relaxed">
                            {segment.text}
                          </p>
                          <Link
                            href={`/courses/${courseId}/tutor?prompt=${encodeURIComponent(`In ${activeLecture?.title} at ${segment.timestamp}, the professor explains: "${segment.text}". Can you explain this concept in depth with an example?`)}`}
                            className="opacity-0 group-hover:opacity-100 text-[#E06D3B] hover:text-[#FF9457] p-1 rounded-md transition-opacity shrink-0"
                            title="Ask AI Tutor about this moment"
                          >
                            <BotMessageSquare className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Notes */}
              {activeTab === 'notes' && (
                <div className="p-5 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-[#F6F5EE] mb-1">
                      Key Takeaways & Core Formalisms
                    </h3>
                    <p className="text-[#7E8078]">
                      Essential mental models, proofs, and definitions from this lecture:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {activeLecture?.notes && activeLecture.notes.length > 0 ? (
                      activeLecture.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#0C0D0E] border border-[#1D2024] flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#E06D3B]/10 border border-[#E06D3B]/30 text-[#E06D3B] font-bold flex items-center justify-center shrink-0 text-[11px] font-mono mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-[#F6F5EE] leading-relaxed font-medium">
                            {note}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#7E8078]">No notes recorded yet for this lecture.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Resources & Handouts */}
              {activeTab === 'resources' && (
                <div className="p-5 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-[#F6F5EE] mb-1">
                      Official Course Handouts & Slides
                    </h3>
                    <p className="text-[#7E8078]">
                      View synthesized study notes, slides, and access verified course portal resources:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Primary In-App Printable Handout & Slide Deck */}
                    <div
                      onClick={() => setIsHandoutModalOpen(true)}
                      className="p-4 rounded-xl border border-[#1D2024] bg-[#0C0D0E] hover:border-[#E06D3B]/40 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-[#E06D3B] text-white shadow-xs group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#F6F5EE] group-hover:text-[#E06D3B] transition-colors flex items-center gap-2">
                            <span>{activeLecture?.title || 'Lecture'} Study Handout & Slides</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E06D3B]/20 text-[#E06D3B]">
                              PDF Ready
                            </span>
                          </div>
                          <div className="text-[11px] text-[#7E8078] mt-0.5">
                            Synthesized Lecture Notes · Mathematical Proofs · Full Transcript · Print/Save PDF
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHandoutModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#E06D3B] hover:bg-[#FF9457] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print PDF</span>
                      </button>
                    </div>

                    {/* Additional Resources from Catalog */}
                    {activeLecture?.resources && activeLecture.resources.length > 0 ? (
                      activeLecture.resources.map((res, idx) => {
                        const isHandout = res.type === 'handout' || res.url === '#handout';
                        if (isHandout) return null; // already shown as primary card above

                        return (
                          <a
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group cursor-pointer bg-zinc-50/50 dark:bg-zinc-850/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {res.title}
                                </div>
                                <div className="text-[11px] text-zinc-400 uppercase font-mono">
                                  Official Institution Portal · Verified Source
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                          </a>
                        );
                      })
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Draggable Vertical Divider (Visible on large screens) */}
          <div
            onMouseDown={handleDividerMouseDown}
            onDoubleClick={() => updateSplitPercent(55)}
            title="Drag left or right to adjust panel width (Double-click to reset)"
            className={`hidden lg:flex w-4 shrink-0 -mx-1 z-20 cursor-col-resize items-center justify-center group transition-colors select-none ${
              isDraggingDivider ? 'bg-[#E06D3B]/25' : 'hover:bg-[#E06D3B]/10'
            }`}
          >
            <div
              className={`w-1 rounded-full transition-all flex items-center justify-center ${
                isDraggingDivider
                  ? 'bg-[#E06D3B] h-28 ring-4 ring-[#E06D3B]/20 shadow-md'
                  : 'bg-[#1D2024] h-16 group-hover:bg-[#E06D3B] group-hover:w-1.5 group-hover:h-24 group-hover:shadow-sm'
              }`}
            >
              <GripVertical className="w-3 h-3 text-[#7E8078] group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Right Panel: Code Sandbox & Course Syllabus Tabs */}
          <div
            style={{ width: isDesktop ? `${100 - leftPanelPercent}%` : '100%' }}
            className={`w-full lg:shrink-0 space-y-4 lg:pl-3 transition-[width] duration-75 ${
              isDraggingDivider ? 'select-none pointer-events-none' : ''
            }`}
          >
            {/* Top Switcher Tab */}
            <div className="p-1 bg-[#141619] rounded-2xl border border-[#1D2024] flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setRightPanelTab('code')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${rightPanelTab === 'code'
                  ? 'bg-[#0C0D0E] text-[#E06D3B] shadow-xs border border-[#1D2024]'
                  : 'text-[#7E8078] hover:text-[#F6F5EE]'
                  }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Coding Lab</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Interactive Python practice available" />
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab('syllabus')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${rightPanelTab === 'syllabus'
                  ? 'bg-[#0C0D0E] text-[#E06D3B] shadow-xs border border-[#1D2024]'
                  : 'text-[#7E8078] hover:text-[#F6F5EE]'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Syllabus</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1A1D21] text-[#7E8078] font-mono border border-[#1D2024]">
                  {lectures.length}
                </span>
              </button>
            </div>

            {/* Panel View: Either Coding Lab or Syllabus Playlist */}
            {rightPanelTab === 'code' ? (
              <CodingEnvironment
                lecture={activeLecture}
                courseId={courseId}
                onOpenSyllabus={() => setRightPanelTab('syllabus')}
              />
            ) : (
              <div className="p-4 rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1D2024]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#E06D3B]" />
                    <h3 className="text-sm font-bold text-[#F6F5EE]">
                      Course Syllabus
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#1D2024] text-[#C8C6B9] font-mono">
                      {completedCount}/{totalLecturesCount} Watched ({lectureCompletionPct}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                  {groupedModules.map((group, modIdx) => (
                    <div key={modIdx} className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#7E8078] px-1 font-mono">
                        {group.moduleTitle}
                      </div>

                      <div className="space-y-1.5">
                        {group.lectures.map((lec) => {
                          const isSelected = activeLecture?.id === lec.id;
                          const isDone = !!completedLectures[lec.id];

                          return (
                            <div
                              key={lec.id}
                              className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${isSelected
                                ? 'bg-[#E06D3B]/10 border-[#E06D3B]/40 shadow-xs'
                                : 'bg-[#0C0D0E] hover:bg-[#1A1D21] border-[#1D2024]'
                                }`}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedLectureId(lec.id)}
                                className="flex items-start gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : isSelected ? (
                                    <Play className="w-4 h-4 text-[#E06D3B] fill-[#E06D3B]" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-[#7E8078]" />
                                  )}
                                </div>

                                <div className="space-y-0.5 flex-1 min-w-0 text-xs">
                                  <div
                                    className={`font-bold truncate ${isSelected
                                      ? 'text-[#E06D3B]'
                                      : 'text-[#F6F5EE]'
                                      }`}
                                  >
                                    {lec.title}
                                  </div>

                                  <div className="flex items-center gap-2 text-[10px] text-[#7E8078] font-mono">
                                    <span>{lec.durationMinutes} min</span>
                                    {lec.conceptName && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{lec.conceptName}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleCompleted(lec.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all shrink-0 cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                                    : 'bg-[#141619] border-[#1D2024] text-[#7E8078] hover:text-[#F6F5EE] hover:border-emerald-500'
                                }`}
                                title={isDone ? 'Mark as Unwatched' : 'Mark as Watched'}
                              >
                                {isDone ? 'Watched' : 'Mark Done'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Helper Box */}
            <div className="p-4 rounded-2xl bg-[#141619] border border-[#1D2024] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#E06D3B]">
                <Sparkles className="w-3.5 h-3.5 text-[#E06D3B]" />
                <span>Grounded Learning Loop</span>
              </div>
              <p className="text-[#C8C6B9] leading-relaxed">
                Every video is indexed with second-by-second speech timestamps. When you ask the AI Tutor a question, it cites the exact minute of the lecture!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Handout & Slide Notes Printable Modal */}
      {isHandoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .printable-handout-modal, .printable-handout-modal * {
                visibility: visible !important;
              }
              .printable-handout-modal {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                background: #ffffff !important;
                color: #111827 !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
              }
              .print-hide {
                display: none !important;
              }
            }
          `}</style>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 printable-handout-modal">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-850 print-hide">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Lecture Study Handout & Slides
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeLecture?.title} · {activeLecture?.platform || 'KnowTrace Learning'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHandoutModalOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Close Handout"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-zinc-800 dark:text-zinc-200">
              {/* Document Banner */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                    {activeLecture?.platform || 'NPTEL & IIT Madras'} · Official Courseware
                  </span>
                  <span className="font-mono">Module: {activeLecture?.moduleTitle}</span>
                </div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
                  {activeLecture?.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                  <span><strong>Instructor:</strong> {activeLecture?.instructor || 'Course Faculty'}</span>
                  <span>•</span>
                  <span><strong>Focus Concept:</strong> {activeLecture?.conceptName || 'Core Foundations'}</span>
                  <span>•</span>
                  <span><strong>Duration:</strong> {activeLecture?.durationMinutes} mins</span>
                </div>
              </div>

              {/* Core Concepts */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Core Concepts & Key Takeaways
                </h3>
                <div className="grid gap-2.5">
                  {activeLecture?.notes && activeLecture.notes.length > 0 ? (
                    activeLecture.notes.map((note, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 flex items-start gap-3 text-xs leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{note}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No notes recorded yet for this lecture.</p>
                  )}
                </div>
              </div>

              {/* Spoken Transcript */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Spoken Transcript & Timestamped Discussion Points
                </h3>
                <div className="space-y-2">
                  {activeLecture?.transcript && activeLecture.transcript.length > 0 ? (
                    activeLecture.transcript.map((seg, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3 text-xs"
                      >
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 text-[11px]">
                          {seg.timestamp}
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{seg.text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No transcript segments recorded.</p>
                  )}
                </div>
              </div>

              {/* Official Verification Box */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-zinc-600 dark:text-zinc-400 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Official Course Portal Verification
                  </div>
                  <p>
                    This lecture handout was synthesized from verified {activeLecture?.platform || 'official course'} curriculum.
                    For exam registration and certified grading, visit the official institution portal.
                  </p>
                </div>
                <a
                  href="https://nptel.ac.in/courses/106106139"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
