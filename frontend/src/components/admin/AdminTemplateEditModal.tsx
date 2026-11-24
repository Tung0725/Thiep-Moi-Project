'use client';

import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2, Save, X } from 'lucide-react';
import {
  AdminTemplateResponse,
  AdminUpdateTemplateMetaPayload,
  TemplateStatus,
} from '@/types/admin';

interface AdminTemplateEditModalProps {
  template: AdminTemplateResponse | null;
  isSaving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (id: number, payload: AdminUpdateTemplateMetaPayload) => Promise<void>;
}

/**
 * AdminTemplateEditModal Component
 * Purpose: Modal chỉnh sửa thông tin mẫu thiệp (ADM-07), giữ nguyên contentSchema và defaultData.
 * Props:
 *  - template: Mẫu thiệp đang chọn chỉnh sửa (null sẽ đóng modal).
 *  - isSaving: Trạng thái đang gọi API lưu thông tin.
 *  - errorMessage: Lỗi trả về từ backend khi cập nhật.
 *  - onClose: Callback đóng modal.
 *  - onSubmit: Callback gửi payload cập nhật lên trang quản lý mẫu thiệp.
 * Key States:
 *  - title, category, categoryLabel, style, badge, imageUrl, description, status: Trường thông tin của mẫu.
 */
export default function AdminTemplateEditModal({
  template,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: AdminTemplateEditModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('wedding');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [style, setStyle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TemplateStatus>('PUBLISHED');
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!template) return;
    setTitle(template.title || '');
    setCategory(template.category || 'wedding');
    setCategoryLabel(template.categoryLabel || '');
    setStyle(template.style || '');
    setBadge(template.badge || '');
    setImageUrl(template.imageUrl || '');
    setDescription(template.description || '');
    setStatus(template.status);
    setPreviewFailed(false);
  }, [template]);

  useEffect(() => {
    if (!template) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [template, isSaving, onClose]);

  if (!template) return null;

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: AdminUpdateTemplateMetaPayload = {
      title: title.trim() || undefined,
      category: category.trim() || undefined,
      categoryLabel: categoryLabel.trim() || undefined,
      style: style.trim() || undefined,
      badge: badge.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
      status,
    };
    await onSubmit(template.id, payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-template-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#171b26]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/80">
          <div>
            <h2
              id="edit-template-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-50"
            >
              Chỉnh sửa mẫu thiệp
            </h2>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
              Mã: <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{template.code}</span> · v{template.version}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f2536] disabled:opacity-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 text-sm text-rose-800 dark:text-rose-200 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Title & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplTitle">
                Tên mẫu thiệp
              </label>
              <input
                id="tplTitle"
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplStatus">
                Trạng thái
              </label>
              <select
                id="tplStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as TemplateStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              >
                <option value="PUBLISHED">Hiển thị</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </div>
          </div>

          {/* Category & Category Label Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplCategory">
                Mã danh mục
              </label>
              <input
                id="tplCategory"
                type="text"
                maxLength={50}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="wedding, birthday, event..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplCategoryLabel">
                Tên danh mục
              </label>
              <input
                id="tplCategoryLabel"
                type="text"
                maxLength={50}
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                placeholder="Cưới, Sinh nhật, Sự kiện..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              />
            </div>
          </div>

          {/* Style & Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplStyle">
                Phong cách
              </label>
              <input
                id="tplStyle"
                type="text"
                maxLength={100}
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Sang trọng, Tối giản, Truyền thống..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplBadge">
                Nhãn nổi bật
              </label>
              <input
                id="tplBadge"
                type="text"
                maxLength={30}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Miễn phí, VIP, Mới..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              />
            </div>
          </div>

          {/* Thumbnail Image URL & Live Preview */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplImageUrl">
              Ảnh đại diện
            </label>
            <div className="flex items-start gap-3">
              <input
                id="tplImageUrl"
                type="text"
                maxLength={500}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewFailed(false);
                }}
                placeholder="https://... hoặc /templates/..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
              />
              <div className="w-14 h-16 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-[#1e2433] overflow-hidden flex items-center justify-center shrink-0">
                {imageUrl.trim() && !previewFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl.trim()}
                    alt={title || template.code}
                    onError={() => setPreviewFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5" htmlFor="tplDescription">
              Mô tả mẫu thiệp
            </label>
            <textarea
              id="tplDescription"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn phong cách của mẫu..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2433] dark:hover:bg-[#272f42] border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-mh-primary hover:bg-mh-primary-hover text-white shadow-sm disabled:opacity-60 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
