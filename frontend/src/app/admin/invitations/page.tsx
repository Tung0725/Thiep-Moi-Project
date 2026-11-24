'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  MailOpen,
  MapPin,
  MessageSquareHeart,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminInvitationResponse, AdminTemplateResponse } from '@/types/admin';
import { InvitationStatus, PageResponse } from '@/types/api';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminToast, { useAdminToast } from '@/components/admin/AdminToast';

const PAGE_SIZE = 20;

const STATUS_SELECT_STYLES: Record<InvitationStatus, string> = {
  PUBLISHED:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
  DRAFT:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40',
  ARCHIVED:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/80 dark:text-slate-100 dark:border-slate-600',
};

const STATUS_LABELS: Record<InvitationStatus, string> = {
  PUBLISHED: 'Hiển thị',
  DRAFT: 'Bản nháp',
  ARCHIVED: 'Lưu trữ',
};

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
 * AdminInvitationsPage Component
 * Purpose: Quản lý toàn bộ thiệp mời trong hệ thống (ADM-08, ADM-09, ADM-10): tìm kiếm, lọc trạng thái/mẫu, xem công khai /t/{slug}, đổi trạng thái nhanh qua select pill, xem lời chúc và xóa vĩnh viễn.
 * Props: Không yêu cầu props.
 * Key States:
 *  - searchInput / debouncedSearch, statusFilter, templateIdFilter, page: Bộ lọc danh sách thiệp.
 *  - templateOptions: Danh sách mẫu thiệp dùng cho dropdown lọc theo mẫu.
 *  - pageData: Dữ liệu phân trang thiệp mời.
 *  - deletingInvitation / isDeleting: Thiệp đang chờ xác nhận xóa vĩnh viễn.
 */
