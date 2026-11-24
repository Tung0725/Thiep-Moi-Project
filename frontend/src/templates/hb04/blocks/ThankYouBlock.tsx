'use client';

import React, { useState } from 'react';
import { ThankYouBlockProps } from '@/types/schema';

/**
 * ThankYouBlock Component
 * Purpose: Hiển thị khối tri ân cuối thiệp tràn viền cao 526px chuẩn 1:1 mẫu meHappy HB04 (#145):
 *   - Ảnh cưới khổ dọc phủ toàn khung với lớp phủ màu đen bán trong suốt (overlayColor: #000000).
 *   - Dòng chữ thư pháp "Thank You" (GreatVibes 70px màu trắng) và lời cảm ơn (Source Sans Pro 17px màu trắng) nổi bật chính giữa.
 * Props: ThankYouBlockProps
 * Key States:
 *   - lightboxSrc: Đường dẫn ảnh đang phóng to.
 */
export default function ThankYouBlock({
  title = 'Thank You',
  message = 'Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ. Sự hiện diện và yêu thương của mọi người là món quà quý giá nhất.',
  imageUrl = '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
}: ThankYouBlockProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <section className="relative w-full h-[526px] bg-white overflow-hidden">
      {/* 1. Full-Bleed Background Portrait + Dark Overlay */}
      <div
        onClick={() => imageUrl && setLightboxSrc(imageUrl)}
        className="absolute top-0 -left-[30px] w-[calc(100%+60px)] h-[524px] overflow-hidden cursor-pointer bg-neutral-900"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Thank You"
            data-photo-slot="thankyou-bg"
            style={{
              width: '100%',
              height: '131.74%',
              left: '0%',
              top: '-1.93%',
            }}
            className="absolute max-w-none object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
      </div>

      {/* 2. Centered White Calligraphy Title & Appreciation Quote */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-[228px] px-[17px] text-center pointer-events-none">
        <h2 className="font-greatvibes text-[70px] leading-[1.1] text-white font-normal">
          {title}
        </h2>
        <p className="font-sourcesans text-[17px] leading-[1.45] text-white mt-[18px] max-w-[366px]">
          &ldquo;{message}&rdquo;
        </p>
      </div>

      {/* 3. Lightbox Modal */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxSrc}
            alt="Thank You phóng to"
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
