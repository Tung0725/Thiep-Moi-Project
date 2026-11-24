'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, LogOut, ShieldOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard Component
 * Purpose: Bảo vệ toàn bộ tuyến đường /admin/**; tự động kiểm tra phiên đăng nhập, chuyển hướng về /login?redirect=<pathname> nếu chưa xác thực và hiển thị màn hình 403 nếu tài khoản không mang vai trò quản trị.
 * Props:
 *  - children: Nội dung trang quản trị được bảo vệ.
 * Key States:
 *  - user, isAuthenticated, isInitialized: Lấy từ useAuthStore.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      const target = pathname && pathname.startsWith('/') ? pathname : '/admin';
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  // Loading / Redirecting State
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#0d1017] px-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-rose-600 dark:text-rose-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {!isInitialized ? 'Đang xác thực quyền quản trị...' : 'Đang chuyển tới trang đăng nhập...'}
        </p>
      </div>
    );
  }

  // 403 Forbidden Screen for Non-Admin Users
  if (user?.role !== 'ROLE_ADMIN') {
    const handleSwitchAccount = async () => {
      await logout();
      const target = pathname && pathname.startsWith('/') ? pathname : '/admin';
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0d1017] px-4">
        {/* 403 Access Denied Card */}
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldOff className="w-8 h-8" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            403 · Không đủ quyền
          </p>
          <h1 className="mt-2 text-2xl font-display font-extrabold text-slate-900 dark:text-slate-50">
            Không có quyền truy cập
          </h1>
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Khu vực này chỉ dành cho quản trị viên hệ thống. Tài khoản{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-50">{user?.email}</span> hiện không có quyền truy cập.
          </p>

          {/* Recovery Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-mh-primary hover:bg-mh-primary-hover text-white text-sm font-semibold shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 text-sm font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đổi tài khoản</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
