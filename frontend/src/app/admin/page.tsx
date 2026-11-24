'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  MailOpen,
  MessageSquareHeart,
  Palette,
  RefreshCw,
  Users,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminDashboardStatsResponse } from '@/types/admin';
import StatusBadge from '@/components/admin/StatusBadge';

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * AdminDashboardPage Component
 * Purpose: Trang tổng quan quản trị hiển thị 4 nhóm chỉ số KPI cốt lõi (Users, Templates, Invitations, Wishes/RSVP) và 2 bảng hoạt động gần đây với độ tương phản cao và cỡ chữ rõ ràng.
 * Props: Không yêu cầu props.
 * Key States:
 *  - stats: Dữ liệu tổng hợp từ ADM-01.
 *  - isLoading: Trạng thái tải dữ liệu KPI.
 *  - errorMessage: Thông báo lỗi khi gọi API thất bại.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan hệ thống.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6">
      {/* Compact Refresh Action Bar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#171b26] text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-60 transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                Không thể tải số liệu tổng quan
              </h2>
              <p className="text-sm text-rose-800 dark:text-rose-200 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadStats()}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* KPI Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-5 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-14 w-full bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Users KPI Card */}
          <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Người dùng
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {stats.users.total.toLocaleString('vi-VN')}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-2 flex items-center justify-between gap-1">
                  <span className="text-slate-700 dark:text-slate-200">Hoạt động</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-200">{stats.users.active}</span>
                </div>
                <div className="rounded-lg bg-rose-50 dark:bg-rose-500/15 px-2.5 py-2 flex items-center justify-between gap-1">
                  <span className="text-slate-700 dark:text-slate-200">Đã khóa</span>
                  <span className="font-bold text-rose-700 dark:text-rose-200">{stats.users.locked}</span>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/15 px-2.5 py-2 flex items-center justify-between gap-1">
                  <span className="text-slate-700 dark:text-slate-200">Chờ duyệt</span>
                  <span className="font-bold text-amber-800 dark:text-amber-200">
                    {stats.users.pendingVerification}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-[#1e2433] px-2.5 py-2 flex items-center justify-between gap-1">
                  <span className="text-slate-700 dark:text-slate-200">Admin</span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{stats.users.admins}</span>
                </div>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 inline-flex items-center justify-between text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>Quản lý người dùng</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Templates KPI Card */}
          <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Mẫu thiệp
                </span>
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {stats.templates.total.toLocaleString('vi-VN')}
              </p>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-3 py-2">
                  <span className="text-slate-700 dark:text-slate-200">Hiển thị</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-200">
                    {stats.templates.published}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-500/15 px-2.5 py-2 flex items-center justify-between gap-1">
                    <span className="text-slate-700 dark:text-slate-200">Nháp</span>
                    <span className="font-bold text-amber-800 dark:text-amber-200">{stats.templates.draft}</span>
                  </div>
                  <div className="rounded-lg bg-slate-100 dark:bg-[#1e2433] px-2.5 py-2 flex items-center justify-between gap-1">
                    <span className="text-slate-700 dark:text-slate-200">Lưu trữ</span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">{stats.templates.archived}</span>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/admin/templates"
              className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 inline-flex items-center justify-between text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>Quản lý mẫu thiệp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Invitations KPI Card */}
          <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Thiệp mời
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <MailOpen className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {stats.invitations.total.toLocaleString('vi-VN')}
              </p>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-3 py-2">
                  <span className="text-slate-700 dark:text-slate-200">Công khai</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-200">
                    {stats.invitations.published}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-500/15 px-2.5 py-2 flex items-center justify-between gap-1">
                    <span className="text-slate-700 dark:text-slate-200">Nháp</span>
                    <span className="font-bold text-amber-800 dark:text-amber-200">{stats.invitations.draft}</span>
                  </div>
                  <div className="rounded-lg bg-slate-100 dark:bg-[#1e2433] px-2.5 py-2 flex items-center justify-between gap-1">
                    <span className="text-slate-700 dark:text-slate-200">Lưu trữ</span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">{stats.invitations.archived}</span>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/admin/invitations"
              className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 inline-flex items-center justify-between text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>Quản lý thiệp mời</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Wishes & RSVP KPI Card */}
          <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Lời chúc &amp; RSVP
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                  <MessageSquareHeart className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                  {stats.wishes.total.toLocaleString('vi-VN')}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {stats.wishes.totalExpectedGuests.toLocaleString('vi-VN')} khách dự kiến
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[13px]">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-2 py-2 text-center">
                  <p className="text-slate-700 dark:text-slate-200">Tham dự</p>
                  <p className="mt-0.5 font-bold text-emerald-700 dark:text-emerald-200">{stats.wishes.attending}</p>
                </div>
                <div className="rounded-lg bg-sky-50 dark:bg-sky-500/15 px-2 py-2 text-center">
                  <p className="text-slate-700 dark:text-slate-200">Chưa chắc</p>
                  <p className="mt-0.5 font-bold text-sky-700 dark:text-sky-200">{stats.wishes.maybe}</p>
                </div>
                <div className="rounded-lg bg-rose-50 dark:bg-rose-500/15 px-2 py-2 text-center">
                  <p className="text-slate-700 dark:text-slate-200">Từ chối</p>
                  <p className="mt-0.5 font-bold text-rose-700 dark:text-rose-200">{stats.wishes.declined}</p>
                </div>
              </div>
            </div>
            <Link
              href="/admin/wishes"
              className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 inline-flex items-center justify-between text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>Kiểm duyệt lời chúc</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Invitations Table */}
        <section className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Thiệp mời mới nhất</h2>
            <Link
              href="/admin/invitations"
              className="text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-5 space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-11 bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
                ))}
              </div>
            ) : !stats || stats.recentInvitations.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-600 dark:text-slate-300">
                Chưa có thiệp mời nào.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433] text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    <th className="py-3.5 px-4">Thiệp &amp; Đường dẫn</th>
                    <th className="py-3.5 px-4">Chủ thiệp</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Lời chúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                  {stats.recentInvitations.map((inv) => {
                    const coupleLabel =
                      inv.title ||
                      [inv.groomName, inv.brideName].filter(Boolean).join(' & ') ||
                      inv.slug;
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50 dark:hover:bg-[#1f2536] transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">
                            {coupleLabel}
                          </p>
                          <a
                            href={`/t/${inv.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[13px] font-mono text-rose-600 dark:text-rose-400 hover:underline mt-0.5"
                          >
                            <span>/t/{inv.slug}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.ownerEmail ? (
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-50 truncate max-w-[170px]">
                                {inv.ownerFullName || inv.ownerEmail}
                              </p>
                              <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                                {inv.ownerEmail}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-500 dark:text-slate-400">Khách vãng lai</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge category="contentStatus" value={inv.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/wishes?invitationId=${inv.id}`}
                            className="font-semibold text-slate-900 dark:text-slate-50 hover:text-rose-600 dark:hover:text-rose-400"
                          >
                            {inv.wishCount}
                          </Link>
                          <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {formatDateTime(inv.createdAt)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Recent Users Table */}
        <section className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Người dùng mới nhất</h2>
            <Link
              href="/admin/users"
              className="text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-5 space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-11 bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
                ))}
              </div>
            ) : !stats || stats.recentUsers.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-600 dark:text-slate-300">
                Chưa có người dùng nào.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433] text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    <th className="py-3.5 px-4">Người dùng</th>
                    <th className="py-3.5 px-4">Vai trò</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                  {stats.recentUsers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1f2536] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[180px]">
                          {item.fullName}
                        </p>
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                          {item.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge category="userRole" value={item.role} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge category="userStatus" value={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-[13px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <p>{formatDateTime(item.createdAt)}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.invitationCount} thiệp</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
