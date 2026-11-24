'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ExternalLink,
  Filter,
  Loader2,
  MessageSquareHeart,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminWishResponse } from '@/types/admin';
import { AttendanceStatus, PageResponse } from '@/types/api';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminToast, { useAdminToast } from '@/components/admin/AdminToast';

const PAGE_SIZE = 20;

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
 * AdminWishesContent Component
 * Purpose: Nội dung chính của trang kiểm duyệt lời chúc & RSVP (ADM-11, ADM-12), hỗ trợ đọc query ?invitationId=, tìm kiếm debounce, lọc trạng thái tham dự và xóa lời chúc spam.
 * Props: Không yêu cầu props.
 * Key States:
 *  - searchInput / debouncedSearch, attendanceFilter, page: Bộ lọc tìm kiếm.
 *  - pageData: Dữ liệu phân trang lời chúc.
 *  - deletingWish / isDeleting: Lời chúc đang chờ xác nhận xóa vĩnh viễn.
 */
function AdminWishesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawInvitationId = searchParams.get('invitationId');
  const invitationIdParam =
    rawInvitationId && /^\d+$/.test(rawInvitationId.trim()) ? Number(rawInvitationId.trim()) : undefined;

  const { toast, showToast, clearToast } = useAdminToast();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceStatus | ''>('');
  const [page, setPage] = useState(0);

  const [pageData, setPageData] = useState<PageResponse<AdminWishResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [deletingWish, setDeletingWish] = useState<AdminWishResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [invitationIdParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchWishes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getWishes({
        search: debouncedSearch || undefined,
        attendanceStatus: attendanceFilter || undefined,
        invitationId: invitationIdParam,
        page,
        size: PAGE_SIZE,
      });
      setPageData(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể tải danh sách lời chúc & RSVP.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, attendanceFilter, invitationIdParam, page]);

  useEffect(() => {
    void fetchWishes();
  }, [fetchWishes]);

  const handleConfirmDelete = async () => {
    if (!deletingWish) return;
    setIsDeleting(true);
    try {
      await adminService.deleteWish(deletingWish.id);
      showToast('success', `Đã xóa lời chúc của khách "${deletingWish.guestName}".`);
      setDeletingWish(null);
      await fetchWishes();
    } catch (err: unknown) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể xóa lời chúc lúc này.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const wishes = pageData?.content ?? [];

  return (
    <div className="space-y-5">
      {/* Active Invitation Filter Indicator */}
      {invitationIdParam !== undefined && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-200">
            <Filter className="w-4 h-4 shrink-0" />
            <span>
              Đang lọc theo thiệp <span className="font-mono">#{invitationIdParam}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.replace('/admin/wishes')}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white dark:bg-[#171b26] border border-rose-200 dark:border-rose-500/40 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Bỏ lọc</span>
          </button>
        </div>
      )}

      {/* Filter, Search & Refresh Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên khách, lời chúc hoặc slug thiệp..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
            aria-label="Lọc theo trạng thái tham dự"
            value={attendanceFilter}
            onChange={(e) => {
              setAttendanceFilter(e.target.value as AttendanceStatus | '');
              setPage(0);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ATTENDING">Tham dự</option>
            <option value="MAYBE">Chưa chắc</option>
            <option value="DECLINED">Từ chối</option>
          </select>

          <button
            type="button"
            onClick={() => void fetchWishes()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-60 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-rose-800 dark:text-rose-200 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchWishes()}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Wishes Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-14 bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
              ))}
            </div>
          ) : wishes.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#1e2433] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">
                Chưa có lời chúc nào phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Thử xóa bộ lọc hoặc kiểm tra thiệp mời khác.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433] text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  <th className="py-3.5 px-4">Khách mời</th>
                  <th className="py-3.5 px-4">Tham dự</th>
                  <th className="py-3.5 px-4">Lời chúc</th>
                  <th className="py-3.5 px-4">Thiệp mời</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                {wishes.map((wish) => (
                  <tr
                    key={wish.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#1f2536] transition-colors align-top"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {wish.guestName}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{wish.guestCount} khách</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge category="attendance" value={wish.attendanceStatus} />
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      {wish.message ? (
                        <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line break-words leading-relaxed">
                          {wish.message}
                        </p>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 line-clamp-1 max-w-[190px]">
                        {wish.invitationTitle || wish.invitationSlug}
                      </p>
                      <div className="flex items-center gap-2.5 mt-0.5">
                        <a
                          href={`/t/${wish.invitationSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[13px] font-mono text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          <span>/t/{wish.invitationSlug}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {invitationIdParam !== wish.invitationId && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/admin/wishes?invitationId=${wish.invitationId}`)
                            }
                            className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
                          >
                            Lọc
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[13px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateTime(wish.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeletingWish(wish)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40 dark:hover:bg-rose-500/30 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {pageData && (
          <AdminPagination
            page={pageData.number}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            size={pageData.size}
            isLoading={isLoading}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingWish)}
        title="Xóa vĩnh viễn lời chúc này?"
        description={
          deletingWish
            ? `Lời chúc của khách "${deletingWish.guestName}" trên thiệp /t/${deletingWish.invitationSlug} sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa lời chúc"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeletingWish(null)}
      />

      {/* Feedback Toast */}
      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}

/**
 * AdminWishesPage Component
 * Purpose: Trang kiểm duyệt lời chúc & RSVP bọc trong Suspense để tương thích chuẩn Next.js App Router với useSearchParams.
 * Props: Không yêu cầu props.
 */
export default function AdminWishesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-6 h-6 text-rose-600 dark:text-rose-400 animate-spin" />
          <p className="text-sm font-medium">Đang tải danh sách lời chúc...</p>
        </div>
      }
    >
      {/* Wishes Moderation Content */}
      <AdminWishesContent />
    </Suspense>
  );
}
