'use client';

import React, { useState } from 'react';
import { EventsBlockProps } from '@/types/schema';

/**
 * EventsBlock Component
 * Purpose: Hiển thị lịch trình Sự Kiện Cưới chuẩn thiết kế meHappy HB04:
 *   - Tiêu đề "Sự Kiện Cưới" dùng font thư pháp GreatVibes màu đỏ thắm (#A80606).
 *   - Các tab chuyển đổi nhanh Nhà Trai / Nhà Gái.
 *   - Tên từng sự kiện dùng font thư pháp UVNHoaTay1.
 *   - Hình minh họa lễ cưới chuẩn meHappy.
 * Props: EventsBlockProps
 * Key States:
 *   - activeTab: Tab đang xem ('GROOM' | 'BRIDE').
 */
export default function EventsBlock({
  title = 'Sự Kiện Cưới',
  groomEvents = [],
  brideEvents = [],
}: EventsBlockProps) {
  const [activeTab, setActiveTab] = useState<'GROOM' | 'BRIDE'>('GROOM');

  const currentEvents = activeTab === 'GROOM' ? groomEvents : brideEvents;

  return (
    <section id="su-kien-cuoi" className="w-full py-10 sm:py-16 px-4 sm:px-6">
      {/* 1. Section Heading */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="font-greatvibes text-4xl sm:text-6xl text-[#A80606] dark:text-rose-400 tracking-wide">
          {title}
        </h2>
        <div className="w-16 h-0.5 bg-[#A80606]/30 mx-auto mt-2" />
      </div>

      {/* 2. House Selector Tabs */}
      <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
        <button
          type="button"
          onClick={() => setActiveTab('GROOM')}
          className={`px-7 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
            activeTab === 'GROOM'
              ? 'bg-[#A80606] text-white shadow-md scale-105'
              : 'bg-white dark:bg-[#161824] text-neutral-600 dark:text-neutral-300 hover:text-[#A80606] border border-rose-200 dark:border-rose-950'
          }`}
        >
          Nhà Trai
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BRIDE')}
          className={`px-7 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
            activeTab === 'BRIDE'
              ? 'bg-[#A80606] text-white shadow-md scale-105'
              : 'bg-white dark:bg-[#161824] text-neutral-600 dark:text-neutral-300 hover:text-[#A80606] border border-rose-200 dark:border-rose-950'
          }`}
        >
          Nhà Gái
        </button>
      </div>

      {/* 3. Event Cards Grid */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6 sm:gap-8">
        {currentEvents.map((event, index) => (
          <div
            key={index}
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161824] border border-rose-100 dark:border-rose-950 shadow-sm flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left transition hover:shadow-md"
          >
            {/* Event Illustration Icon */}
            {event.illustrationUrl ? (
              <img
                src={event.illustrationUrl}
                alt={event.title}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#A80606] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[32px]">celebration</span>
              </div>
            )}

            {/* Event Info */}
            <div className="space-y-1.5 flex-1">
              <h3 className="font-hoatay text-2xl sm:text-3xl text-[#A80606] dark:text-rose-400">
                {event.title}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-100">
                {event.timeText} &bull; {event.dateText}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                {event.locationName}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                {event.address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
