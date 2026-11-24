'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface AdminToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminToastProps {
  toast: AdminToastMessage | null;
  onClose: () => void;
}

export function useAdminToast(autoHideMs = 4000) {
  const [toast, setToast] = useState<AdminToastMessage | null>(null);

  const showToast = useCallback((type: AdminToastMessage['type'], message: string) => {
    setToast({ id: Date.now(), type, message });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [toast, autoHideMs]);

  return { toast, showToast, clearToast };
}

/**
 * AdminToast Component
 * Purpose: Thông báo phản hồi nhanh (success / error / info) góc phải dưới sau các thao tác quản trị.
 * Props:
 *  - toast: Đối tượng thông báo hiện tại hoặc null.
 *  - onClose: Hàm đóng thông báo thủ công.
 */
export default function AdminToast({ toast, onClose }: AdminToastProps) {
  if (!toast) return null;

  const styles = {
    success: {
      container: 'bg-emerald-600 text-white border-emerald-500',
      Icon: CheckCircle2,
    },
    error: {
      container: 'bg-rose-600 text-white border-rose-500',
      Icon: AlertCircle,
    },
    info: {
      container: 'bg-slate-800 text-white border-slate-700',
      Icon: Info,
    },
  }[toast.type];

  const ToastIcon = styles.Icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* Toast Notification Surface */}
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl ${styles.container}`}
      >
        <ToastIcon className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="p-0.5 rounded-md hover:bg-white/20 transition cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
