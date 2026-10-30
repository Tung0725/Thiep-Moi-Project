'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';
import { TemplateDetailResponse } from '@/types/api';

/**
 * StudioTopBar Component
 * Purpose: Thanh tiêu đề trên cùng của Studio Editor chứa thông tin mẫu hiện tại, bộ chuyển kích thước khung nhìn, các nút hành động (Lưu, Nhân bản, Tạo mới, Xem thử).
 * Props:
 *   - activeTemplate: Thông tin mẫu thiệp hiện tại
 *   - templatesList: Danh sách mẫu thiệp có sẵn để chuyển đổi nhanh
 *   - onSwitchTemplate: Callback đổi mẫu đang biên tập
 *   - viewMode: Chế độ hiển thị canvas ('desktop' | 'mobile')
 *   - onViewModeChange: Đổi chế độ hiển thị
 *   - onSave: Callback khi bấm Lưu
 *   - onOpenClone: Mở modal nhân bản
 *   - onOpenCreate: Mở modal tạo mới
 *   - isSaving: Trạng thái đang lưu dữ liệu lên server
 * Key States:
 *   - Được quản lý từ trang Studio cha.
 */
interface StudioTopBarProps {
  activeTemplate: TemplateDetailResponse | null;
  templatesList: { id: number | string; code: string; title: string }[];
  onSwitchTemplate: (code: string) => void;
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  onSave: () => Promise<void>;
  onOpenClone: () => void;
  onOpenCreate: () => void;
  isSaving: boolean;
}

export default function StudioTopBar({
  activeTemplate,
  templatesList,
  onSwitchTemplate,
  viewMode,
  onViewModeChange,
  onSave,
  onOpenClone,
  onOpenCreate,
  isSaving,
}: StudioTopBarProps) {
  return (
    <header className="h-14 border-b border-neutral-200 dark:border-[#242838] bg-white/95 dark:bg-[#121420]/95 backdrop-blur px-4 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* 1. Brand Logo & Template Switcher Dropdown */}
      <div className="flex items-center gap-3">
        <Link href="/#kho-thiep" className="flex items-center gap-1.5" title="Về trang chủ">
          <BrandLogo size="sm" showTagline={false} />
          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-mh-pink-soft dark:bg-rose-950/40 text-[10px] font-black uppercase text-mh-primary tracking-wider">
            Studio
          </span>
        </Link>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

        {/* Template Select Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={activeTemplate?.code || ''}
            onChange={(e) => onSwitchTemplate(e.target.value)}
            className="text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 outline-none max-w-[180px] sm:max-w-[240px] truncate"
          >
            {templatesList.map((item) => (
              <option key={item.code} value={item.code}>
                {item.title} ({item.code})
              </option>
            ))}
          </select>

          {activeTemplate && (
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                v{activeTemplate.version || 1}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTemplate.status === 'PUBLISHED'
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                }`}
              >
                {activeTemplate.status || 'PUBLISHED'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Responsive Canvas Switcher (Desktop 900px vs Mobile 420px) */}
      <div className="hidden md:inline-flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
        <button
          type="button"
          onClick={() => onViewModeChange('desktop')}
          className={`flex items-center gap-1 px-3 py-1 rounded-md transition cursor-pointer ${
            viewMode === 'desktop'
              ? 'bg-white dark:bg-neutral-700 font-bold text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
          <span>Màn hình rộng</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('mobile')}
          className={`flex items-center gap-1 px-3 py-1 rounded-md transition cursor-pointer ${
            viewMode === 'mobile'
              ? 'bg-white dark:bg-neutral-700 font-bold text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">smartphone</span>
          <span>Di động</span>
        </button>
      </div>

      {/* 3. Actions: Create New, Clone, Save, Preview */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCreate}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-sm"
          title="Tạo mẫu thiệp mới"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span className="hidden sm:inline">Tạo mới</span>
        </button>

        <button
          type="button"
          onClick={onOpenClone}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-sm"
          title="1-Click Clone: Nhân bản thành mẫu mới"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          <span className="hidden sm:inline">Nhân bản</span>
        </button>

        {activeTemplate && (
          <Link
            href={`/templates/${activeTemplate.code}`}
            target="_blank"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="Mở trang xem thử mẫu độc lập"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span className="hidden sm:inline">Xem thử</span>
          </Link>
        )}

        {/* Primary Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1.5 rounded-lg bg-mh-primary hover:bg-mh-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu vào DB</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
