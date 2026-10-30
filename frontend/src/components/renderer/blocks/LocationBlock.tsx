'use client';

import React from 'react';
import { LocationBlockProps } from '@/types/schema';

/**
 * LocationBlock Component
 * Purpose: Hiển thị thông tin địa điểm tổ chức tiệc cưới, thời gian khai tiệc và nút dẫn đường Google Maps.
 * Props: LocationBlockProps
 * Key States: Không có (stateless presentation)
 */
export default function LocationBlock({
  ceremonyVenue = 'Trung Tâm Tiệc Cưới Riverside Palace',
  address = '360D Bến Vân Đồn, Phường 1, Quận 4, TP. Hồ Chí Minh',
  eventTime = '11:30 - Thứ Hai, 28/12/2026',
  mapUrl,
}: LocationBlockProps) {
  const defaultMapQuery = encodeURIComponent(`${ceremonyVenue} ${address}`);
  const mapsDestination = mapUrl || `https://www.google.com/maps/search/?api=1&query=${defaultMapQuery}`;

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 text-center">
      {/* Location Card Frame */}
      <div className="max-w-[340px] sm:max-w-[500px] md:max-w-[560px] mx-auto p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-black/40 border border-current/15 shadow-md space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-current/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px] text-current">location_on</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-current">{ceremonyVenue}</h2>
          <p className="text-xs sm:text-sm md:text-base font-medium text-current/85 leading-relaxed">{address}</p>
        </div>

        {eventTime && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-current/5 text-xs sm:text-sm font-semibold text-current">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>{eventTime}</span>
          </div>
        )}

        {/* Google Maps External Action Button */}
        <div className="pt-2">
          <a
            href={mapsDestination}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-current text-white dark:text-black text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ color: '#fff' }}
          >
            <span className="material-symbols-outlined text-[18px]">near_me</span>
            <span>Chỉ Đường Trên Google Maps</span>
          </a>
        </div>
      </div>
    </section>
  );
}
