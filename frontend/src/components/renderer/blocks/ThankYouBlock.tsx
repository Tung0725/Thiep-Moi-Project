'use client';

import React from 'react';
import { ThankYouBlockProps } from '@/types/schema';

/**
 * ThankYouBlock Component
 * Purpose: Hiển thị lời tri ân, cảm ơn chân thành của cặp đôi gửi đến toàn thể quan khách chuẩn phong cách meHappy HB04:
 *   - "Thank You" viết bằng font thư pháp uốn lượn GreatVibes màu đỏ thắm (#A80606).
 *   - Khung ảnh kỷ niệm bo cong mềm mại.
 * Props: ThankYouBlockProps
 * Key States: Không có (stateless presentation)
 */
export default function ThankYouBlock({
  title = 'Thank You',
  message = 'Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ. Sự hiện diện và yêu thương của mọi người là món quà quý giá nhất.',
  imageUrl = '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
}: ThankYouBlockProps) {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 text-center">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Optional Ending Photo */}
        {imageUrl && (
          <div className="w-full aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-neutral-800 mb-6 bg-neutral-100">
            <img
              src={imageUrl}
              alt="Thank you wedding portrait"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        )}

        {/* Section Heading */}
        <h2 className="font-greatvibes text-5xl sm:text-7xl text-[#A80606] dark:text-rose-400 tracking-wider animate-bounce-in-down">
          {title}
        </h2>

        {/* Appreciation Message */}
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic px-4">
          &ldquo;{message}&rdquo;
        </p>

        {/* Ending Ornament */}
        <div className="flex items-center justify-center gap-3 pt-3 opacity-40">
          <div className="w-12 h-[1px] bg-[#A80606]" />
          <span className="text-xs text-[#A80606]">❦</span>
          <div className="w-12 h-[1px] bg-[#A80606]" />
        </div>
      </div>
    </section>
  );
}
