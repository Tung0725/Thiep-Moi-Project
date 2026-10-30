'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_TEMPLATES, TemplateDefinition } from '@/data/defaultTemplates';
import { templateService } from '@/services/templateService';
import { PageRenderer } from '@/components/renderer/PageRenderer';
import BrandLogo from '@/components/common/BrandLogo';

interface TemplateDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * TemplateDetailPage Component
 * Purpose: Trang xem thử và chi tiết mẫu thiệp cưới chuẩn meHappy (/templates/[id] & /view/template/[id]).
 *   - Lấy dữ liệu từ backend API /templates/{id} (hoặc fallback mặc định).
 *   - Phần trên: Khung hiển thị trực tiếp toàn bộ thiệp cưới tương tác thực tế (Live Invitation View).
 *   - Phần dưới: Khối thông tin chi tiết mẫu (Ảnh bìa 240px, Tiêu đề, Mô tả, Nút Dùng mẫu này & Xem kho mẫu).
 *   - Lưới mẫu liên quan: Các thiết kế thiệp cưới khác để khách so sánh và chọn lựa.
 * Props:
 *   - params.id: Mã định danh mẫu thiệp cưới.
 * Key States:
 *   - template: Dữ liệu mẫu thiệp hiện tại.
 */
export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = params;
  const [template, setTemplate] = useState<TemplateDefinition | null>(null);

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    async function loadTemplate() {
      try {
        const detail = await templateService.getTemplateByCodeOrId(id);
        if (detail && detail.contentSchema) {
          const parsedSchema = JSON.parse(detail.contentSchema);
          const parsedDefaultData = detail.defaultData ? JSON.parse(detail.defaultData) : DEFAULT_TEMPLATES[0].defaultData;
          setTemplate({
            id: detail.code,
            category: (detail.category as 'wedding' | 'birthday' | 'event') || 'wedding',
            title: detail.title,
            style: detail.style || 'Tươi sáng & Thanh lịch',
            views: detail.viewsCount ? `${(detail.viewsCount / 1000).toFixed(1)}k` : '6.6k',
            likes: detail.likesCount ? `${detail.likesCount}` : '142',
            badge: (detail.badge as 'Miễn phí' | 'VIP') || 'Miễn phí',
            categoryLabel: detail.categoryLabel || 'Cưới',
            imageUrl: detail.imageUrl || '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
            description: detail.description || '',
            defaultData: parsedDefaultData,
            schema: parsedSchema,
          });
          return;
        }
      } catch {
        // Fallback to local default templates
      }

      const matched = DEFAULT_TEMPLATES.find((t) => t.id.toLowerCase() === id.toLowerCase());
      setTemplate(matched || DEFAULT_TEMPLATES[0]);
    }
    loadTemplate();
  }, [id]);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafb]">
        <span className="w-10 h-10 border-3 border-mh-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Related templates excluding the active one
  const relatedTemplates = DEFAULT_TEMPLATES.filter((t) => t.id !== template.id);

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#fafafa] dark:bg-[#0c0e17] text-[#2d2d2d] dark:text-neutral-100 flex flex-col">
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#151724]/95 backdrop-blur-md border-b border-[#eeeeee] dark:border-[#242838] px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/#kho-thiep"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
            aria-label="Quay lại kho mẫu"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <BrandLogo size="sm" showTagline={false} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#kho-thiep"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-mh-primary transition px-3 py-1.5"
          >
            <span>Kho mẫu</span>
          </Link>

          <Link
            href={`/create?templateId=${template.id}`}
            className="inline-flex items-center gap-1.5 bg-mh-primary hover:bg-mh-primary-hover text-white text-xs font-bold px-4 sm:px-5 py-2 rounded-full shadow-sm transition"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>Dùng mẫu này</span>
          </Link>
        </div>
      </header>

      {/* 2. Top Interactive Live Invitation Canvas Viewport */}
      <section className="w-full py-6 sm:py-10 bg-gradient-to-b from-[#fff0f3] via-[#fafafa] to-white dark:from-[#13151f] dark:via-[#0c0e17] dark:to-[#0c0e17] flex flex-col items-center justify-center px-3 sm:px-6">
        {/* Preview Control Bar: Status & View Mode Switcher */}
        <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181a28] border border-mh-border dark:border-[#2d3142] text-[12px] font-bold text-neutral-700 dark:text-neutral-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bản xem trực tiếp thiệp mời ({template.title})</span>
          </div>

          {/* View Mode Toggle: Desktop Full-Width (Default) vs Mobile */}
          <div className="inline-flex items-center p-1 rounded-full bg-white dark:bg-[#181a28] border border-neutral-200 dark:border-neutral-700 shadow-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-mh-primary text-white shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
              <span>Màn hình rộng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-mh-primary text-white shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              <span>Chuẩn di động</span>
            </button>
          </div>
        </div>

        {/* Clean Responsive Invitation Canvas (No fake phone bezel) */}
        <div
          className={`w-full transition-all duration-300 ${
            viewMode === 'desktop'
              ? 'max-w-4xl bg-white dark:bg-[#121420] shadow-xl sm:rounded-3xl border border-[#eeeeee] dark:border-[#242838] overflow-hidden'
              : 'max-w-md bg-white dark:bg-[#121420] shadow-xl sm:rounded-3xl border border-[#eeeeee] dark:border-[#242838] overflow-hidden'
          }`}
        >
          <PageRenderer
            schema={template.schema}
            slug={template.id}
            containerClassName={viewMode === 'desktop' ? 'max-w-4xl' : 'max-w-md'}
          />
        </div>

        <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-4 text-center">
          Cuộn chuột để trải nghiệm toàn bộ kết cấu và hiệu ứng thiệp cưới
        </p>
      </section>

      {/* 3. Bottom Template Meta Details Section (Standard meHappy Layout) */}
      <section className="w-full border-t border-[#eeeeee] dark:border-[#242838] bg-white dark:bg-[#151724]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-5 py-10 md:px-8 md:py-14">
          {/* Template Info Card */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Template Cover Image (Standard 240px x 427px 9:16 Aspect Ratio) */}
            <img
              src={template.imageUrl}
              alt={template.title}
              loading="lazy"
              className="aspect-[9/16] w-full max-w-[220px] sm:max-w-[240px] shrink-0 self-center rounded-2xl border border-[#eeeeee] dark:border-[#2d3142] object-cover object-top md:self-start shadow-sm"
            />

            {/* Template Typography & Action Group */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Category Badges */}
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-mh-pink-soft dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-mh-primary">
                  {template.categoryLabel}
                </span>
                <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {template.style}
                </span>
                <span className="rounded-full bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs font-bold text-[#2d2d2d] dark:text-white">
                  {template.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
                {template.title}
              </h1>

              {/* Description */}
              <p className="text-[15px] leading-relaxed text-[#555555] dark:text-slate-300 max-w-2xl">
                {template.description}
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href={`/create?templateId=${template.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mh-primary hover:bg-mh-primary-hover text-white text-[15px] font-bold px-7 py-3.5 rounded-full shadow-md shadow-mh-primary/25 transition-all"
                >
                  <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                  <span>Dùng mẫu này</span>
                </Link>

                <Link
                  href="/#kho-thiep"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#1e2130] border border-[#eeeeee] dark:border-[#2d3142] text-[#2d2d2d] dark:text-slate-200 hover:border-mh-primary hover:text-mh-primary text-[15px] font-semibold px-7 py-3.5 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  <span>Xem kho mẫu</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Related Templates Section */}
          <div className="flex flex-col gap-5 pt-4 border-t border-[#eeeeee] dark:border-[#242838]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2d2d2d] dark:text-white">
                Mẫu thiệp cưới liên quan
              </h2>
              <Link
                href="/#kho-thiep"
                className="text-xs font-bold text-mh-primary hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Related Templates Grid (2 Cols on Mobile, 3 Cols on Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedTemplates.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-[#eeeeee] dark:border-[#2d3142] bg-white dark:bg-[#161824] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* Card Thumbnail */}
                  <div className="relative h-[240px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Corner Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="rounded-full bg-white/95 dark:bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#1a1a1a] dark:text-white shadow-sm">
                        {item.badge}
                      </span>
                    </div>

                    {/* Hover Overlay Buttons */}
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3 z-20">
                      <Link
                        href={`/templates/${item.id}`}
                        className="w-full text-center py-2 text-xs font-bold rounded-full bg-white text-[#2d2d2d] shadow hover:bg-mh-pink-bg transition-colors"
                      >
                        Xem trước
                      </Link>
                      <Link
                        href={`/create?templateId=${item.id}`}
                        className="w-full text-center py-2 text-xs font-bold rounded-full bg-mh-primary text-white shadow hover:bg-mh-primary-hover transition-colors"
                      >
                        Chọn mẫu
                      </Link>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 flex flex-col gap-1">
                    <Link href={`/templates/${item.id}`}>
                      <h3 className="line-clamp-1 text-sm font-bold text-[#2d2d2d] dark:text-white hover:text-mh-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {item.style}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Floating Bottom Action Dock Bar */}
      <aside className="fixed bottom-3 inset-x-3 max-w-lg mx-auto z-40 bg-white/95 dark:bg-[#181a28]/95 backdrop-blur-md rounded-2xl border border-[#eeeeee] dark:border-[#2d3142] p-2 sm:p-2.5 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 pl-2 truncate">
          <span className="w-2 h-2 rounded-full bg-mh-primary shrink-0 animate-pulse" />
          <div className="truncate">
            <p className="text-xs font-extrabold text-[#2d2d2d] dark:text-white truncate">
              {template.title}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">{template.style}</p>
          </div>
        </div>

        <Link
          href={`/create?templateId=${template.id}`}
          className="py-2.5 px-5 rounded-full bg-mh-primary hover:bg-mh-primary-hover text-white text-xs font-bold shadow-md shadow-mh-primary/30 transition flex items-center gap-1.5 shrink-0"
        >
          <span>Dùng mẫu này</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </aside>
    </div>
  );
}
