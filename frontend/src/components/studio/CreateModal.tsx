'use client';

import React, { useState } from 'react';
import { CreateTemplatePayload } from '@/types/api';

/**
 * CreateModal Component
 * Purpose: Modal khởi tạo một mẫu thiệp mới tinh trong cơ sở dữ liệu.
 * Props:
 *   - isOpen: Trạng thái hiển thị modal
 *   - onClose: Callback đóng modal
 *   - onConfirm: Callback khi xác nhận tạo mới
 * Key States:
 *   - code, title, category, style, badge, imageUrl, description
 */
interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: Partial<CreateTemplatePayload>) => Promise<void>;
}

export default function CreateModal({ isOpen, onClose, onConfirm }: CreateModalProps) {
  const [code, setCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('wedding');
  const [style, setStyle] = useState<string>('Hiện đại & Tinh tế');
  const [badge, setBadge] = useState<string>('Mới');
  const [imageUrl, setImageUrl] = useState<string>('/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      setError('Vui lòng điền mã và tiêu đề mẫu.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm({
        code: code.trim().toLowerCase(),
        title: title.trim(),
        category,
        categoryLabel: category === 'wedding' ? 'Cưới' : category === 'birthday' ? 'Sinh nhật' : 'Sự kiện',
        style,
        badge,
        imageUrl,
        description,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi tạo mẫu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#161824] rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_box</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Tạo Mẫu Thiệp Mới</h3>
              <p className="text-[11px] text-neutral-400">Khởi tạo thiết kế mới trên hệ thống</p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 text-xs">
          {error && (
            <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-600 text-[11px]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Mã mẫu (Slug)</span>
              <input
                type="text"
                placeholder="vd: modern-green-01"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Danh mục</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
              >
                <option value="wedding">Đám cưới</option>
                <option value="birthday">Sinh nhật</option>
                <option value="event">Sự kiện</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tên mẫu thiệp</span>
            <input
              type="text"
              placeholder="vd: Giao diện Cưới Thanh Lịch Botanical"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Phong cách</span>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Huy hiệu (Badge)</span>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">URL Ảnh đại diện mẫu (Thumbnail)</span>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Mô tả ngắn về mẫu</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu về nét đặc trưng của mẫu..."
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
            />
          </label>

          {/* Modal Actions */}
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
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Khởi tạo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
