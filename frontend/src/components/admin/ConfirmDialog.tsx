'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Info, Loader2, ShieldAlert, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog Component
 * Purpose: Hộp thoại xác nhận các thao tác quản trị nhạy cảm (khóa tài khoản, đổi quyền, xóa vĩnh viễn).
 * Props:
 *  - open: Bật/tắt hộp thoại.
 *  - title / description: Nội dung tiêu đề và mô tả tác động.
 *  - tone: Mức độ cảnh báo ('danger' | 'warning' | 'primary').
 *  - isLoading: Khóa thao tác khi đang gửi yêu cầu API.
 *  - onConfirm / onCancel: Callback xác nhận hoặc đóng hộp thoại.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  const toneConfig = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
      button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
      Icon: ShieldAlert,
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
      Icon: AlertTriangle,
    },
    primary: {
      iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
      button: 'bg-mh-primary hover:bg-mh-primary-hover text-white shadow-mh-primary/20',
      Icon: Info,
    },
  }[tone];

  const ToneIcon = toneConfig.Icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop Click Catcher */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
        {/* Header Row */}
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${toneConfig.iconBg}`}>
            <ToneIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-slate-900 dark:text-slate-50 leading-snug"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Đóng hộp thoại"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f2536] disabled:opacity-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Footer */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2433] dark:hover:bg-[#272f42] border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-60 transition cursor-pointer ${toneConfig.button}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
