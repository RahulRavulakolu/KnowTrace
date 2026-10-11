import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import WordsPullUp from './WordsPullUp';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Adaptive Tutor', href: '#about' },
  { label: 'Provenance', href: '#features' },
];

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Adaptive Tutor');

  const handleStartLearning = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/courses');
    } else {
      openAuthModal('register');
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

        {/* Floating Brand Navbar */}
        <header className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-3 sm:px-6 pt-3 sm:pt-6">
          <nav className="bg-black/80 backdrop-blur-2xl rounded-full px-3.5 sm:px-6 py-2 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Image
                src="/logo-icon.png"
                alt="KnowTrace"
                width={28}
                height={28}
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#EDEDE8] group-hover:text-white">
                KnowTrace
              </span>
            </Link>

            <ul className="flex items-center gap-1 sm:gap-3 md:gap-5">
              {NAV_ITEMS.map((item) => {
                const isActive = activeItem === item.label;
                const linkClass = `text-[10px] sm:text-xs md:text-sm tracking-wide transition-all duration-200 px-2 sm:px-3 py-1 rounded-full ${isActive
                  ? 'text-[#EDEDE8] bg-white/10 font-semibold shadow-xs'
                  : 'text-[#E1E0CC]/70 hover:text-[#EDEDE8] hover:bg-white/5'
                  }`;

                return (
                  <li key={item.label}>
                    {item.href.startsWith('#') ? (
                      <a
                        href={item.href}
                        onClick={() => setActiveItem(item.label)}
                        className={linkClass}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setActiveItem(item.label)}
                        className={linkClass}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Auth Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-white/10 shrink-0">
              {user ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] sm:text-xs text-indigo-300 font-medium hidden sm:inline-block max-w-[100px] truncate"
                    title={user.email}
                  >
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-[10px] sm:text-xs text-[#E1E0CC]/70 hover:text-rose-400 px-2 sm:px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="text-[10px] sm:text-xs text-[#E1E0CC]/80 hover:text-white px-2 sm:px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors font-medium cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="text-[10px] sm:text-xs bg-[#DEDBC8] hover:bg-white text-black font-semibold px-2.5 sm:px-3 py-1 rounded-full transition-all shadow-[0_0_15px_rgba(222,219,200,0.2)] cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
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
                <button
                  type="button"
                  onClick={handleStartLearning}
                  className="bg-primary rounded-full pl-5 pr-2 py-2 sm:pl-6 sm:pr-2.5 sm:py-2.5 inline-flex items-center gap-2 group transition-all duration-300 hover:gap-3 text-black font-semibold text-sm sm:text-base cursor-pointer shadow-[0_0_30px_rgba(222,219,200,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.4)]"
                  style={{ backgroundColor: '#DEDBC8' }}
                >
                  <span className="text-black font-semibold">Start Learning</span>
                  <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 text-[#DEDBC8]" />
                  </span>
                </button>

                {/* Secondary CTA */}
                <Link
                  href="/discover"
                  className="rounded-full px-5 py-2.5 sm:px-6 sm:py-3 inline-flex items-center gap-2 border border-white/20 hover:border-indigo-400/60 hover:bg-indigo-950/30 text-xs sm:text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                  style={{ color: '#E1E0CC' }}
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
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
