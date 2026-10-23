import React from 'react';
import { CountdownBlockProps } from '@/types/schema';

/**
 * CountdownBlock Component
 * Purpose: Khung hiển thị khối đếm ngược ngày chung đôi
 * Props: CountdownBlockProps
 * Key States: Không có (skeleton)
 */
export default function CountdownBlock(props: CountdownBlockProps) {
  const { title = 'Cùng Đếm Ngược Thời Gian' } = props;

  return (
    <section className="w-full py-8 px-4 text-center">
      {/* Title Section */}
      <h2 className="text-lg font-serif text-neutral-800 mb-4">{title}</h2>

      {/* Countdown Digits Grid Skeleton */}
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <span className="text-xl font-bold text-neutral-700">00</span>
          <span className="block text-[10px] text-neutral-400">Ngày</span>
        </div>
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <span className="text-xl font-bold text-neutral-700">00</span>
          <span className="block text-[10px] text-neutral-400">Giờ</span>
        </div>
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <span className="text-xl font-bold text-neutral-700">00</span>
          <span className="block text-[10px] text-neutral-400">Phút</span>
        </div>
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <span className="text-xl font-bold text-neutral-700">00</span>
          <span className="block text-[10px] text-neutral-400">Giây</span>
        </div>
      </div>
    </section>
  );
}
