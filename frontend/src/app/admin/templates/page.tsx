'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Eye,
  Heart,
  ImageOff,
  MailOpen,
  Palette,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import {
  AdminTemplateResponse,
  AdminUpdateTemplateMetaPayload,
  TemplateStatus,
} from '@/types/admin';
import { PageResponse } from '@/types/api';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminToast, { useAdminToast } from '@/components/admin/AdminToast';
import AdminTemplateEditModal from '@/components/admin/AdminTemplateEditModal';

const PAGE_SIZE = 20;

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'wedding', label: 'Thiệp cưới' },
  { value: 'birthday', label: 'Sinh nhật' },
  { value: 'event', label: 'Sự kiện' },
];

const STATUS_SELECT_STYLES: Record<TemplateStatus, string> = {
  PUBLISHED:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
  DRAFT:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40',
  ARCHIVED:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/80 dark:text-slate-100 dark:border-slate-600',
};

const STATUS_LABELS: Record<TemplateStatus, string> = {
  PUBLISHED: 'Hiển thị',
  DRAFT: 'Bản nháp',
  ARCHIVED: 'Lưu trữ',
};

/**
 * AdminTemplatesPage Component
 * Purpose: Quản lý kho mẫu thiệp ở mọi trạng thái (ADM-05, ADM-06, ADM-07): tìm kiếm, lọc trạng thái/danh mục, đổi trạng thái nhanh qua select pill, sửa thông tin và mở Studio.
 * Props: Không yêu cầu props.
 * Key States:
 *  - searchInput / debouncedSearch, statusFilter, categoryFilter, page: Bộ lọc truy vấn.
 *  - pageData: Danh sách phân trang mẫu thiệp.
 *  - editingTemplate / isSavingMeta / modalError: Trạng thái modal chỉnh sửa mẫu thiệp.
 *  - updatingStatusId: ID mẫu đang cập nhật trạng thái nhanh.
 */
export default function AdminTemplatesPage() {
  const { toast, showToast, clearToast } = useAdminToast();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);

  const [pageData, setPageData] = useState<PageResponse<AdminTemplateResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplateResponse | null>(null);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getTemplates({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        size: PAGE_SIZE,
      });
      setPageData(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể tải danh sách mẫu thiệp.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter, page]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const handleQuickStatusChange = async (
    template: AdminTemplateResponse,
    nextStatus: TemplateStatus,
  ) => {
    if (template.status === nextStatus) return;
    setUpdatingStatusId(template.id);
    try {
      const updated = await adminService.updateTemplateStatus(template.id, nextStatus);
      setPageData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) => (item.id === updated.id ? updated : item)),
            }
          : prev,
      );
      showToast(
        'success',
        `Đã chuyển mẫu "${updated.title}" sang trạng thái ${STATUS_LABELS[updated.status]}.`,
      );
    } catch (err: unknown) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể đổi trạng thái mẫu thiệp.',
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveMeta = async (id: number, payload: AdminUpdateTemplateMetaPayload) => {
    setIsSavingMeta(true);
    setModalError(null);
    try {
      const updated = await adminService.updateTemplateMeta(id, payload);
      setPageData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) => (item.id === updated.id ? updated : item)),
            }
          : prev,
      );
      setEditingTemplate(null);
      showToast('success', `Đã cập nhật mẫu "${updated.title}".`);
    } catch (err: unknown) {
      setModalError(
        err instanceof Error ? err.message : 'Không thể lưu thông tin mẫu thiệp.',
      );
    } finally {
      setIsSavingMeta(false);
    }
  };

  const templates = pageData?.content ?? [];

  return (
    <div className="space-y-5">
      {/* Filter, Search & Actions Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã mẫu hoặc tên mẫu thiệp..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Lọc theo trạng thái mẫu"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TemplateStatus | '');
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
            aria-label="Lọc theo danh mục mẫu"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Link
            href="/editor/studio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mh-primary hover:bg-mh-primary-hover text-white text-sm font-semibold shadow-sm transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mở Studio</span>
          </Link>

          <button
            type="button"
            onClick={() => void fetchTemplates()}
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
            onClick={() => void fetchTemplates()}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Templates Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-16 bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#1e2433] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Palette className="w-6 h-6" />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">
                Không tìm thấy mẫu thiệp nào
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Thử đổi bộ lọc hoặc tạo mẫu mới trong Studio.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433] text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  <th className="py-3.5 px-4">Mẫu thiệp</th>
                  <th className="py-3.5 px-4">Danh mục &amp; Phong cách</th>
                  <th className="py-3.5 px-4">Thống kê</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                {templates.map((tpl) => {
                  const isUpdating = updatingStatusId === tpl.id;
                  return (
                    <tr
                      key={tpl.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1f2536] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          {/* Template Thumbnail */}
                          <div className="w-12 h-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#1e2433] overflow-hidden flex items-center justify-center shrink-0">
                            {tpl.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={tpl.imageUrl}
                                alt={tpl.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 dark:text-slate-50 truncate max-w-[240px]">
                                {tpl.title}
                              </p>
                              {tpl.badge && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                                  {tpl.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                              {tpl.code} · <span className="font-sans">v{tpl.version}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {tpl.categoryLabel || tpl.category}
                        </p>
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {tpl.style || '—'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">
                          <span className="inline-flex items-center gap-1" title="Lượt xem">
                            <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            {tpl.viewsCount.toLocaleString('vi-VN')}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Lượt thích">
                            <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                            {tpl.likesCount.toLocaleString('vi-VN')}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Thiệp đã tạo từ mẫu này">
                            <MailOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            {tpl.invitationCount.toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          aria-label={`Đổi trạng thái mẫu ${tpl.title}`}
                          value={tpl.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            void handleQuickStatusChange(tpl, e.target.value as TemplateStatus)
                          }
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 cursor-pointer ${STATUS_SELECT_STYLES[tpl.status]}`}
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

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalError(null);
                              setEditingTemplate(tpl);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <Link
                            href="/editor/studio"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40 dark:hover:bg-rose-500/30 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Studio</span>
                          </Link>
                        </div>
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

      {/* Edit Metadata Modal */}
      <AdminTemplateEditModal
        template={editingTemplate}
        isSaving={isSavingMeta}
        errorMessage={modalError}
        onClose={() => {
          setEditingTemplate(null);
          setModalError(null);
        }}
        onSubmit={handleSaveMeta}
      />

      {/* Feedback Toast */}
      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
