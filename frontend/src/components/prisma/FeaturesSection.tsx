'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import WordsPullUpMultiStyle, { TextSegment } from './WordsPullUpMultiStyle';

const HEADER_LINE_1: TextSegment[] = [
  {
    text: 'Studio-grade workflows for university learning.',
    className: 'text-primary',
  },
];

const HEADER_LINE_2: TextSegment[] = [
  {
    text: 'Built on real course materials. Grounded in truth.',
    className: 'text-gray-500',
  },
];

export const FeaturesSection: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-100px' });

  return (
    <section id="features" className="min-h-screen bg-black py-24 sm:py-32 px-4 md:px-8 relative overflow-hidden select-none">
      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2 relative z-10">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal">
          <WordsPullUpMultiStyle
            segments={HEADER_LINE_1}
            className="text-center"
          />
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal">
          <WordsPullUpMultiStyle
            segments={HEADER_LINE_2}
            className="text-center"
          />
        </div>
      </div>

      {/* 4-Column Card Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px] max-w-7xl mx-auto mt-14 sm:mt-16 relative z-10"
      >
        {/* Card 1 — Video Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.7,
            delay: 0 * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative rounded-2xl overflow-hidden h-[360px] sm:h-[400px] lg:h-full flex flex-col justify-end p-6 border border-white/5 group shadow-lg"
        >
          <video
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
          <p
            className="text-xl font-medium relative z-10 tracking-tight"
            style={{ color: '#E1E0CC' }}
          >
            Your learning canvas.
          </p>
        </motion.div>

        {/* Card 2 — Source Provenance (01) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.7,
            delay: 1 * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="bg-[#212121] rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-[360px] sm:h-[400px] lg:h-full border border-white/5 shadow-lg"
        >
          <div>
            {/* Top Icon & Number */}
            <div className="flex items-start justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85"
                alt="Source Provenance Icon"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
              />
              <span className="text-xs text-gray-500 font-mono tracking-wider">
                (01)
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-medium mt-4 mb-4 tracking-tight"
              style={{ color: '#E1E0CC' }}
            >
              Source Provenance.
            </h3>

            {/* 4 Checklist Items */}
            <ul className="space-y-2.5">
              {[
                'Every answer linked to slides & timestamps',
                'Dual-LLM verification eliminates hallucinations',
                'Multi-modal support for PDFs, PPTXs & videos',
                'Interactive document viewer with inline citations',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-xs sm:text-sm leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn More Link */}
          <div className="pt-4 border-t border-white/5">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs tracking-wide transition-colors duration-200 group/link cursor-pointer"
              style={{ color: '#E1E0CC' }}
            >
              <span className="group-hover/link:underline underline-offset-4">
                Explore sources
              </span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 -rotate-45 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Card 3 — Adaptive Mastery (02) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.7,
            delay: 2 * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="bg-[#212121] rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-[360px] sm:h-[400px] lg:h-full border border-white/5 shadow-lg"
        >
          <div>
            {/* Top Icon & Number */}
            <div className="flex items-start justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85"
                alt="Adaptive Mastery Icon"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
              />
              <span className="text-xs text-gray-500 font-mono tracking-wider">
                (02)
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-medium mt-4 mb-4 tracking-tight"
              style={{ color: '#E1E0CC' }}
            >
              Adaptive Mastery.
            </h3>

            {/* 3 Checklist Items */}
            <ul className="space-y-3">
              {[
                'Identifies conceptual misconceptions on error',
                'Dynamic quiz difficulty calibrated in real time',
                'Targeted remediation drills for prerequisite gaps',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-xs sm:text-sm leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn More Link */}
          <div className="pt-4 border-t border-white/5">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs tracking-wide transition-colors duration-200 group/link cursor-pointer"
              style={{ color: '#E1E0CC' }}
            >
              <span className="group-hover/link:underline underline-offset-4">
                Explore tutor
              </span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 -rotate-45 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Card 4 — Real Course Hub (03) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.7,
            delay: 3 * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="bg-[#212121] rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-[360px] sm:h-[400px] lg:h-full border border-white/5 shadow-lg"
        >
          <div>
            {/* Top Icon & Number */}
            <div className="flex items-start justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85"
                alt="Real Course Hub Icon"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
              />
              <span className="text-xs text-gray-500 font-mono tracking-wider">
                (03)
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-medium mt-4 mb-4 tracking-tight"
              style={{ color: '#E1E0CC' }}
            >
              Real Course Hub.
            </h3>

            {/* 3 Checklist Items */}
            <ul className="space-y-3">
              {[
                'Ingests official NPTEL & MIT OpenCourseWare catalogs',
                'Instant extraction of knowledge graph & concept map',
                'Personalized revision plan paced to your exam date',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-xs sm:text-sm leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn More Link */}
          <div className="pt-4 border-t border-white/5">
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 text-xs tracking-wide transition-colors duration-200 group/link cursor-pointer"
              style={{ color: '#E1E0CC' }}
            >
              <span className="group-hover/link:underline underline-offset-4">
                Browse catalog
              </span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 -rotate-45 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
