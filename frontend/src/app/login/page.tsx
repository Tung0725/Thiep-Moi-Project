'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BrandLogo from '@/components/common/BrandLogo';
import AuthLeftBanner from '@/components/auth/AuthLeftBanner';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-gradient-to-br from-[#FFF2F5] via-[#FCF9F7] to-[#FDE8ED] dark:from-[#0b0d13] dark:via-[#0f1117] dark:to-[#1a0e14] text-on-surface dark:text-slate-100 font-sans antialiased flex flex-col justify-between relative selection:bg-primary-fixed selection:text-primary transition-colors duration-300">
      {/* Decorative Background Ambient Glows (Contained to prevent scrollbars) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 dark:bg-rose-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-fixed/25 dark:bg-amber-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-pink-200/25 dark:bg-rose-950/20 rounded-full blur-2xl"></div>
      </div>

      {/* Header Navigation Ribbon */}
      <header className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between relative z-10 shrink-0">
        <BrandLogo size="md" showTagline={true} />

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Palette Switcher */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label="Toggle theme palette"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-[#191c28] border border-pink-100 dark:border-[#2d3142] text-on-surface-variant hover:text-primary transition-colors shadow-sm cursor-pointer"
          >
            {theme === 'dark' ? (
              <span className="material-symbols-outlined text-[16px] text-amber-400">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[16px] text-primary">dark_mode</span>
            )}
          </button>

          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-rose-400 hover:text-on-primary-fixed-variant dark:hover:text-rose-300 transition px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/60 border border-pink-100 dark:border-slate-800 hover:border-rose-500/40 shadow-sm"
            href="/#kho-thiep"
          >
            <span>Khám phá mẫu thiệp</span>
            <span className="material-symbols-outlined text-[0.95rem]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Main Center Container (Desktop 2-Column Balanced Card with Consistent Height) */}
      <main className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-1 sm:py-2 flex-grow flex items-center justify-center relative z-10 min-h-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(185,5,56,0.12)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(244,63,94,0.08)] border border-pink-100/80 dark:border-[#2b2f42] bg-white dark:bg-[#161824] transition-colors max-h-full lg:min-h-[550px]">
          {/* Left Column: Brand Showcase */}
          <AuthLeftBanner />

          {/* Right Column: Interactive Dual Auth Portal */}
          <div className="lg:col-span-7 p-6 sm:p-7 lg:px-9 lg:py-6 flex flex-col justify-center bg-white dark:bg-[#161824] relative transition-colors overflow-y-auto max-h-[88vh] lg:max-h-none no-scrollbar h-full">
            <div key={authMode} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {authMode === 'login' ? (
                <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Global Page Footer */}
      <footer className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2 text-center text-xs text-outline/80 dark:text-slate-500 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-1 shrink-0">
        <p>© 2026 loiyeuthuong.vn. Nền tảng thiệp cưới điện tử tinh tế.</p>
        <div className="flex items-center gap-3 text-secondary dark:text-slate-400">
          <Link className="hover:text-primary transition" href="/#huong-dan">
            Hướng dẫn
          </Link>
          <span>•</span>
          <Link className="hover:text-primary transition" href="/#bang-gia">
            Bảng giá
          </Link>
          <span>•</span>
          <a className="hover:text-primary transition" href="#">
            Bảo mật
          </a>
        </div>
      </footer>
    </div>
  );
}

/**
 * LoginPage Component
 * Purpose: Cổng xác thực chính của hệ thống loiyeuthuong.vn, bao bọc trong Suspense để hỗ trợ Next.js useSearchParams an toàn.
 * Props: Không yêu cầu props.
 * Key States: Được quản lý bên trong LoginContent.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0f1117]">
          <span className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
