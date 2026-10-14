'use client';

import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SourceViewerModal } from './SourceViewerModal';
import { SidebarProvider, useSidebar } from './ui/sidebar';
import { Citation, Course } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Create a context so any nested page/component can open the citation modal easily
interface CitationViewerContextType {
  openCitation: (citation: Citation) => void;
  closeCitation: () => void;
}

export const CitationViewerContext = createContext<CitationViewerContextType>({
  openCitation: () => {},
  closeCitation: () => {},
});

export const useCitationViewer = () => useContext(CitationViewerContext);

interface AppShellProps {
  courseId: string;
  title?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

function AppShellInner({ courseId, title, fullWidth = false, children }: AppShellProps) {
  const { open } = useSidebar();
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const { data: course } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId),
  });

  const openCitation = (citation: Citation) => {
    setActiveCitation(citation);
  };

  const closeCitation = () => {
    setActiveCitation(null);
  };

  return (
    <CitationViewerContext.Provider value={{ openCitation, closeCitation }}>
      <div className="w-full flex-1 min-h-screen bg-[#0C0D0E] text-[#F6F5EE] flex flex-col print:bg-white print:p-0 selection:bg-[#E06D3B] selection:text-black">
        {/* Sidebar */}
        <div className="print:hidden">
          <Sidebar
            courseId={courseId}
            courseName={course?.name || 'CS 229 Machine Learning'}
            activeMisconceptions={course?.activeMisconceptionsCount ?? 2}
            overallMastery={course?.overallMastery ?? 64}
          />
        </div>

        {/* Main Content Area: smooth transition between full 16rem (pl-64) and mini-bar 4rem (pl-16) on desktop */}
        <div
          className={`flex-1 w-full flex flex-col min-w-0 min-h-screen print:min-h-0 print:pl-0 transition-all duration-300 ease-in-out ${
            open ? 'md:pl-64' : 'md:pl-16'
          }`}
        >
          <div className="print:hidden w-full">
            <Header
              courseId={courseId}
              courseName={course?.name || 'CS 229 Machine Learning'}
              title={title}
              activeMisconceptions={course?.activeMisconceptionsCount ?? 2}
            />
          </div>

          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 print:p-0 w-full transition-all duration-300 ${
              fullWidth
                ? 'max-w-none'
                : 'max-w-[1600px] mx-auto'
            }`}
          >
            {children}
          </main>
        </div>

        {/* Global Source Viewer Modal */}
        <SourceViewerModal citation={activeCitation} onClose={closeCitation} />
      </div>
    </CitationViewerContext.Provider>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppShellInner {...props} />
    </SidebarProvider>
  );
}
