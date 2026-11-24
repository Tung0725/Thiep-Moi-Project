'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowDown, ChevronLeft, ChevronRight, Eye, Heart, Layers } from 'lucide-react';
import { DEFAULT_TEMPLATES, TemplateDefinition } from '@/data/defaultTemplates';
import { templateService } from '@/services/templateService';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'wedding', label: 'Đám cưới' },
  { id: 'birthday', label: 'Sinh nhật' },
  { id: 'event', label: 'Sự kiện' },
] as const;

const FAVORITES_STORAGE_KEY = 'wedding-template-favorites';
const COUNT_FORMAT = new Intl.NumberFormat('vi-VN');

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
 *   - favorites: Các mẫu đã thả tim trên trình duyệt này.
 */
export default function TemplateShowcaseSection() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [templates, setTemplates] = useState<TemplateDefinition[]>(DEFAULT_TEMPLATES);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) {
        setFavorites(new Set(saved.filter((id): id is string => typeof id === 'string')));
      }
    } catch {
      // Vẫn cho phép thả tim trong phiên nếu trình duyệt chặn lưu trữ.
    }
  }, []);

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
              views: COUNT_FORMAT.format(r.viewsCount ?? 0),
              likes: String(r.likesCount ?? 0),
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
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setFavorites(next);
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // Trạng thái thả tim vẫn có hiệu lực trong phiên hiện tại.
    }
  };

  return (
    <section id="kho-thiep" className="w-full py-14 sm:py-20 bg-[#fafafa] dark:bg-[#0d0f18] transition-colors">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary text-[12px] font-semibold mb-2">
              <Layers size={14} aria-hidden="true" />
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
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-9 h-9 rounded-full border border-mh-border dark:border-[#2d3142] bg-white dark:bg-[#161824] text-[#2d2d2d] dark:text-slate-300 hover:border-mh-primary hover:text-mh-primary flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              aria-label="Cuộn sang phải"
            >
              <ChevronRight size={18} aria-hidden="true" />
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
                aria-pressed={isActive}
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
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory motion-safe:scroll-smooth no-scrollbar"
          >
            {filteredTemplates.length === 0 && (
              <p role="status" className="py-6 text-sm text-mh-body dark:text-slate-300">
                Danh mục này chưa có mẫu thiệp.
              </p>
            )}
            {filteredTemplates.map((item) => {
              const isFavorite = favorites.has(item.id);
              const likeCount = COUNT_FORMAT.format(Number(item.likes) + Number(isFavorite));

              return (
                <div
                  key={item.id}
                  className="group flex w-[185px] shrink-0 snap-start flex-col overflow-hidden rounded-[14px] border border-[#e5d9d8] bg-white p-1 hover:border-[#aa7379] focus-within:border-[#aa7379] dark:border-[#3d3541] dark:bg-[#161824] dark:hover:border-[#c79097] dark:focus-within:border-[#c79097] sm:w-[210px] md:w-[230px] motion-safe:transition-colors"
                >
                  {/* Ảnh bìa và nhãn mẫu */}
                  <div className="relative h-[250px] overflow-hidden rounded-[10px] bg-neutral-100 dark:bg-neutral-800 md:h-[295px]">
                    <Link
                      href={`/view/template/${item.id}`}
                      className="block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-600"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    </Link>

                    {/* Corner Badges */}
                    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between opacity-0 [@media(hover:hover)]:opacity-100 [@media(hover:hover)]:group-hover:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-0">
                      <span className="rounded-full bg-white/95 dark:bg-black/80 px-2.5 py-1 text-[11px] font-bold text-[#1a1a1a] dark:text-white shadow-sm">
                        {item.badge}
                      </span>
                      <span className="rounded-full bg-mh-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                        {item.categoryLabel}
                      </span>
                    </div>

                    {/* Thống kê và thao tác khi rê chuột hoặc lấy tiêu điểm */}
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 [@media(hover:hover)]:invisible [@media(hover:hover)]:group-hover:visible [@media(hover:hover)]:group-focus-within:visible">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col items-start gap-1 text-xs font-semibold tabular-nums text-mh-dark dark:text-slate-200">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm dark:bg-[#211d28]">
                            <Eye size={14} aria-hidden="true" />
                            {item.views}<span className="sr-only"> lượt xem</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm dark:bg-[#211d28]">
                            <Heart size={14} className="text-rose-700 dark:text-rose-300" aria-hidden="true" />
                            {likeCount}<span className="sr-only"> lượt thích</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label={`Thích mẫu ${item.title}`}
                          aria-pressed={isFavorite}
                          onClick={() => toggleFavorite(item.id)}
                          className="pointer-events-auto inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-800 shadow-sm hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 aria-pressed:border-rose-800 aria-pressed:bg-rose-800 aria-pressed:text-white dark:border-rose-900 dark:bg-[#211d28] dark:text-rose-200 dark:hover:bg-rose-900 dark:aria-pressed:bg-rose-800 dark:aria-pressed:text-white"
                        >
                          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          href={`/view/template/${item.id}`}
                          className="pointer-events-auto flex min-h-10 items-center justify-center rounded-full border border-[#e5d9d8] bg-white px-1 text-center text-xs font-bold text-mh-dark shadow-sm hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 dark:border-[#594553] dark:bg-[#211d28] dark:text-slate-100 dark:hover:bg-[#382933]"
                        >
                          Xem trước
                        </Link>
                        <Link
                          href={`/create?templateId=${item.id}`}
                          className="pointer-events-auto flex min-h-10 items-center justify-center rounded-full bg-rose-800 px-1 text-center text-xs font-bold text-white shadow-sm hover:bg-rose-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600"
                        >
                          Chọn mẫu
                        </Link>
                      </div>
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
              );
            })}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Link
            href="/#kho-thiep"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-mh-border dark:border-[#2d3142] bg-white dark:bg-[#161824] text-[#2d2d2d] dark:text-slate-200 hover:border-mh-primary hover:text-mh-primary text-[14px] font-semibold transition-all shadow-sm hover:shadow"
          >
            <span>Khám phá toàn bộ 200+ mẫu thiệp</span>
            <ArrowDown size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
