'use client';

import React from 'react';
import { SourceViewer } from './SourceViewer';
import { Citation } from '@/types';
import { SOURCE_DOCUMENTS } from '@/lib/mockData';
import { X } from 'lucide-react';

interface SourceViewerModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export function SourceViewerModal({ citation, onClose }: SourceViewerModalProps) {
  if (!citation) return null;

  const doc = SOURCE_DOCUMENTS[citation.sourceId] || {
    id: citation.sourceId,
    courseId: 'cs229-ml',
    title: citation.sourceTitle,
    type: citation.sourceType,
    fileSize: 'Unknown',
    totalPages: 48,
    pagesContent: [
      {
        pageNumber: citation.pageNumber || 1,
        heading: citation.sourceTitle,
        text: citation.snippet,
        highlightSnippet: citation.snippet,
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#141619] rounded-2xl shadow-2xl overflow-hidden border border-[#1D2024] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-[#0C0D0E] hover:bg-[#1D2024] text-[#C8C6B9] hover:text-[#F6F5EE] border border-[#1D2024] transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <SourceViewer
            document={doc}
            initialPage={citation.pageNumber}
            initialSlide={citation.slideNumber}
            initialTime={citation.timestamp}
            highlightSnippet={citation.snippet}
            onClose={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
}
