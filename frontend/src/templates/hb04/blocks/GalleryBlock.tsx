'use client';

import React, { useState } from 'react';
import { GalleryBlockProps } from '@/types/schema';
import { ScrollReveal } from '@/components/common/ScrollReveal';

/**
 * GalleryBlock Component
 * Purpose: Hiển thị Album Ảnh Cưới chuẩn 1:1 mẫu meHappy HB04 (#145):
 *   - Tiêu đề "Album Ảnh Cưới" dùng font GreatVibes 45px màu đen than (#333333).
 *   - Lưới 2 cột khung ảnh dọc sắc nét tỷ lệ 183x276px (không bo góc, không viền hồng), hiệu ứng nảy đối xứng hai bên khi cuộn tới, bấm mở Lightbox.
 * Props: GalleryBlockProps
 * Key States:
 *   - selectedImage: Đường dẫn ảnh đang mở trong cửa sổ phóng to Lightbox.
 */
export default function GalleryBlock({
  title = 'Album Ảnh Cưới',
  images = [],
}: GalleryBlockProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <section id="album-anh" className="w-full bg-white text-[#333333] pt-[64px] pb-[20px] px-[12px]">
      {/* 1. Section Heading */}
      <ScrollReveal effect="fadeInDown" duration={1} className="text-center mb-[28px]">
        <h2 className="font-greatvibes text-[45px] leading-[1.3] text-[#333333] font-normal">
          {title}
        </h2>
      </ScrollReveal>

      {/* 2. 2-Column Sharp Portrait Grid (183x276px cells) */}
      <div className="w-full grid grid-cols-2 gap-x-[9px] gap-y-[10px]">
        {images.map((imgUrl, idx) => {
          const isLeft = idx % 2 === 0;
          const rowIdx = Math.floor(idx / 2);
          const duration = Math.min(1, 0.6 + rowIdx * 0.1);

          return (
            <ScrollReveal
              key={idx}
              effect={isLeft ? 'bounceInLeft' : 'bounceInRight'}
              duration={duration}
            >
              <div
                onClick={() => setSelectedImage(imgUrl)}
                className="relative w-full h-[276px] overflow-hidden bg-neutral-100 cursor-pointer group"
              >
                <img
                  src={imgUrl}
                  alt={`Ảnh cưới ${idx + 1}`}
                  data-photo-slot={`gallery-${idx}`}
                  className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* 3. Lightbox Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Ảnh phóng to"
              className="max-w-[92vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
              aria-label="Đóng xem ảnh"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
