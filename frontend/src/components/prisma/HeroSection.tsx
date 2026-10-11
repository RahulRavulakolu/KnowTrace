'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import WordsPullUp from './WordsPullUp';

const NAV_ITEMS = [
  { label: 'Courses', href: '/courses' },
  { label: 'Discover', href: '/discover' },
  { label: 'Adaptive Tutor', href: '#about' },
  { label: 'Provenance', href: '#features' },
  { label: 'Workspace', href: '/courses' },
];

export const HeroSection: React.FC = () => {
  const [activeItem, setActiveItem] = useState('Courses');

  return (
    <section className="relative w-full h-screen p-4 md:p-6 bg-black select-none">
      {/* Inset Main Container */}
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-black">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Noise Overlay */}
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Navbar */}
        <header className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
          <nav className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8 border-b border-x border-white/5 shadow-2xl">
            <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
              {NAV_ITEMS.map((item) => {
                const isActive = activeItem === item.label;
                const linkStyle = {
                  color: isActive ? '#E1E0CC' : 'rgba(225, 224, 204, 0.8)',
                };
                const linkClass =
                  'text-[10px] sm:text-xs md:text-sm tracking-wide transition-colors duration-200 hover:!text-[#E1E0CC]';

                return (
                  <li key={item.label}>
                    {item.href.startsWith('#') ? (
                      <a
                        href={item.href}
                        onClick={() => setActiveItem(item.label)}
                        style={linkStyle}
                        className={linkClass}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setActiveItem(item.label)}
                        style={linkStyle}
                        className={linkClass}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>

        {/* Hero Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-8 md:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Left 8 columns: Giant Heading "KnowTrace*" */}
            <div className="lg:col-span-8 overflow-visible">
              <WordsPullUp
                text="KnowTrace"
                showAsterisk={true}
                className="text-[13vw] sm:text-[11vw] md:text-[9.5vw] lg:text-[7.8vw] xl:text-[7.5vw] 2xl:text-[8vw] font-medium leading-[0.85] tracking-[-0.07em] whitespace-nowrap"
              />
            </div>

            {/* Right 4 columns: Description Paragraph & Action Buttons */}
            <div className="lg:col-span-4 flex flex-col justify-end pb-1 sm:pb-3 md:pb-4 lg:pb-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mb-2"
              >
                <p className="text-sm sm:text-base font-medium text-[#E1E0CC] tracking-tight">
                  Don&apos;t just watch lectures. Understand them.
                </p>
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-primary/70 text-xs sm:text-sm md:text-base leading-[1.2] max-w-md"
                style={{ color: 'rgba(225, 224, 204, 0.7)' }}
              >
                KnowTrace converts university course materials into personalized tutoring, adaptive quizzes, and evidence-backed explanations strictly grounded in source lectures.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3"
              >
                {/* Primary CTA */}
                <Link
                  href="/courses"
                  className="bg-primary rounded-full pl-5 pr-2 py-2 sm:pl-6 sm:pr-2.5 sm:py-2.5 inline-flex items-center gap-2 group transition-all duration-300 hover:gap-3 text-black font-medium text-sm sm:text-base cursor-pointer shadow-lg"
                  style={{ backgroundColor: '#DEDBC8' }}
                >
                  <span className="text-black font-medium">Start Learning</span>
                  <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 text-[#E1E0CC]" />
                  </span>
                </Link>

                {/* Secondary CTA */}
                <Link
                  href="/discover"
                  className="rounded-full px-5 py-2.5 sm:px-6 sm:py-3 inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-xs sm:text-sm font-medium transition-colors duration-200"
                  style={{ color: '#E1E0CC' }}
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Courses</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
