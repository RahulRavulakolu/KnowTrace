'use client';

import React, { useState, useMemo, useEffect, useRef, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { useQuery } from '@tanstack/react-query';
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
  Tv,
  RefreshCw,
  Maximize2,
  Code2,
  Terminal,
  GripVertical,
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
  const [playerMode, setPlayerMode] = useState<'embed' | 'direct'>('embed');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [completedLectures, setCompletedLectures] = useState<Record<string, boolean>>({});

  // Resizable split panel state
  const [leftPanelPercent, setLeftPanelPercent] = useState<number>(55);
  const [isDraggingDivider, setIsDraggingDivider] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor desktop screen size & load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(min-width: 1024px)');
      setIsDesktop(mq.matches);
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
  const { data: lecturesData, refetch, isFetching } = useQuery<CourseLecturesResponse>({
    queryKey: ['courseLectures', courseId],
    queryFn: () => api.getCourseLectures(courseId),
  });

  // Clear stale local storage cache once on mount if it contains old truncated data or broken video IDs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('knowtrace_lectures_' + courseId);
        if (raw) {
          let shouldClear = false;
          const badIds = ['PPLop442CuU', 'ytpJdnlu9ug', '4b4MUYve_U8', 'NuDgq0Lp8l4', 'wblW_M_SXh8', 'h9wStqSkNU4'];
          if (badIds.some((bid) => raw.includes(bid))) {
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

  const rawLectures = lecturesData?.lectures || [];

  // Normalize each lecture so both camelCase and snake_case properties are guaranteed
  const lectures: Lecture[] = useMemo(() => {
    return rawLectures.map((l: any, idx: number) => {
      const ytId = l.youtubeId || l.youtube_id || '';
      const dur = l.durationMinutes ?? l.duration_minutes ?? 75;
      const mod = l.moduleTitle || l.module_title || 'Course Modules';
      const concept = l.conceptName || l.concept_name || 'Core Concept';

      return {
        ...l,
        id: l.id || `lec-${idx + 1}`,
        courseId: l.courseId || l.course_id || courseId,
        moduleId: l.moduleId || l.module_id || `mod-${idx + 1}`,
        moduleTitle: mod,
        order: l.order || idx + 1,
        title: l.title || `Lecture ${idx + 1}`,
        durationMinutes: dur,
        instructor: l.instructor || 'Prof. Tom Leighton, MIT',
        platform: l.platform || 'MIT OpenCourseWare',
        youtubeId: ytId,
        videoUrl: l.videoUrl || l.video_url || (ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1` : ''),
        downloadUrl: l.downloadUrl || l.download_url || '',
        thumbnailUrl: l.thumbnailUrl || l.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
        conceptName: concept,
        notes: l.notes || [],
        transcript: l.transcript || [],
        resources: l.resources || [],
      };
    });
  }, [rawLectures, courseId]);

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
    setCompletedLectures((prev) => ({
      ...prev,
      [lecId]: !prev[lecId],
    }));
  };

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
                      Download original lecture notes, slides, and problem sets provided by {activeLecture?.platform || 'the institution'}:
                    </p>
                  </div>

                  <div className="space-y-2">
                    {activeLecture?.resources && activeLecture.resources.length > 0 ? (
                      activeLecture.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl border border-[#1D2024] hover:border-[#E06D3B]/40 bg-[#0C0D0E] transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#E06D3B]/10 text-[#E06D3B]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[#F6F5EE] group-hover:text-[#E06D3B] transition-colors">
                                {res.title}
                              </div>
                              <div className="text-[11px] text-[#7E8078] uppercase font-mono">
                                {res.type} Document · Official Course Material
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-[#7E8078] group-hover:text-[#E06D3B] transition-colors" />
                        </a>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-[#1D2024] text-[#7E8078] text-center">
                        All materials embedded into the live video lecture and AI tutor index.
                      </div>
                    )}
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
                  <span className="text-[11px] font-mono text-[#7E8078]">
                    {lectures.length} Lectures
                  </span>
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
                            <button
                              key={lec.id}
                              type="button"
                              onClick={() => setSelectedLectureId(lec.id)}
                              className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 cursor-pointer ${isSelected
                                ? 'bg-[#E06D3B]/10 border-[#E06D3B]/40 shadow-xs'
                                : 'bg-[#0C0D0E] hover:bg-[#1A1D21] border-[#1D2024]'
                                }`}
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
    </AppShell>
  );
}
