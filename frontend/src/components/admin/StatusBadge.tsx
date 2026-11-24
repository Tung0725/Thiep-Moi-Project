'use client';

import React from 'react';

type BadgeCategory = 'userStatus' | 'userRole' | 'contentStatus' | 'attendance';

interface StatusBadgeProps {
  category: BadgeCategory;
  value: string;
  className?: string;
}

const BADGE_STYLES: Record<BadgeCategory, Record<string, { label: string; classes: string; dot: string }>> = {
  userStatus: {
    ACTIVE: {
      label: 'Hoạt động',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    LOCKED: {
      label: 'Đã khóa',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40',
      dot: 'bg-rose-500 dark:bg-rose-400',
    },
    PENDING_VERIFICATION: {
      label: 'Chờ xác thực',
      classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40',
      dot: 'bg-amber-500 dark:bg-amber-400',
    },
  },
  userRole: {
    ROLE_ADMIN: {
      label: 'Quản trị',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40',
      dot: 'bg-rose-500 dark:bg-rose-400',
    },
    ROLE_USER: {
      label: 'Người dùng',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/80 dark:text-slate-100 dark:border-slate-600',
      dot: 'bg-slate-500 dark:bg-slate-300',
    },
  },
  contentStatus: {
    PUBLISHED: {
      label: 'Hiển thị',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    DRAFT: {
      label: 'Bản nháp',
      classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40',
      dot: 'bg-amber-500 dark:bg-amber-400',
    },
    ARCHIVED: {
      label: 'Lưu trữ',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/80 dark:text-slate-100 dark:border-slate-600',
      dot: 'bg-slate-500 dark:bg-slate-300',
    },
  },
  attendance: {
    ATTENDING: {
      label: 'Tham dự',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    MAYBE: {
      label: 'Chưa chắc',
      classes: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/40',
      dot: 'bg-sky-500 dark:bg-sky-400',
    },
    DECLINED: {
      label: 'Từ chối',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40',
      dot: 'bg-rose-500 dark:bg-rose-400',
    },
  },
};

/**
 * StatusBadge Component
 * Purpose: Hiển thị nhãn trạng thái/vai trò thống nhất màu sắc và độ tương phản cao ở cả Light/Dark mode trên toàn bộ phân hệ quản trị.
 * Props:
 *  - category: Nhóm trạng thái ('userStatus' | 'userRole' | 'contentStatus' | 'attendance').
 *  - value: Giá trị enum từ backend.
 *  - className: Lớp CSS tùy chọn bổ sung.
 */
export default function StatusBadge({ category, value, className = '' }: StatusBadgeProps) {
  const config = BADGE_STYLES[category]?.[value] ?? {
    label: value,
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/80 dark:text-slate-100 dark:border-slate-600',
    dot: 'bg-slate-500 dark:bg-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${config.classes} ${className}`}
    >
      {/* Status Indicator Dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
