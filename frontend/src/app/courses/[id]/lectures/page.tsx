'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
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
    <AppShell courseId={courseId} title="Recorded Course Lectures">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Link href={`/courses/${courseId}/dashboard`} className="hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">Lecture Videos</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-xs">
                {activeLecture?.title || 'Lecture Player'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <span>{course?.name || lecturesData?.course_title || 'Course Lectures'}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {platformBadge}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs active:scale-95"
            >
              <BotMessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </Link>

            <Link
              href={`/courses/${courseId}/quiz/new`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Take Quiz</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Video Theater & Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Player & Tabs */}
          <div className="lg:col-span-2 space-y-5">
            {/* Embedded Video Theater */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
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
                  <PlayCircle className="w-16 h-16 text-indigo-500 animate-pulse" />
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
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                        {activeModuleTitle}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Clock className="w-3 h-3" />
                        {activeDuration} min
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                      {activeLecture.title}
                    </h2>
                    {activeLecture.instructor && (
                      <p className="text-xs text-zinc-500">
                        Instructor: <strong className="text-zinc-700 dark:text-zinc-300">{activeLecture.instructor}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRightPanelTab('code')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${rightPanelTab === 'code'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Source Video</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleCompleted(activeLecture.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${completedLectures[activeLecture.id]
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{completedLectures[activeLecture.id] ? 'Completed' : 'Mark as Watched'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabbed Content Navigation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('transcript')}
                  className={`pb-2.5 font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'transcript'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Synchronized Transcript</span>
                  {activeLecture?.transcript && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                      {activeLecture.transcript.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2.5 font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'notes'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Key Concepts & Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('resources')}
                  className={`pb-2.5 font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'resources'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Lecture Handouts (PDF)</span>
                </button>
              </div>

              {/* Tab 1: Transcript */}
              {activeTab === 'transcript' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                        placeholder="Search spoken terms in lecture..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {filteredTranscript.length} segments
                    </span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {filteredTranscript.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400">
                        No transcript segments found matching &quot;{transcriptSearch}&quot;.
                      </div>
                    ) : (
                      filteredTranscript.map((segment, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors flex items-start gap-3 group text-xs"
                        >
                          <a
                            href={`https://www.youtube.com/watch?v=${activeYtId}&t=${Math.floor(segment.seconds)}s`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-indigo-600 dark:text-indigo-400 font-bold shrink-0 hover:underline px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50"
                            title="Jump to this timestamp in video"
                          >
                            {segment.timestamp}
                          </a>
                          <p className="flex-1 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {segment.text}
                          </p>
                          <Link
                            href={`/courses/${courseId}/tutor?prompt=${encodeURIComponent(`In ${activeLecture?.title} at ${segment.timestamp}, the professor explains: "${segment.text}". Can you explain this concept in depth with an example?`)}`}
                            className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-1 rounded-md transition-opacity shrink-0"
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
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                      Key Takeaways & Core Formalisms
                    </h3>
                    <p className="text-zinc-500">
                      Essential mental models, proofs, and definitions from this lecture:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {activeLecture?.notes && activeLecture.notes.length > 0 ? (
                      activeLecture.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px] font-mono mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
                            {note}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400">No notes recorded yet for this lecture.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Resources & Handouts */}
              {activeTab === 'resources' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                      Official Course Handouts & Slides
                    </h3>
                    <p className="text-zinc-500">
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
                          className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {res.title}
                              </div>
                              <div className="text-[11px] text-zinc-400 uppercase font-mono">
                                {res.type} Document · Official Course Material
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                        </a>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-center">
                        All materials embedded into the live video lecture and AI tutor index.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Code Sandbox & Course Syllabus Tabs */}
          <div className="space-y-4">
            {/* Top Switcher Tab */}
            <div className="p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setRightPanelTab('code')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${rightPanelTab === 'code'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
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
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Syllabus</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono">
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
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Course Syllabus
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {lectures.length} Lectures
                  </span>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                  {groupedModules.map((group, modIdx) => (
                    <div key={modIdx} className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 px-1 font-mono">
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
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
                                : 'bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-800'
                                }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : isSelected ? (
                                  <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-zinc-400" />
                                )}
                              </div>

                              <div className="space-y-0.5 flex-1 min-w-0 text-xs">
                                <div
                                  className={`font-bold truncate ${isSelected
                                    ? 'text-indigo-900 dark:text-indigo-200'
                                    : 'text-zinc-800 dark:text-zinc-200'
                                    }`}
                                >
                                  {lec.title}
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Grounded Learning Loop</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Every video is indexed with second-by-second speech timestamps. When you ask the AI Tutor a question, it cites the exact minute of the lecture!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
