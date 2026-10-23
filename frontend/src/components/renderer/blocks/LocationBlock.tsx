import React from 'react';
import { LocationBlockProps } from '@/types/schema';

/**
 * LocationBlock Component
 * Purpose: Khung hiển thị khối địa điểm tổ chức tiệc cưới và bản đồ
 * Props: LocationBlockProps
 * Key States: Không có (skeleton)
 */
export default function LocationBlock(props: LocationBlockProps) {
  const { ceremonyVenue = 'Trung tâm Tiệc cưới', address = 'Địa chỉ sảnh tiệc' } = props;

  return (
    <section className="w-full py-8 px-4 text-center">
      {/* Venue Header Section */}
      <h2 className="text-lg font-serif text-neutral-800 mb-2">{ceremonyVenue}</h2>
      <p className="text-xs text-neutral-600 mb-4">{address}</p>

      {/* Map Action Button Skeleton */}
      <div className="w-full max-w-sm mx-auto h-24 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-center">
        <span className="text-xs text-neutral-400">Khung Bản Đồ / Chỉ Đường</span>
      </div>
    </section>
  );
}
