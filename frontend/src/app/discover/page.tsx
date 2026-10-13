'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  Globe2,
  X,
} from 'lucide-react';
import { CatalogCourse, SourcePlatform, AccessType, PLATFORM_CONFIGS } from '@/types/discover';
import { CatalogCourseCard } from '@/components/discover/CatalogCourseCard';
import { CourseDetailModal } from '@/components/discover/CourseDetailModal';
import { SourceFilterPanel } from '@/components/discover/SourceFilterPanel';
import { SourceBadge } from '@/components/discover/SourceBadge';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const QUICK_SEARCH_TAGS = [
  'Machine Learning',
  'Python',
  'Linear Algebra',
  'Algorithms',
  'Computer Science',
  'Data Structures',
];

export default function DiscoverPage() {
  const { user, openAuthModal, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SourcePlatform[]>([]);
  const [selectedAccessTypes, setSelectedAccessTypes] = useState<AccessType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'resources'>('relevance');

  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [previewCourse, setPreviewCourse] = useState<CatalogCourse | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load initial catalog and categories
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.searchCatalog({
        query: activeQuery,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        accessTypes: selectedAccessTypes.length > 0 ? selectedAccessTypes : undefined,
        categories: selectedCategory ? [selectedCategory] : undefined,
      }),
      api.getCatalogCategories(),
    ])
      .then(([searchRes, catRes]) => {
        if (isMounted) {
          setCourses(searchRes.courses);
          setCategories(catRes);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load courses', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeQuery, selectedPlatforms, selectedAccessTypes, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery.trim());
  };

  const handleTogglePlatform = (platform: SourcePlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleToggleAccessType = (access: AccessType) => {
    setSelectedAccessTypes((prev) =>
      prev.includes(access) ? prev.filter((a) => a !== access) : [...prev, access]
    );
  };

  const handleResetFilters = () => {
    setSelectedPlatforms([]);
    setSelectedAccessTypes([]);
    setSelectedCategory(null);
    setSearchQuery('');
    setActiveQuery('');
  };

  // Sort courses
  const sortedCourses = useMemo(() => {
    const list = [...courses];
    if (sortBy === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'resources') {
      return list.sort(
        (a, b) =>
          b.video_count + b.lecture_note_count - (a.video_count + a.lecture_note_count)
      );
    }
    return list;
  }, [courses, sortBy]);

  const platformsList: SourcePlatform[] = [
    'nptel',
    'swayam',
    'mit_ocw',
    'mitx',
    'khan_academy',
    'edx',
    'coursera',
  ];

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F6F5EE] flex flex-col relative selection:bg-[#E06D3B] selection:text-black">
      {/* Noise Texture */}
      <div className="fixed inset-0 noise-overlay opacity-[0.5] mix-blend-overlay pointer-events-none z-0" />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1200px] h-[450px] bg-[#E06D3B]/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Floating Island Navbar */}
      <header className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4">
        <nav className="bg-[#141619]/90 backdrop-blur-2xl rounded-full px-4 sm:px-6 py-2.5 border border-[#1D2024] shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" priority />
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E06D3B]/10 text-[#E06D3B] border border-[#1D2024]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Multi-Platform Discovery</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-[#9E9EA8] hover:text-[#EDEDE8] px-3 py-1.5 rounded-full transition-colors hover:bg-white/5"
            >
              Overview
            </Link>
            <Link
              href="/courses"
              className="text-xs font-semibold text-[#9E9EA8] hover:text-[#EDEDE8] px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-[#1D2024] transition-colors"
            >
              My Workspace
            </Link>
            <Link
              href="/courses/cs229-ml/dashboard"
              className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-[#E06D3B] hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all active:scale-95"
            >
              <span>Demo Tutor</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-white" />
              </span>
            </Link>

            {/* Auth section */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#1D2024]">
              {user ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs text-[#E06D3B] font-medium hidden md:inline-block max-w-[110px] truncate"
                    title={user.email}
                  >
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-[#9E9EA8] hover:text-rose-400 px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-[#EDEDE8] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors font-medium cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Search Section */}
      <section className="relative z-10 pt-12 pb-10 px-4 sm:px-6 border-b border-[#1D2024]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E06D3B]/10 border border-[#1D2024] text-[#E06D3B] text-[10px] uppercase tracking-wider font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#E06D3B]" />
            <span>Discover Free Courses Across 7 Platforms</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#EDEDE8] mb-3">
            One Search. All Free Courses.
          </h1>

          <p className="text-xs sm:text-base text-[#9E9EA8] max-w-2xl mx-auto mb-8 leading-relaxed">
            Search top academic and open learning resources from{' '}
            <strong className="text-[#EDEDE8]">NPTEL, SWAYAM, MIT OCW, MITx, Khan Academy, edX, and Coursera</strong>.
            Bring any course directly into KnowTrace for citation-grounded AI tutoring.
          </p>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-6">
            <div className="p-1 rounded-[1.75rem] bg-white/[0.04] border border-[#1D2024] shadow-[0_0_35px_rgba(99,102,241,0.1)] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.25)] transition-all duration-300">
              <div className="relative flex items-center rounded-[calc(1.75rem-0.25rem)] bg-[#141619] px-4 py-2">
                <Search className="w-4 h-4 text-[#E06D3B]/80 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, course title, instructor, or university (e.g. Machine Learning, Python)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#EDEDE8] placeholder:text-[#9E9EA8]/70 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center gap-1.5 pl-4 pr-2.5 py-1.5 rounded-full bg-[#E06D3B] hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ml-2"
                >
                  <span>Search</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#9E9EA8]">
            <span className="font-semibold text-[#9E9EA8]/70 mr-1 text-[11px]">Popular:</span>
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  setActiveQuery(tag);
                }}
                className="px-3 py-1 rounded-full bg-white/[0.03] border border-[#1D2024] hover:border-indigo-400/50 hover:bg-white/[0.06] text-[#9E9EA8] hover:text-[#EDEDE8] transition-colors cursor-pointer text-[11px] font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Carousel Pills */}
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#1D2024]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9E9EA8]/70 text-center mb-3">
            Supported Educational Sources
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlatforms([])}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                selectedPlatforms.length === 0
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-white/[0.02] text-[#9E9EA8] border-[#1D2024] hover:bg-white/[0.06] hover:text-[#EDEDE8]'
              }`}
            >
              All Platforms ({platformsList.length})
            </button>
            {platformsList.map((p) => {
              const cfg = PLATFORM_CONFIGS[p];
              const isSelected = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleTogglePlatform(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/60 text-[#E06D3B] border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-white/[0.02] text-[#9E9EA8] border-[#1D2024] hover:border-white/20 hover:text-[#EDEDE8]'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Catalog Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-[1.75rem] p-1 bg-white/[0.03] border border-[#1D2024] shadow-2xl">
              <div className="rounded-[calc(1.75rem-0.25rem)] bg-[#141619] p-5 backdrop-blur-xl border border-white/[0.02]">
                <SourceFilterPanel
                  selectedPlatforms={selectedPlatforms}
                  onTogglePlatform={handleTogglePlatform}
                  selectedAccessTypes={selectedAccessTypes}
                  onToggleAccessType={handleToggleAccessType}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  availableCategories={categories}
                  totalResults={sortedCourses.length}
                  onResetFilters={handleResetFilters}
                />
              </div>
            </div>
          </aside>

          {/* Right Results Column */}
          <div className="flex-1">
            {/* Results Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1D2024]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#EDEDE8] tracking-tight">
                    {activeQuery ? `Results for "${activeQuery}"` : 'Discovered Courses'}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E06D3B]/10 border border-[#1D2024] font-bold text-[#E06D3B]">
                    {sortedCourses.length}
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA8] mt-1">
                  Verified open courses ready to ingest into KnowTrace for continuous knowledge tracing
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-[#1D2024] text-xs font-semibold text-[#EDEDE8]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#E06D3B]" />
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#9E9EA8] font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3.5 py-1.5 rounded-full bg-[#0C0C14] border border-[#1D2024] text-xs font-semibold text-[#EDEDE8] focus:outline-hidden cursor-pointer"
                  >
                    <option value="relevance">Recommended</option>
                    <option value="title">Course Name (A-Z)</option>
                    <option value="resources">Most Learning Resources</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6 rounded-[1.5rem] p-1 bg-white/[0.03] border border-[#1D2024]">
                <div className="rounded-[calc(1.5rem-0.25rem)] bg-[#0C0C14] p-4">
                  <SourceFilterPanel
                    selectedPlatforms={selectedPlatforms}
                    onTogglePlatform={handleTogglePlatform}
                    selectedAccessTypes={selectedAccessTypes}
                    onToggleAccessType={handleToggleAccessType}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    availableCategories={categories}
                    totalResults={sortedCourses.length}
                    onResetFilters={handleResetFilters}
                  />
                </div>
              </div>
            )}

            {/* Active Filter Chips */}
            {(selectedPlatforms.length > 0 ||
              selectedAccessTypes.length > 0 ||
              selectedCategory ||
              activeQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-[#9E9EA8] font-medium">Active:</span>
                {activeQuery && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-[#EDEDE8] font-semibold border border-[#1D2024]">
                    <span>&ldquo;{activeQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuery('');
                        setSearchQuery('');
                      }}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedPlatforms.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-950/60 text-[#E06D3B] font-semibold border border-indigo-800"
                  >
                    <span>{PLATFORM_CONFIGS[p]?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleTogglePlatform(p)}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-[#EDEDE8] font-semibold border border-[#1D2024]">
                    <span>{selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#E06D3B] font-semibold hover:underline ml-2 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Courses Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-[1.75rem] p-1 bg-white/[0.02] border border-white/[0.05] animate-pulse"
                  >
                    <div className="h-full rounded-[calc(1.75rem-0.25rem)] bg-[#0C0C14]/70 p-6" />
                  </div>
                ))}
              </div>
            ) : sortedCourses.length === 0 ? (
              <div className="py-16 text-center rounded-[2rem] bg-white/[0.02] border border-[#1D2024] backdrop-blur-xl p-8 max-w-md mx-auto shadow-2xl">
                <Compass className="w-12 h-12 text-[#E06D3B]/80 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#EDEDE8] mb-1">
                  No courses found matching your criteria
                </h3>
                <p className="text-xs text-[#9E9EA8] max-w-md mx-auto mb-5 leading-relaxed">
                  Try adjusting your search terms or clearing platform filters to see courses from
                  all 7 educational sources.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-full bg-[#E06D3B] hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sortedCourses.map((c) => (
                  <CatalogCourseCard
                    key={`${c.source_platform}-${c.source_id}`}
                    course={c}
                    onPreview={(course) => setPreviewCourse(course)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Course Detail Syllabus Modal */}
      <CourseDetailModal
        course={previewCourse}
        isOpen={previewCourse !== null}
        onClose={() => setPreviewCourse(null)}
      />

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-[#1D2024] text-center text-xs text-[#9E9EA8]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" />
            <span className="text-[#9E9EA8]/70">
              • Unified Multi-Platform Course Discovery & Grounded AI Tutor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="hover:text-[#EDEDE8] transition-colors">
              My Courses
            </Link>
            <Link href="/courses/new" className="hover:text-[#EDEDE8] transition-colors">
              Upload Materials
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
