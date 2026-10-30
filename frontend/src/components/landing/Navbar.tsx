'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import BrandLogo from '@/components/common/BrandLogo';

interface NavbarProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

/**
 * Navbar Component
 * Purpose: Header điều hướng cố định chuẩn 68px lấy cảm hứng từ sự cân đối của meHappy.
 * Props:
 *  - currentTheme: Chế độ giao diện ('light' | 'dark').
 *  - onToggleTheme: Hàm callback đổi theme sáng / tối.
 * Key States:
 *  - currentLanguage: Ngôn ngữ hiển thị ('VN' | 'EN').
 *  - isMobileMenuOpen: Trạng thái mở menu điều hướng trên thiết bị di động.
 *  - isUserMenuOpen: Trạng thái mở menu tài khoản người dùng.
 */
export default function Navbar({ currentTheme, onToggleTheme }: NavbarProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'VN' | 'EN'>('VN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white/95 dark:bg-[#11131c]/95 backdrop-blur-md border-b border-[#eeeeee] dark:border-[#242838] transition-colors duration-200">
      <div className="h-full max-w-[1240px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo Section */}
        <BrandLogo size="md" showTagline={true} />

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-7">
          <a
            className="text-[14px] font-medium text-[#2d2d2d] dark:text-slate-200 hover:text-mh-primary transition-colors whitespace-nowrap"
            href="#kho-thiep"
          >
            Kho thiệp mẫu
          </a>
          <a
            className="text-[14px] font-medium text-[#2d2d2d] dark:text-slate-200 hover:text-mh-primary transition-colors whitespace-nowrap"
            href="#quy-trinh"
          >
            Cách tạo thiệp
          </a>
          <a
            className="text-[14px] font-medium text-[#2d2d2d] dark:text-slate-200 hover:text-mh-primary transition-colors whitespace-nowrap"
            href="#bang-gia"
          >
            Bảng giá
          </a>
          <a
            className="text-[14px] font-medium text-[#2d2d2d] dark:text-slate-200 hover:text-mh-primary transition-colors whitespace-nowrap"
            href="#tien-ich"
          >
            Tiện ích
          </a>
          <a
            className="text-[14px] font-medium text-[#2d2d2d] dark:text-slate-200 hover:text-mh-primary transition-colors whitespace-nowrap"
            href="#cau-chuyen"
          >
            Cặp đôi
          </a>
        </nav>

        {/* Action Controls & Authentication */}
        <div className="flex items-center gap-2.5">
          {/* Studio Creator Quick Link */}
          <Link
            href="/editor/studio"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#161824] hover:border-mh-primary hover:text-mh-primary text-xs font-bold text-neutral-700 dark:text-neutral-200 transition shadow-sm"
            title="meHappy Studio - Sáng tạo & nhân bản mẫu thiệp"
          >
            <span className="material-symbols-outlined text-[15px] text-mh-primary">auto_fix_high</span>
            <span>Studio</span>
          </Link>

          {/* Language Selector */}
          <button
            type="button"
            aria-label="Chuyển đổi ngôn ngữ"
            onClick={() => setCurrentLanguage(currentLanguage === 'VN' ? 'EN' : 'VN')}
            className="hidden sm:flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold bg-[#f4f4f5] dark:bg-[#1a1d29] text-[#2d2d2d] dark:text-slate-200 hover:bg-[#e4e4e7] dark:hover:bg-[#252837] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#71717a]">language</span>
            <span>{currentLanguage}</span>
          </button>

          {/* Theme Palette Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme palette"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f4f4f5] dark:bg-[#1a1d29] text-[#2d2d2d] dark:text-slate-200 hover:text-mh-primary transition-colors"
          >
            {currentTheme === 'dark' ? (
              <span className="material-symbols-outlined text-[18px] text-amber-400">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[18px] text-[#ff2056]">dark_mode</span>
            )}
          </button>

          {/* User Auth Buttons or Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-[#1a1d29] transition cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2056] to-[#ff6b8a] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-[13px] font-bold text-[#2d2d2d] dark:text-slate-200 max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <span className="material-symbols-outlined text-[16px] text-neutral-400">arrow_drop_down</span>
              </button>

              {/* User Dropdown Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#161824] shadow-xl border border-neutral-100 dark:border-[#2b2f42] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-[#2b2f42]">
                    <p className="text-xs font-bold text-[#2d2d2d] dark:text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-[#71717a] dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/create"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#2d2d2d] dark:text-slate-200 hover:bg-[#fff0f3] dark:hover:bg-[#202334] hover:text-mh-primary transition"
                  >
                    <span className="material-symbols-outlined text-[16px] text-mh-primary">edit_document</span>
                    <span>Tạo thiệp mới</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Register Button */}
              <Link
                href="/login?mode=register"
                className="hidden md:inline-flex items-center justify-center border-[1.5px] border-mh-border dark:border-[#2d3142] bg-white dark:bg-transparent text-[#2d2d2d] dark:text-white px-5 py-2 text-[14px] font-semibold rounded-full hover:border-mh-primary hover:text-mh-primary transition-all whitespace-nowrap"
              >
                Đăng ký
              </Link>
              {/* Login Button */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-mh-primary text-white px-5 py-2 text-[14px] font-semibold rounded-full hover:bg-mh-primary-hover transition-all whitespace-nowrap shadow-sm hover:shadow"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full text-[#2d2d2d] dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-[#1a1d29]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#eeeeee] dark:border-[#242838] bg-white/98 dark:bg-[#11131c]/98 px-5 py-4 flex flex-col gap-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            className="py-2 text-[15px] font-medium text-[#2d2d2d] dark:text-slate-200 border-b border-neutral-100 dark:border-neutral-800"
            href="#kho-thiep"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Kho thiệp mẫu
          </a>
          <a
            className="py-2 text-[15px] font-medium text-[#2d2d2d] dark:text-slate-200 border-b border-neutral-100 dark:border-neutral-800"
            href="#quy-trinh"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Cách tạo thiệp
          </a>
          <a
            className="py-2 text-[15px] font-medium text-[#2d2d2d] dark:text-slate-200 border-b border-neutral-100 dark:border-neutral-800"
            href="#bang-gia"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Bảng giá
          </a>
          <a
            className="py-2 text-[15px] font-medium text-[#2d2d2d] dark:text-slate-200 border-b border-neutral-100 dark:border-neutral-800"
            href="#tien-ich"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tiện ích
          </a>
          <a
            className="py-2 text-[15px] font-medium text-[#2d2d2d] dark:text-slate-200"
            href="#cau-chuyen"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Cặp đôi &amp; Câu chuyện
          </a>

          <div className="pt-3 flex flex-col gap-2 border-t border-[#eeeeee] dark:border-[#242838]">
            {!isAuthenticated && (
              <div className="flex gap-2">
                <Link
                  href="/login?mode=register"
                  className="flex-1 text-center py-2.5 text-[14px] font-semibold border border-mh-border rounded-full text-[#2d2d2d] dark:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 text-[14px] font-semibold bg-mh-primary text-white rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
