'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BotMessageSquare,
  HelpCircle,
  Network,
  CalendarCheck,
  AlertOctagon,
  BarChart3,
  UploadCloud,
  FileCheck2,
  Compass,
  Video,
  GraduationCap,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Logo } from './Logo';
import { useSidebar } from './ui/sidebar';

interface SidebarProps {
  courseId: string;
  courseName?: string;
  activeMisconceptions?: number;
  overallMastery?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  courseId,
  courseName = 'CS 229 Machine Learning',
  activeMisconceptions = 2,
  overallMastery = 64,
  isOpen: isOpenProp,
  onClose: onCloseProp,
}: SidebarProps) {
  const pathname = usePathname();
  const sidebar = useSidebar();

  const isMobile = sidebar.isMobile;
  const isMobileOpen = isMobile ? (isOpenProp ?? sidebar.openMobile) : false;
  const isCollapsed = !sidebar.open;

  const handleClose = () => {
    if (onCloseProp) {
      onCloseProp();
    }
    sidebar.setOpenMobile(false);
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: `/courses/${courseId}/dashboard`,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Lecture Videos',
      href: `/courses/${courseId}/lectures`,
      icon: Video,
      badge: 'Recorded',
      badgeColor: 'bg-[#E06D3B]/10 text-[#E06D3B] border-[#E06D3B]/20',
    },
    {
      label: 'AI Tutor',
      href: `/courses/${courseId}/tutor`,
      icon: BotMessageSquare,
      badge: 'Grounding',
    },
    {
      label: 'Adaptive Quiz',
      href: `/courses/${courseId}/quiz/new`,
      icon: HelpCircle,
      badge: null,
    },
    {
      label: 'Knowledge Map',
      href: `/courses/${courseId}/map`,
      icon: Network,
      badge: 'Graph',
    },
    {
      label: 'Study Plan',
      href: `/courses/${courseId}/plan`,
      icon: CalendarCheck,
      badge: null,
    },
    {
      label: 'Misconceptions',
      href: `/courses/${courseId}/misconceptions`,
      icon: AlertOctagon,
      badge: activeMisconceptions > 0 ? `${activeMisconceptions} active` : null,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
    {
      label: 'Course Certificate',
      href: `/courses/${courseId}/certificate`,
      icon: Award,
      badge: 'Certificate',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      label: 'Evaluation & Metrics',
      href: `/courses/${courseId}/evaluation`,
      icon: BarChart3,
      badge: 'RAGAS',
    },
  ];

  const secondaryItems = [
    {
      label: 'Discover Courses',
      href: '/discover',
      icon: Compass,
    },
    {
      label: 'Upload Materials',
      href: `/courses/${courseId}/upload`,
      icon: UploadCloud,
    },
    {
      label: 'Processing Status',
      href: `/courses/${courseId}/status`,
      icon: FileCheck2,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0C0D0E] text-[#F6F5EE] border-r border-[#1D2024] flex flex-col transition-all duration-300 ease-in-out ${
          isMobile
            ? isMobileOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full w-64'
            : isCollapsed
            ? 'w-16 translate-x-0'
            : 'w-64 translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div
          className={`h-16 flex items-center border-b border-[#1D2024] shrink-0 transition-all ${
            isCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          {isCollapsed && !isMobile ? (
            <Logo href="/courses" variant="icon" size="md" priority />
          ) : (
            <Logo href="/courses" size="md" priority />
          )}
        </div>

        {/* Global Enrolled Courses Button */}
        <div className={`pt-3 shrink-0 ${isCollapsed && !isMobile ? 'px-2' : 'px-3'}`}>
          <Link
            href="/courses"
            onClick={handleClose}
            title="My Enrolled Courses"
            className={`flex items-center rounded-xl bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] text-[#F6F5EE] shadow-xs transition-all active:scale-98 group ${
              isCollapsed && !isMobile
                ? 'justify-center p-2.5'
                : 'justify-between px-3 py-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-[#E06D3B] group-hover:rotate-12 transition-transform shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="text-xs font-bold tracking-tight truncate">My Enrolled Courses</span>
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <ChevronRight className="w-3.5 h-3.5 text-[#C8C6B9] group-hover:translate-x-0.5 transition-transform shrink-0" />
            )}
          </Link>
        </div>

        {/* Current Course Snippet Card with Switcher */}
        {(!isCollapsed || isMobile) ? (
          <div className="p-3.5 mx-3 my-2.5 rounded-xl bg-[#141619] border border-[#1D2024]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D3B] font-mono">
                Active Course
              </span>
              <Link
                href="/courses"
                onClick={handleClose}
                className="text-[10px] font-semibold text-[#C8C6B9] hover:text-[#E06D3B] transition-colors"
                title="View all enrolled courses"
              >
                Switch Course ⇄
              </Link>
            </div>
            <div className="font-bold text-xs text-[#F6F5EE] truncate" title={courseName}>
              {courseName}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1D2024] text-[11px]">
              <span className="text-[#7E8078]">Mastery</span>
              <span className="font-bold font-mono text-[#E06D3B]">
                {overallMastery}%
              </span>
            </div>
          </div>
        ) : (
          <div className="my-2 px-2 flex justify-center">
            <Link
              href="/courses"
              onClick={handleClose}
              title={`Active: ${courseName} (${overallMastery}% Mastery)`}
              className="w-10 h-10 rounded-xl bg-[#141619] border border-[#1D2024] flex items-center justify-center font-mono font-bold text-xs text-[#E06D3B] hover:border-[#E06D3B]/40 transition-colors"
            >
              {overallMastery}%
            </Link>
          </div>
        )}

        {/* Navigation list */}
        <div className={`flex-1 overflow-y-auto py-2 space-y-1 ${isCollapsed && !isMobile ? 'px-2' : 'px-3'}`}>
          {(!isCollapsed || isMobile) && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7E8078] font-mono">
              Learning Modules
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href.includes('/quiz/') && pathname.includes('/quiz'));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                title={isCollapsed && !isMobile ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all group ${
                  isCollapsed && !isMobile
                    ? 'justify-center p-2.5'
                    : 'justify-between px-3 py-2'
                } ${
                  isActive
                    ? 'bg-[#E06D3B] text-black shadow-xs font-bold'
                    : 'text-[#C8C6B9] hover:text-[#F6F5EE] hover:bg-[#141619]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-[#7E8078] group-hover:text-[#F6F5EE]'}`} />
                  {(!isCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
                </div>
                {(!isCollapsed || isMobile) && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono border shrink-0 ${
                      isActive
                        ? 'bg-black/20 text-black border-black/20'
                        : 'bg-[#141619] text-[#C8C6B9] border-[#1D2024]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3">
            {(!isCollapsed || isMobile) && (
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7E8078] font-mono">
                Course Pipeline
              </div>
            )}
          </div>

          {secondaryItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                title={isCollapsed && !isMobile ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all group ${
                  isCollapsed && !isMobile
                    ? 'justify-center p-2.5'
                    : 'gap-3 px-3 py-2'
                } ${
                  isActive
                    ? 'bg-[#1A1D21] text-[#E06D3B] font-bold border border-[#1D2024]'
                    : 'text-[#7E8078] hover:text-[#F6F5EE] hover:bg-[#141619]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E06D3B]' : 'text-[#7E8078] group-hover:text-[#F6F5EE]'}`} />
                {(!isCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          className={`border-t border-[#1D2024] flex items-center text-xs text-[#7E8078] shrink-0 ${
            isCollapsed && !isMobile
              ? 'p-2.5 justify-center'
              : 'p-4 justify-between'
          }`}
        >
          {isCollapsed && !isMobile ? (
            <Link
              href="/courses/new"
              title="Create New Course"
              className="text-[#E06D3B] hover:text-[#FF9457] font-bold text-sm"
            >
              +
            </Link>
          ) : (
            <>
              <span className="font-mono text-[11px]">v1.0 • Bayesian Core</span>
              <Link href="/courses/new" className="text-[#E06D3B] hover:text-[#FF9457] font-semibold">
                + New Course
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
