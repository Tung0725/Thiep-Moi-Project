import React from 'react';
import { HeroBlockProps } from '@/types/schema';

/**
 * HeroBlock Component
 * Purpose: Khung hiển thị khối mở đầu (ảnh bìa, tên cô dâu chú rể, ngày cưới)
 * Props: HeroBlockProps
 * Key States: Không có (stateless presentation)
 */
export default function HeroBlock(props: HeroBlockProps) {
  const { brideName, groomName, eventDate } = props;

  return (
    <section className="w-full py-12 px-4 text-center">
      {/* Hero Cover Frame Skeleton */}
      <div className="w-full max-w-sm mx-auto aspect-[3/4] bg-neutral-100 rounded-2xl flex items-center justify-center border border-neutral-200">
        <span className="text-xs text-neutral-400">Khung Ảnh Bìa Thiệp</span>
      </div>

      {/* Couple Names Section */}
      <div className="mt-6 space-y-1">
        <h1 className="text-2xl font-serif text-neutral-800">
          {groomName || 'Chú rể'} & {brideName || 'Cô dâu'}
        </h1>
        {eventDate && <p className="text-xs text-neutral-500">{eventDate}</p>}
      </div>
    </section>
  );
}
