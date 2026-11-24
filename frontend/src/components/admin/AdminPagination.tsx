'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  isLoading?: boolean;
  onPageChange: (nextPage: number) => void;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, idx) => idx);
  }
  const pages: (number | 'ellipsis')[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  if (start > 1) pages.push('ellipsis');
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }
  if (end < total - 2) pages.push('ellipsis');
  pages.push(total - 1);
  return pages;
}

/**
 * AdminPagination Component
 * Purpose: Điều hướng phân trang chuẩn Spring Data (0-indexed) cho các bảng quản trị với cỡ chữ và độ tương phản dễ đọc.
 * Props:
 *  - page: Chỉ số trang hiện tại (bắt đầu từ 0).
 *  - totalPages / totalElements / size: Thông số phân trang từ PageResponse.
 *  - isLoading: Vô hiệu hóa nút trong lúc đang tải trang mới.
 *  - onPageChange: Callback khi người dùng chọn trang khác.
 */
export default function AdminPagination({
  page,
  totalPages,
  totalElements,
  size,
  isLoading = false,
  onPageChange,
}: AdminPaginationProps) {
  if (totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const visiblePages = getVisiblePages(page, Math.max(totalPages, 1));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433]">
      {/* Item Range Summary */}
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Hiển thị <span className="font-semibold text-slate-900 dark:text-slate-50">{from}–{to}</span> /{' '}
        <span className="font-semibold text-slate-900 dark:text-slate-50">{totalElements}</span> kết quả
      </p>

      {/* Page Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isLoading || page <= 0}
            onClick={() => onPageChange(page - 1)}
            aria-label="Trang trước"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#171b26] text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          {visiblePages.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate-500 dark:text-slate-400 select-none">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(item)}
                className={`min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  item === page
                    ? 'bg-mh-primary text-white shadow-sm'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#171b26] text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                {item + 1}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={isLoading || page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            aria-label="Trang tiếp"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#171b26] text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
