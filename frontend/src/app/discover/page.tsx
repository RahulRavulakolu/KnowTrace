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

const QUICK_SEARCH_TAGS = [
  'Machine Learning',
  'Python',
  'Linear Algebra',
  'Algorithms',
  'Computer Science',
  'Data Structures',
];

export default function DiscoverPage() {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo href="/" size="md" priority />
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Multi-Platform Discovery</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white px-3 py-1.5"
            >
              My Enrolled Courses
            </Link>
            <Link
              href="/courses/cs229-ml/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <span>Demo Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-zinc-50 dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800/80 pt-12 pb-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Discover Free Courses Across 7 Platforms</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
            One Search. All Free Courses.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Search top academic and open learning resources from{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">NPTEL, SWAYAM, MIT OCW, MITx, Khan Academy, edX, and Coursera</strong>.
            Bring any course directly into KnowTrace for citation-grounded AI tutoring.
          </p>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-5">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, course title, instructor, or university (e.g. Machine Learning, Python)..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm placeholder:text-zinc-400 shadow-lg shadow-indigo-500/5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-400 mr-1">Popular:</span>
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  setActiveQuery(tag);
                }}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-[11px] font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Carousel Pills */}
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center mb-3">
            Supported Educational Sources
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlatforms([])}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedPlatforms.length === 0
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
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
                      ? `${cfg.bgColor} ${cfg.color} border-indigo-400 shadow-2xs`
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
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
          </aside>

          {/* Right Results Column */}
          <div className="flex-1">
            {/* Results Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {activeQuery ? `Results for "${activeQuery}"` : 'Discovered Courses'}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                    {sortedCourses.length}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Verified open courses ready to ingest into KnowTrace
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-hidden"
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
              <div className="lg:hidden mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
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
            )}

            {/* Active Filter Chips */}
            {(selectedPlatforms.length > 0 ||
              selectedAccessTypes.length > 0 ||
              selectedCategory ||
              activeQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-zinc-400 font-medium">Active Filters:</span>
                {activeQuery && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold">
                    <span>"{activeQuery}"</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuery('');
                        setSearchQuery('');
                      }}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedPlatforms.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800"
                  >
                    <span>{PLATFORM_CONFIGS[p]?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleTogglePlatform(p)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                    <span>{selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline ml-2"
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
                    className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800"
                  />
                ))}
              </div>
            ) : sortedCourses.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8">
                <Compass className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  No courses found matching your criteria
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mb-5">
                  Try adjusting your search terms or clearing platform filters to see courses from
                  all 7 educational sources.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
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
      <footer className="mt-auto py-8 px-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" />
            <span className="text-zinc-500">
              • Unified Multi-Platform Course Discovery & Grounded AI Tutor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="hover:underline">
              My Courses
            </Link>
            <Link href="/courses/new" className="hover:underline">
              Upload Materials
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
