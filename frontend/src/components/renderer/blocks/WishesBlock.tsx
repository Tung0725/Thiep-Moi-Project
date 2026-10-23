import React from 'react';
import { WishesBlockProps } from '@/types/schema';

/**
 * WishesBlock Component
 * Purpose: Khung hiển thị sổ lưu bút, form gửi lời chúc mừng và RSVP
 * Props: WishesBlockProps
 * Key States: Không có (skeleton)
 */
export default function WishesBlock(props: WishesBlockProps) {
  const { title = 'Sổ Lưu Bút & Lời Chúc' } = props;

  return (
    <section className="w-full py-8 px-4 text-center">
      {/* Wishes Section Header */}
      <h2 className="text-lg font-serif text-neutral-800 mb-4">{title}</h2>

      {/* Guestbook Form Frame Skeleton */}
      <div className="w-full max-w-sm mx-auto p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
        <div className="h-8 bg-white rounded border border-neutral-200" />
        <div className="h-16 bg-white rounded border border-neutral-200" />
        <div className="h-8 bg-neutral-200 rounded" />
      </div>
    </section>
  );
}
