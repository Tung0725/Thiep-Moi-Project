'use client';

import React, { useState } from 'react';
import { GalleryBlockProps } from '@/types/schema';

/**
 * GalleryBlock Component
 * Purpose: Hiển thị Album ảnh cưới dạng lưới và cửa sổ phóng to ảnh chi tiết (Lightbox).
 * Props: GalleryBlockProps
 * Key States:
 *   - selectedImage: URL ảnh đang mở ở chế độ phóng to, null nếu đang đóng.
 */
export default function GalleryBlock({
  title = 'Album Ảnh Cưới',
  subtitle = 'Khoảnh khắc ngọt ngào ghi dấu tình yêu đôi lứa',
  images = [],
}: GalleryBlockProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <section id="album-anh" className="w-full py-10 sm:py-16 px-4 sm:px-6">
      {/* 1. Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="font-greatvibes text-4xl sm:text-6xl text-[#A80606] dark:text-rose-400 tracking-wide">
          {title}
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
        <div className="w-16 h-0.5 bg-[#A80606]/30 mx-auto mt-2" />
      </div>

      {/* 2. Photo Gallery Grid */}
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImage(imgUrl)}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-neutral-100 cursor-pointer border border-rose-100 dark:border-rose-950"
          >
            <img
              src={imgUrl}
              alt={`Ảnh cưới ${idx + 1}`}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">zoom_in</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Lightbox Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={selectedImage}
              alt="Ảnh phóng to"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
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
