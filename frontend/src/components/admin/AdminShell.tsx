'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  LogOut,
  MailOpen,
  Menu,
  MessageSquareHeart,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminShellProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Tổng quan',
    exact: true,
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: 'Người dùng',
    icon: Users,
  },
  {
    href: '/admin/templates',
    label: 'Mẫu thiệp',
    icon: Palette,
  },
  {
    href: '/admin/invitations',
    label: 'Thiệp mời',
    icon: MailOpen,
  },
  {
    href: '/admin/wishes',
    label: 'Lời chúc & RSVP',
    icon: MessageSquareHeart,
  },
];

const THEME_STORAGE_KEY = 'admin_theme';

function getActiveSection(pathname: string): NavItem {
  return (
    ADMIN_NAV_ITEMS.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    ) ?? ADMIN_NAV_ITEMS[0]
  );
}

/**
 * AdminShell Component
 * Purpose: Khung giao diện quản trị gồm Sidebar 5 phân hệ, Header tinh gọn, lối tắt Trang chủ / Studio ở Sidebar, đổi theme Light/Dark lưu localStorage và Mobile Drawer.
 * Props:
 *  - children: Nội dung chính của từng trang quản trị.
 * Key States:
 *  - isMobileNavOpen: Trạng thái đóng/mở sidebar trên màn hình nhỏ.
 *  - theme: Chế độ giao diện sáng / tối đồng bộ với thẻ html và localStorage.
 */
export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const activeSection = getActiveSection(pathname || '/admin');

  const renderNavLinks = () => (
    <nav aria-label="Điều hướng quản trị" className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : Boolean(pathname?.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-mh-primary to-[#ff4b72] text-white shadow-md shadow-mh-primary/20'
                : 'text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-[#1f2536] hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <Icon
              className={`w-[18px] h-[18px] shrink-0 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400'
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = () => (
    <div className="p-3 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
      <Link
        href="/editor/studio"
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-[#1e2433] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-[#252d40] dark:hover:text-rose-400 transition"
      >
        <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        <span>Mở Studio thiết kế</span>
      </Link>
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1f2536] transition"
      >
        <Home className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
        <span>Về trang chủ</span>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1017] text-slate-900 dark:text-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-[#171b26] border-r border-slate-200 dark:border-slate-700/80 z-30">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <BrandLogo size="sm" showTagline={false} href="/admin" />
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40">
            Admin
          </span>
        </div>

        {/* Sidebar Navigation Items */}
        {renderNavLinks()}

        {/* Sidebar Quick Links Footer */}
        {renderSidebarFooter()}
      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-white dark:bg-[#171b26] border-r border-slate-200 dark:border-slate-700/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
              <BrandLogo size="sm" showTagline={false} href="/admin" />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Đóng menu"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f2536] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavLinks()}
            {renderSidebarFooter()}
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Admin Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#171b26]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/80 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Mobile Trigger & Active Section Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Mở menu quản trị"
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1f2536] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white truncate">
              {activeSection.label}
            </h1>
          </div>

          {/* Right: Theme Toggle, Admin Name & Logout */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label="Đổi giao diện sáng/tối"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#1e2433] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin Identity */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2.5 border-l border-slate-200 dark:border-slate-700/80">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-mh-primary to-[#ff6b8a] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[160px]">
                {user?.fullName || 'Quản trị viên'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Active Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
