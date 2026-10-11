'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/5 py-16 px-4 md:px-8 text-[#E1E0CC] select-none">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Minimal Final Call to Action */}
        <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] p-8 sm:p-12 md:p-16 text-center border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-[0.1] pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium tracking-tight mb-4 text-[#E1E0CC]">
            Know what you know. Fix what you don&apos;t.
          </h2>
          <p
            className="text-primary/70 text-xs sm:text-sm md:text-base max-w-xl mx-auto mb-8 font-light"
            style={{ color: 'rgba(225, 224, 204, 0.7)' }}
          >
            Turn passive lecture videos into active, verifiable mastery with grounded AI tutoring.
          </p>
          <Link
            href="/courses"
            className="bg-primary rounded-full px-7 py-3.5 inline-flex items-center gap-3 group transition-all duration-300 hover:gap-4 text-black font-medium text-sm sm:text-base shadow-xl cursor-pointer"
            style={{ backgroundColor: '#DEDBC8' }}
          >
            <span>Start Learning</span>
            <span className="bg-black rounded-full w-8 h-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className="w-4 h-4 text-[#E1E0CC]" />
            </span>
          </Link>
        </div>

        {/* Footer Navigation Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5 text-xs text-gray-400">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#E1E0CC] mb-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>KnowTrace</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Source-grounded AI tutoring for university course materials.
            </p>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#E1E0CC] uppercase tracking-wider mb-3">
              Platform
            </span>
            <ul className="space-y-2">
              <li><Link href="/courses" className="hover:text-[#E1E0CC] transition-colors">Courses Workspace</Link></li>
              <li><Link href="/discover" className="hover:text-[#E1E0CC] transition-colors">Course Catalogs</Link></li>
              <li><a href="#about" className="hover:text-[#E1E0CC] transition-colors">Adaptive Tutor</a></li>
              <li><a href="#features" className="hover:text-[#E1E0CC] transition-colors">Source Provenance</a></li>
            </ul>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#E1E0CC] uppercase tracking-wider mb-3">
              Supported Sources
            </span>
            <ul className="space-y-2">
              <li><span className="text-gray-400">NPTEL (IITs & IISc)</span></li>
              <li><span className="text-gray-400">MIT OpenCourseWare</span></li>
              <li><span className="text-gray-400">Lecture PDFs & Slides</span></li>
              <li><span className="text-gray-400">Video Transcripts</span></li>
            </ul>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#E1E0CC] uppercase tracking-wider mb-3">
              Resources
            </span>
            <ul className="space-y-2">
              <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-[#E1E0CC] transition-colors">API Documentation</a></li>
              <li>
                <a href="https://github.com/RahulRavulakolu/KnowTrace" target="_blank" rel="noreferrer" className="hover:text-[#E1E0CC] transition-colors inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              </li>
              <li><span className="text-gray-500 text-[11px]">© 2026 KnowTrace AI. All rights reserved.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
