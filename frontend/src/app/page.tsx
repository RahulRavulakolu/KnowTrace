'use client';

import React from 'react';
import HeroSection from '@/components/prisma/HeroSection';
import AboutSection from '@/components/prisma/AboutSection';
import FeaturesSection from '@/components/prisma/FeaturesSection';
import FooterSection from '@/components/prisma/FooterSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-[#E1E0CC] selection:bg-[#DEDBC8] selection:text-black">
      {/* SECTION 1: HERO */}
      <HeroSection />

      {/* SECTION 2: ABOUT / PROBLEM & SOLUTION */}
      <AboutSection />

      {/* SECTION 3: FEATURES / PROVENANCE WORKFLOWS */}
      <FeaturesSection />

      {/* SECTION 4: FINAL CTA & COMPACT FOOTER */}
      <FooterSection />
    </main>
  );
}
