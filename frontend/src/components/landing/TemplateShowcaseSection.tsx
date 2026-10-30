'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_TEMPLATES, TemplateDefinition } from '@/data/defaultTemplates';
import { templateService } from '@/services/templateService';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'wedding', label: 'Đám cưới' },
  { id: 'birthday', label: 'Sinh nhật' },
  { id: 'event', label: 'Sự kiện' },
] as const;

/**
 * TemplateShowcaseSection Component
 * Purpose: Trưng bày danh sách mẫu thiệp cưới theo thanh trượt ngang.
 *   - Lấy danh sách mẫu động từ cơ sở dữ liệu PostgreSQL (hoặc fallback mặc định).
 *   - Bấm "Xem thử thiệp" chuyển hẳn sang trang toàn màn hình (/templates/[id]).
 *   - Bấm "Chọn mẫu này" chuyển hẳn sang trang tạo và chỉnh sửa chuyên biệt (/create?templateId=...).
 * Props: Không yêu cầu props bên ngoài.
 * Key States:
 *   - templates: Danh sách mẫu thiệp hiện có.
 *   - activeTab: Tab lọc danh mục ('all' | 'wedding' | 'birthday' | 'event').
 */
export default function TemplateShowcaseSection() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [templates, setTemplates] = useState<TemplateDefinition[]>(DEFAULT_TEMPLATES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDynamicTemplates() {
      try {
        const remote = await templateService.getTemplates();
        if (remote && remote.length > 0) {
          const mapped: TemplateDefinition[] = remote.map((r) => {
            const existing = DEFAULT_TEMPLATES.find((d) => d.id === r.code);
            return {
              id: r.code,
              category: (r.category as 'wedding' | 'birthday' | 'event') || 'wedding',
              title: r.title,
              style: r.style || 'Tươi sáng & Thanh lịch',
              views: r.viewsCount ? `${(r.viewsCount / 1000).toFixed(1)}k` : '1.2k',
              likes: r.likesCount ? `${r.likesCount}` : '98',
              badge: (r.badge as 'Miễn phí' | 'VIP') || 'Miễn phí',
              categoryLabel: r.categoryLabel || 'Cưới',
              imageUrl: r.imageUrl || existing?.imageUrl || '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
              description: r.description || existing?.description || '',
              defaultData: existing?.defaultData || DEFAULT_TEMPLATES[0].defaultData,
              schema: existing?.schema || DEFAULT_TEMPLATES[0].schema,
            };
          });
          setTemplates(mapped);
        }
      } catch {
        // Fallback silently to DEFAULT_TEMPLATES
      }
    }
    loadDynamicTemplates();
  }, []);

  const filteredTemplates =
    activeTab === 'all'
      ? templates
      : templates.filter((item) => item.category === activeTab);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = 250;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section id="kho-thiep" className="w-full py-14 sm:py-20 bg-[#fafafa] dark:bg-[#0d0f18] transition-colors">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary text-[12px] font-semibold mb-2">
              <span className="material-symbols-outlined text-[14px]">style</span>
              <span>Kho Mẫu Thiệp Mới Nhất</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
              Mẫu Thiệp Cưới Đẹp &amp; Tinh Tế
            </h2>
            <p className="text-sm text-[#555555] dark:text-slate-400 mt-1">
              Tuyển tập những thiết kế thiệp mời online hiện đại, lãng mạn chuẩn phong cách 2026.
            </p>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-9 h-9 rounded-full border border-mh-border dark:border-[#2d3142] bg-white dark:bg-[#161824] text-[#2d2d2d] dark:text-slate-300 hover:border-mh-primary hover:text-mh-primary flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              aria-label="Cuộn sang trái"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-9 h-9 rounded-full border border-mh-border dark:border-[#2d3142] bg-white dark:bg-[#161824] text-[#2d2d2d] dark:text-slate-300 hover:border-mh-primary hover:text-mh-primary flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              aria-label="Cuộn sang phải"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-mh-primary text-white shadow-sm'
                    : 'bg-white dark:bg-[#161824] text-[#555555] dark:text-slate-300 border border-mh-border dark:border-[#2d3142] hover:border-mh-primary hover:text-mh-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Carousel Viewport */}
        <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {filteredTemplates.map((item) => (
              <div
                key={item.id}
                className="group w-[185px] sm:w-[210px] md:w-[230px] shrink-0 snap-start bg-white dark:bg-[#161824] rounded-[14px] border border-[#eeeeee] dark:border-[#2d3142] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image Viewport with Badges and Direct Navigation Links */}
                <div className="relative h-[250px] md:h-[295px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Link href={`/view/template/${item.id}`} className="block w-full h-full">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Corner Badges */}
                  <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between pointer-events-none">
                    <span className="rounded-full bg-white/95 dark:bg-black/80 px-2.5 py-1 text-[11px] font-bold text-[#1a1a1a] dark:text-white shadow-sm">
                      {item.badge}
                    </span>
                    <span className="rounded-full bg-mh-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Stats Badges */}
                  <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-0 transition-opacity pointer-events-none">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-[#2d2d2d] dark:text-white shadow-sm">
                      <span className="material-symbols-outlined text-[12px]">visibility</span>
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-mh-primary shadow-sm">
                      <span className="material-symbols-outlined text-[12px] text-mh-primary">favorite</span>
                      {item.likes}
                    </span>
                  </div>

                  {/* Hover Buttons Overlay Linking Directly to Dedicated Pages */}
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
                    <Link
                      href={`/view/template/${item.id}`}
                      className="w-full text-center py-2 text-xs font-bold rounded-full bg-white text-[#2d2d2d] shadow hover:bg-mh-pink-bg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>Xem trước</span>
                    </Link>
                    <Link
                      href={`/create?templateId=${item.id}`}
                      className="w-full text-center py-2 text-xs font-bold rounded-full bg-mh-primary text-white shadow hover:bg-mh-primary-hover transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit_note</span>
                      <span>Chọn mẫu</span>
                    </Link>
                  </div>
                </div>

                {/* Card Meta Description */}
                <div className="p-3.5 flex flex-col gap-1.5">
                  <Link href={`/view/template/${item.id}`}>
                    <h3 className="line-clamp-1 text-[13px] md:text-[14px] font-bold text-[#2d2d2d] dark:text-white hover:text-mh-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center">
                    <span className="rounded-full bg-mh-pink-soft dark:bg-rose-950/40 px-2 py-0.5 text-[11px] font-medium text-mh-primary truncate">
                      {item.style}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Link
            href="/#kho-thiep"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-mh-border dark:border-[#2d3142] bg-white dark:bg-[#161824] text-[#2d2d2d] dark:text-slate-200 hover:border-mh-primary hover:text-mh-primary text-[14px] font-semibold transition-all shadow-sm hover:shadow"
          >
            <span>Khám phá toàn bộ 200+ mẫu thiệp</span>
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
