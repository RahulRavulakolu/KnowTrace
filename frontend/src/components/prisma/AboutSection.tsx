'use client';

import React from 'react';
import WordsPullUpMultiStyle, { TextSegment } from './WordsPullUpMultiStyle';
import ScrollRevealText from './ScrollRevealText';

const ABOUT_SEGMENTS: TextSegment[] = [
  {
    text: "Don't just watch lectures,",
    className: 'font-normal',
  },
  {
    text: 'understand every concept.',
    className: 'italic font-serif font-normal',
  },
  {
    text: 'Every explanation is cited, verified, and mapped directly to your course syllabus.',
    className: 'font-normal',
  },
];

const BODY_PARAGRAPH =
  'Passive viewing creates undetected knowledge gaps. KnowTrace bridges the distance between watching lectures and genuine mastery: our dual-engine tutor diagnoses exact student misconceptions, anchors every answer to slides and video timestamps from MIT and NPTEL, and dynamically adapts your revision schedule to your pace.';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="bg-black py-24 sm:py-32 md:py-40 px-4 md:px-6">
      {/* Centered Inner Card */}
      <div className="bg-[#101010] rounded-2xl md:rounded-[2.5rem] p-8 sm:p-14 md:p-20 lg:p-24 text-center max-w-6xl mx-auto border border-white/5 shadow-2xl">
        {/* Top Label */}
        <div className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-6 sm:mb-8 font-medium">
          Adaptive Intelligence
        </div>

        {/* Main Heading with 3 Styled Segments */}
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] tracking-tight">
          <WordsPullUpMultiStyle
            segments={ABOUT_SEGMENTS}
            className="text-center"
          />
        </div>

        {/* Scroll-Linked Body Reveal */}
        <div className="max-w-2xl mx-auto mt-12 sm:mt-16 md:mt-20">
          <ScrollRevealText text={BODY_PARAGRAPH} />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
