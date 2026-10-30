'use client';

import React, { useState } from 'react';
import { HeroBlockProps } from '@/types/schema';

/**
 * HeroBlock Component
 * Purpose: Hiển thị khối đầu trang đúng chuẩn giao diện thiệp cưới meHappy HB04:
 *   - Tên thư pháp uốn lượn Chú rể & Cô dâu ("Văn Bách" & "Khánh Ly") dùng font GreatVibes kèm hiệu ứng nảy từ 2 bên.
 *   - Trái tim ở giữa với hiệu ứng nhịp đập lãng mạn.
 *   - Huy hiệu vòng hoa "Just Married" dùng font thư pháp UVNHoaTay1.
 *   - Ảnh bìa cưới khổ lớn bo góc mềm mại.
 *   - 4 nút điều hướng nhanh dạng viên thuốc: "Thiệp mời", "Sự Kiện", "Album", "Mừng Cưới".
 * Props: HeroBlockProps
 * Key States:
 *   - imgError: Cờ ảnh dự phòng nếu URL tải thất bại.
 */
export default function HeroBlock({
  brideName = 'Khánh Ly',
  groomName = 'Văn Bách',
  eventDate = '25 . 12 . 2026',
  coverImageUrl,
  title = 'SAVE THE DATE',
  subtitle = 'Trân trọng kính mời quý khách đến dự lễ thành hôn của',
}: HeroBlockProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackImage =
    '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full text-center px-4 pt-6 pb-10 bg-gradient-to-b from-rose-50/50 to-white dark:from-[#13151f] dark:to-[#0c0e17] overflow-hidden">
      {/* 1. Header Couple Calligraphy Names & Heart */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
        <span className="font-greatvibes text-3xl sm:text-5xl text-[#A80606] dark:text-rose-400 animate-bounce-in-left tracking-wide">
          {groomName}
        </span>
        <span className="material-symbols-outlined text-rose-500 text-[24px] sm:text-[30px] animate-pulse-heart">
          favorite
        </span>
        <span className="font-greatvibes text-3xl sm:text-5xl text-[#A80606] dark:text-rose-400 animate-bounce-in-right tracking-wide">
          {brideName}
        </span>
      </div>

      {/* 2. "Just Married" Floral Crest Badge */}
      <div className="flex flex-col items-center justify-center mb-5 animate-bounce-in-up">
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/95 dark:bg-black/50 border border-rose-200 dark:border-rose-900/60 shadow-sm">
          <span className="text-xs font-serif italic text-neutral-400">❀</span>
          <span className="font-hoatay text-lg sm:text-xl text-[#A80606] dark:text-rose-400 pt-0.5">
            Just Married
          </span>
          <span className="text-xs font-serif italic text-neutral-400">❀</span>
        </div>
      </div>

      {/* 3. Hero Wedding Editorial Frame */}
      <div className="w-full max-w-[340px] sm:max-w-[440px] mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white dark:border-neutral-800 relative bg-neutral-100">
        <img
          src={imgError || !coverImageUrl ? fallbackImage : coverImageUrl}
          alt={`${groomName} & ${brideName}`}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
          loading="eager"
        />

        {/* Soft Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Date Overlay Badge */}
        <div className="absolute bottom-4 inset-x-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs sm:text-sm font-bold text-[#2d2d2d] shadow-md tracking-wider">
            {eventDate}
          </span>
        </div>
      </div>

      {/* 4. Subtitle Invitation Greeting */}
      <div className="mt-6 space-y-2 max-w-md mx-auto px-4">
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* 5. Floating Navigation Pill Tabs (Thiệp mời - Sự Kiện - Album - Mừng Cưới) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-bounce-in-down">
        <button
          type="button"
          onClick={() => scrollToSection('save-the-date')}
          className="px-3.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-[#A80606]/30 text-[#A80606] dark:text-rose-400 text-xs font-bold shadow-sm hover:bg-[#A80606] hover:text-white transition cursor-pointer"
        >
          Thiệp mời
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('su-kien-cuoi')}
          className="px-3.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-[#A80606]/30 text-[#A80606] dark:text-rose-400 text-xs font-bold shadow-sm hover:bg-[#A80606] hover:text-white transition cursor-pointer"
        >
          Sự Kiện
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('album-anh')}
          className="px-3.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-[#A80606]/30 text-[#A80606] dark:text-rose-400 text-xs font-bold shadow-sm hover:bg-[#A80606] hover:text-white transition cursor-pointer"
        >
          Album
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('mung-cuoi')}
          className="px-3.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-[#A80606]/30 text-[#A80606] dark:text-rose-400 text-xs font-bold shadow-sm hover:bg-[#A80606] hover:text-white transition cursor-pointer"
        >
          Mừng Cưới
        </button>
      </div>
    </section>
  );
}
