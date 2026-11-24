'use client';

import React, { useEffect, useState } from 'react';
import { HeroBlockProps } from '@/types/schema';
import { ScrollReveal } from '@/components/common/ScrollReveal';

/**
 * HeroBlock Component
 * Purpose: Khối đầu trang chuẩn 1:1 mẫu meHappy HB04 (#145):
 *   - Tên chú rể & cô dâu dùng font GreatVibes 38px màu đen than (#333333) đối xứng qua trái tim nét vẽ tay.
 *   - Cụm "Just Married" (UVNHoaTay1 25px) kẹp giữa hai nhành lá olive cắt trực tiếp từ sprite gốc (-140deg & 50deg).
 *   - Thanh 4 liên kết điều hướng dạng chữ đỏ đô (#A80606, Quicksand 16px đậm, không đóng khung viên thuốc).
 *   - Ảnh bìa cưới tràn viền vuông vức (cao 590px, không bo góc, không phủ lớp tối, bấm mở Lightbox).
 * Props: HeroBlockProps
 * Key States:
 *   - imgError: Cờ chuyển sang ảnh mặc định khi ảnh tùy biến lỗi.
 *   - lightboxSrc: Đường dẫn ảnh đang phóng to.
 */
export default function HeroBlock({
  brideName = 'Khánh Ly',
  groomName = 'Văn Bách',
  coverImageUrl,
}: HeroBlockProps) {
  const [imgError, setImgError] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [coverImageUrl]);

  const fallbackImage =
    '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp';
  const activeCoverUrl = imgError || !coverImageUrl ? fallbackImage : coverImageUrl;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-white text-[#333333] pt-[13px] overflow-hidden select-none">
      {/* 1. Couple Calligraphy Names & Hand-drawn Heart */}
      <div className="w-full px-1 flex items-center justify-center">
        <ScrollReveal effect="bounceInLeft" duration={0.8} className="flex-1 text-right pr-1.5">
          <span className="font-greatvibes text-[38px] leading-[1.25] text-[#333333] inline-block">
            {groomName}
          </span>
        </ScrollReveal>

        <img
          src="/templates/hb04/ladi/heart-20250426031620-umpvb.png"
          alt="Trái tim"
          onClick={() => setLightboxSrc('/templates/hb04/ladi/heart-20250426031620-umpvb.png')}
          className="w-[42px] h-[49px] object-contain shrink-0 mt-1 cursor-pointer"
        />

        <ScrollReveal effect="bounceInRight" duration={0.8} className="flex-1 text-left pl-1.5">
          <span className="font-greatvibes text-[38px] leading-[1.25] text-[#333333] inline-block">
            {brideName}
          </span>
        </ScrollReveal>
      </div>

      {/* 2. "Just Married" + Cropped Olive Branches (GroupV2 250px wide) */}
      <ScrollReveal
        effect="bounceInUp"
        duration={0.9}
        className="relative w-[250px] h-[68px] mx-auto mt-[2px]"
      >
        {/* Left Olive Branch: rotate(-140deg), cropData(68.3975, 43.7574, 28.7349, 42.1622) */}
        <div
          style={{ transform: 'rotate(-140deg)' }}
          className="absolute top-[3px] left-0 w-[80px] h-[66px] overflow-hidden pointer-events-none"
        >
          <img
            src="/templates/hb04/ladi/rbg/save-the-date-20250320090251-6ae3x.png"
            alt=""
            style={{
              width: '348.01%',
              height: '237.18%',
              left: '-238.03%',
              top: '-103.78%',
            }}
            className="absolute max-w-none"
          />
        </div>

        {/* Center Calligraphy Text */}
        <div className="absolute top-[7px] left-[53px] w-[136px] text-center">
          <span className="font-hoatay text-[25px] leading-[1.4] text-[#333333]">
            Just Married
          </span>
        </div>

        {/* Right Olive Branch: rotate(50deg), cropData(68.3975, 43.7574, 28.7349, 42.1622) */}
        <div
          style={{ transform: 'rotate(50deg)' }}
          className="absolute top-0 left-[170px] w-[80px] h-[66px] overflow-hidden pointer-events-none"
        >
          <img
            src="/templates/hb04/ladi/rbg/save-the-date-20250320090251-6ae3x.png"
            alt=""
            style={{
              width: '348.01%',
              height: '237.18%',
              left: '-238.03%',
              top: '-103.78%',
            }}
            className="absolute max-w-none"
          />
        </div>
      </ScrollReveal>

      {/* 3. Inline Red Text Navigation Links (Quicksand 16px Bold, #A80606) */}
      <ScrollReveal
        effect="bounceInDown"
        duration={1}
        className="w-full px-[28px] mt-[2px] mb-[14px] flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => scrollToSection('save-the-date')}
          style={{ color: 'var(--template-primary, #A80606)' }}
          className="font-quicksand text-[16px] font-bold hover:opacity-80 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Thiệp mời
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('su-kien-cuoi')}
          style={{ color: 'var(--template-primary, #A80606)' }}
          className="font-quicksand text-[16px] font-bold hover:opacity-80 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Sự Kiện
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('album-anh')}
          style={{ color: 'var(--template-primary, #A80606)' }}
          className="font-quicksand text-[16px] font-bold hover:opacity-80 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Album
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('mung-cuoi')}
          style={{ color: 'var(--template-primary, #A80606)' }}
          className="font-quicksand text-[16px] font-bold hover:opacity-80 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Mừng Cưới
        </button>
      </ScrollReveal>

      {/* 4. Full-Bleed Rectangular Cover Portrait (460x590px clipped to 400px canvas) */}
      <div
        onClick={() => setLightboxSrc(activeCoverUrl)}
        className="relative -mx-[30px] w-[calc(100%+60px)] h-[590px] overflow-hidden cursor-pointer bg-neutral-100"
      >
        <img
          src={activeCoverUrl}
          alt={`${groomName} & ${brideName}`}
          data-photo-slot="hero-cover"
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '117%',
            left: '0%',
            top: '0%',
          }}
          className="absolute max-w-none object-cover object-top"
          loading="eager"
        />
      </div>

      {/* 5. Lightbox Zoom Modal */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxSrc}
            alt="Ảnh phóng to"
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
