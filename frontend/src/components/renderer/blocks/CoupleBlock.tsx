'use client';

import React from 'react';
import { CoupleBlockProps } from '@/types/schema';

/**
 * CoupleBlock Component
 * Purpose: Hiển thị khối Giới thiệu Cô Dâu & Chú Rể và Song Thân Phụ Mẫu chuẩn thiết kế meHappy HB04:
 *   - "Save The Date" dùng font chữ uốn lượn GreatVibes.
 *   - "Nhà Trai" & "Nhà Gái" dùng font thư pháp UVNHoaTay1 màu đỏ thắm (#A80606).
 *   - 2 khung ảnh chân dung dâu rể sóng đôi cạnh nhau, tên thư pháp GreatVibes, kèm lời ngỏ tình yêu ngọt ngào.
 * Props: CoupleBlockProps
 * Key States: Không có (stateless presentation)
 */
export default function CoupleBlock({
  groom,
  bride,
  quote = 'Hôn nhân không phải là nơi thuyền tình cập bến, mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.',
  sectionTitle = 'Chú Rể & Cô Dâu',
}: CoupleBlockProps) {
  return (
    <div id="save-the-date" className="w-full flex flex-col gap-10 py-10 px-4 sm:px-6">
      {/* 1. Save The Date & Two Families Section */}
      <section className="max-w-2xl mx-auto w-full text-center">
        {/* Grand Calligraphy Title */}
        <h2 className="font-greatvibes text-4xl sm:text-6xl text-[#A80606] dark:text-rose-400 mb-1 tracking-wide animate-bounce-in-down">
          Save The Date
        </h2>
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          For The Wedding Of
        </p>
        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200 mb-8">
          Ngày 25 Tháng 12 Năm 2026
        </p>

        {/* Two Families Cards (Nhà Trai vs Nhà Gái) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          {/* Nhà Trai */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161824] border border-rose-100 dark:border-rose-950 shadow-sm flex flex-col items-center">
            <span className="font-hoatay text-2xl sm:text-3xl text-[#A80606] dark:text-rose-400 mb-2">
              Nhà Trai
            </span>
            <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
              <p className="font-bold text-neutral-900 dark:text-white">
                Chú Rể: {groom.name}
              </p>
              {groom.fatherName && <p>Ông: {groom.fatherName}</p>}
              {groom.motherName && <p>Bà: {groom.motherName}</p>}
              {groom.address && (
                <p className="text-[11px] text-neutral-400 pt-1 italic max-w-xs">
                  {groom.address}
                </p>
              )}
            </div>
          </div>

          {/* Nhà Gái */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161824] border border-rose-100 dark:border-rose-950 shadow-sm flex flex-col items-center">
            <span className="font-hoatay text-2xl sm:text-3xl text-[#A80606] dark:text-rose-400 mb-2">
              Nhà Gái
            </span>
            <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
              <p className="font-bold text-neutral-900 dark:text-white">
                Cô Dâu: {bride.name}
              </p>
              {bride.fatherName && <p>Ông: {bride.fatherName}</p>}
              {bride.motherName && <p>Bà: {bride.motherName}</p>}
              {bride.address && (
                <p className="text-[11px] text-neutral-400 pt-1 italic max-w-xs">
                  {bride.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Chú Rể & Cô Dâu Side-by-Side Portraits */}
      <section className="max-w-2xl mx-auto w-full pt-6 border-t border-rose-100 dark:border-rose-950/60">
        <div className="text-center mb-6">
          <h3 className="font-greatvibes text-3xl sm:text-5xl text-[#A80606] dark:text-rose-400 mb-2">
            {sectionTitle}
          </h3>
          <p className="text-xs italic text-neutral-500 dark:text-neutral-400 max-w-md mx-auto px-4">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Portraits Grid with Center Heart Icon */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Groom Portrait */}
          <div className="flex flex-col items-center text-center animate-bounce-in-left">
            <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-neutral-800 bg-neutral-100 mb-3">
              <img
                src={groom.photoUrl || '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp'}
                alt={groom.name}
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="font-greatvibes text-3xl sm:text-4xl text-[#A80606] dark:text-rose-400">
              {groom.name}
            </span>
            {groom.storyQuote && (
              <p className="text-[11px] sm:text-xs italic text-neutral-500 dark:text-neutral-400 max-w-xs mt-1.5 px-2">
                &ldquo;{groom.storyQuote}&rdquo;
              </p>
            )}
          </div>

          {/* Center Pulsing Heart (Visible on desktop between the two portraits) */}
          <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
            <span className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 shadow-md text-rose-500 flex items-center justify-center border border-rose-200 dark:border-rose-900/50 animate-pulse-heart">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </span>
          </div>

          {/* Bride Portrait */}
          <div className="flex flex-col items-center text-center animate-bounce-in-right">
            <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-neutral-800 bg-neutral-100 mb-3">
              <img
                src={bride.photoUrl || '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp'}
                alt={bride.name}
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="font-greatvibes text-3xl sm:text-4xl text-[#A80606] dark:text-rose-400">
              {bride.name}
            </span>
            {bride.storyQuote && (
              <p className="text-[11px] sm:text-xs italic text-neutral-500 dark:text-neutral-400 max-w-xs mt-1.5 px-2">
                &ldquo;{bride.storyQuote}&rdquo;
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
