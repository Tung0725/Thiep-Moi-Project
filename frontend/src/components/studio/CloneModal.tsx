'use client';

import React, { useState } from 'react';

/**
 * CloneModal Component
 * Purpose: Hộp thoại modal 1-Click Clone để nhân bản mẫu thiệp hiện tại thành một mẫu mới.
 * Props:
 *   - isOpen: Trạng thái hiển thị modal
 *   - sourceTitle: Tiêu đề của mẫu gốc
 *   - onClose: Callback đóng modal
 *   - onConfirm: Callback khi xác nhận nhân bản (newCode, newTitle)
 * Key States:
 *   - newCode: Mã mẫu mới (ví dụ: hb04-luxury)
 *   - newTitle: Tên mẫu mới
 */
interface CloneModalProps {
  isOpen: boolean;
  sourceTitle: string;
  onClose: () => void;
  onConfirm: (newCode: string, newTitle: string) => Promise<void>;
}

export default function CloneModal({
  isOpen,
  sourceTitle,
  onClose,
  onConfirm,
}: CloneModalProps) {
  const [newCode, setNewCode] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) {
      setError('Vui lòng điền đầy đủ mã và tên mẫu mới.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(newCode.trim().toLowerCase(), newTitle.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi nhân bản mẫu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#161824] rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Nhân Bản Mẫu Thiệp</h3>
              <p className="text-[11px] text-neutral-400">Tạo bản sao độc lập từ mẫu gốc</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3.5 text-xs">
          <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
            <span className="text-neutral-400">Mẫu gốc: </span>
            <strong className="text-neutral-800 dark:text-neutral-100">{sourceTitle}</strong>
          </div>

          {error && (
            <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-600 text-[11px]">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Mã mẫu mới (Slug / Unique Code)</span>
            <input
              type="text"
              placeholder="ví dụ: hb04-luxury"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono outline-none focus:border-mh-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tên mẫu mới hiển thị</span>
            <input
              type="text"
              placeholder="ví dụ: Giao diện HB04 - Luxury Rose Gold"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary"
            />
          </label>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-mh-primary hover:bg-mh-primary-hover text-white font-bold transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang nhân bản...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Tạo bản sao</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