export default function AdminInvitationsPage() {
  const { toast, showToast, clearToast } = useAdminToast();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | ''>('');
  const [templateIdFilter, setTemplateIdFilter] = useState('');
  const [page, setPage] = useState(0);

  const [templateOptions, setTemplateOptions] = useState<AdminTemplateResponse[]>([]);
  const [pageData, setPageData] = useState<PageResponse<AdminInvitationResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [deletingInvitation, setDeletingInvitation] = useState<AdminInvitationResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    adminService
      .getTemplates({ page: 0, size: 50 })
      .then((res) => {
        if (active) setTemplateOptions(res.content);
      })
      .catch(() => {
        // Bỏ qua lỗi phụ khi nạp danh sách mẫu để bộ lọc thiệp vẫn hoạt động bình thường
      });
    return () => {
      active = false;
    };
  }, []);

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getInvitations({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        templateId: templateIdFilter || undefined,
        page,
        size: PAGE_SIZE,
      });
      setPageData(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể tải danh sách thiệp mời.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, templateIdFilter, page]);

  useEffect(() => {
    void fetchInvitations();
  }, [fetchInvitations]);

  const handleStatusChange = async (
    invitation: AdminInvitationResponse,
    nextStatus: InvitationStatus,
  ) => {
    if (invitation.status === nextStatus) return;
    setUpdatingStatusId(invitation.id);
    try {
      const updated = await adminService.updateInvitationStatus(invitation.id, nextStatus);
      setPageData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) => (item.id === updated.id ? updated : item)),
            }
          : prev,
      );
      const visibilityNote =
        nextStatus === 'PUBLISHED'
          ? 'Thiệp đã được hiển thị công khai.'
          : 'Thiệp đã bị ẩn khỏi đường dẫn công khai.';
      showToast(
        'success',
        `Đã chuyển /t/${updated.slug} sang ${STATUS_LABELS[updated.status]}. ${visibilityNote}`,
      );
    } catch (err: unknown) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể đổi trạng thái thiệp mời.',
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingInvitation) return;
    setIsDeleting(true);
    try {
      await adminService.deleteInvitation(deletingInvitation.id);
      showToast('success', `Đã xóa thiệp /t/${deletingInvitation.slug} và lời chúc liên quan.`);
      setDeletingInvitation(null);
      await fetchInvitations();
    } catch (err: unknown) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể xóa thiệp mời lúc này.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const invitations = pageData?.content ?? [];

  return (
    <div className="space-y-5">
      {/* Filter, Search & Refresh Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo slug, tên dâu rể, tiêu đề hoặc email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Lọc theo trạng thái thiệp"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as InvitationStatus | '');
              setPage(0);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Hiển thị</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>

          <select
            aria-label="Lọc theo mẫu thiệp"
            value={templateIdFilter}
            onChange={(e) => {
              setTemplateIdFilter(e.target.value);
              setPage(0);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary max-w-[220px]"
          >
            <option value="">Tất cả mẫu thiệp</option>
            {templateOptions.map((tpl) => (
              <option key={tpl.code} value={tpl.code}>
                {tpl.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void fetchInvitations()}
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
            onClick={() => void fetchInvitations()}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Invitations Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-16 bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#1e2433] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <MailOpen className="w-6 h-6" />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">
                Không tìm thấy thiệp mời nào
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433] text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  <th className="py-3.5 px-4">Thiệp mời &amp; Đường dẫn</th>
                  <th className="py-3.5 px-4">Chủ thiệp</th>
                  <th className="py-3.5 px-4">Sự kiện</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Lời chúc</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                {invitations.map((inv) => {
                  const coupleTitle =
                    inv.title ||
                    [inv.groomName, inv.brideName].filter(Boolean).join(' & ') ||
                    inv.slug;
                  const isUpdating = updatingStatusId === inv.id;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1f2536] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 max-w-[240px]">
                          {coupleTitle}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <a
                            href={`/t/${inv.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[13px] font-mono text-rose-600 dark:text-rose-400 hover:underline"
                          >
                            <span>/t/{inv.slug}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e2433] text-xs font-mono text-slate-700 dark:text-slate-200">
                            {inv.templateId}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1">
                          {formatDateTime(inv.createdAt)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {inv.ownerEmail ? (
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[180px]">
                              {inv.ownerFullName || inv.ownerEmail}
                            </p>
                            <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                              {inv.ownerEmail}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700/80 dark:text-slate-200">
                            Khách vãng lai
                          </span>
                        )}
                        {inv.phoneNumber && (
                          <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {inv.phoneNumber}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[13px] text-slate-700 dark:text-slate-200">
                        <div className="space-y-1 max-w-[200px]">
                          <p className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                            <span>{inv.eventDate || '—'}</span>
                          </p>
                          {inv.venueName && (
                            <p className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 line-clamp-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                              <span className="truncate">{inv.venueName}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          aria-label={`Đổi trạng thái thiệp ${inv.slug}`}
                          value={inv.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            void handleStatusChange(inv, e.target.value as InvitationStatus)
                          }
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 cursor-pointer ${STATUS_SELECT_STYLES[inv.status]}`}
                        >
                          <option value="PUBLISHED" className="bg-white dark:bg-[#171b26] text-slate-900 dark:text-slate-100">
                            Hiển thị
                          </option>
                          <option value="DRAFT" className="bg-white dark:bg-[#171b26] text-slate-900 dark:text-slate-100">
                            Bản nháp
                          </option>
                          <option value="ARCHIVED" className="bg-white dark:bg-[#171b26] text-slate-900 dark:text-slate-100">
                            Lưu trữ
                          </option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/wishes?invitationId=${inv.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/40 dark:hover:bg-sky-500/30 transition"
                        >
                          <MessageSquareHeart className="w-3.5 h-3.5" />
                          <span>{inv.wishCount}</span>
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeletingInvitation(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40 dark:hover:bg-rose-500/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
        open={Boolean(deletingInvitation)}
        title="Xóa vĩnh viễn thiệp mời?"
        description={
          deletingInvitation
            ? `Thiệp "/t/${deletingInvitation.slug}" sẽ bị xóa vĩnh viễn cùng toàn bộ ${deletingInvitation.wishCount} lời chúc/RSVP liên quan. Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa vĩnh viễn"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeletingInvitation(null)}
      />

      {/* Feedback Toast */}
      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
