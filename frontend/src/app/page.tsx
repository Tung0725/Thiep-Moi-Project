'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TemplateShowcaseSection from '@/components/landing/TemplateShowcaseSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CtaBanner from '@/components/landing/CtaBanner';
import FooterSection from '@/components/landing/FooterSection';
import { ScrollReveal } from '@/components/common/ScrollReveal';

/**
 * LandingPage Component
 * Purpose: Trang chủ Landing Page chuẩn Next.js của dự án loiyeuthuong.vn, bố cục cân đối và thanh lịch.
 * Props: Không yêu cầu props bên ngoài.
 * Key States:
 *  - theme: Chế độ màu sắc ('light' | 'dark'), đồng bộ với class "dark" trên thẻ html.
 */
export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const rootElement = document.documentElement;
    if (theme === 'dark') {
      rootElement.classList.add('dark');
    } else {
      rootElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-[#0f1117] text-[#2d2d2d] dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Navigation Bar (68px) */}
      <Navbar currentTheme={theme} onToggleTheme={handleToggleTheme} />

      {/* Main Landing Sections */}
      <main className="w-full pt-[68px]">
        {/* 1. Hero Section with Clear 2-Line Headline & Interactive Mockup */}
        <HeroSection />

        {/* 2. Featured Template Showcase (Immediate Product Exposure) */}
        <ScrollReveal>
          <TemplateShowcaseSection />
        </ScrollReveal>

        {/* 3. Simple 3 Steps How It Works */}
        <ScrollReveal>
          <HowItWorksSection />
        </ScrollReveal>

        {/* 4. Core Features & Advantages */}
        <ScrollReveal>
          <FeaturesSection />
        </ScrollReveal>

        {/* 5. Transparent Pricing Tiers */}
        <ScrollReveal>
          <PricingSection />
        </ScrollReveal>

        {/* 6. Real Couples Testimonials */}
        <ScrollReveal>
          <TestimonialsSection />
        </ScrollReveal>

        {/* 7. Final Call To Action Banner */}
        <ScrollReveal>
          <CtaBanner />
        </ScrollReveal>
      </main>

      {/* Footer Navigation & Contact Support */}
      <FooterSection />
    </div>
  );
}
