import React from 'react';

/**
 * HomePage Component
 * Purpose: Màn hình trang chủ hiển thị danh sách các mẫu thiệp có sẵn trong kho (Template Catalog)
 */
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Catalog Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">Kho Mẫu Thiệp Mời</h1>
        <p className="text-sm text-neutral-500 mt-1">Chọn mẫu thiệp cưới phù hợp nhất với phong cách của bạn</p>
      </header>

      {/* Template Grid Container Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="h-64 rounded-2xl bg-neutral-100 border border-neutral-200 animate-pulse" />
        <div className="h-64 rounded-2xl bg-neutral-100 border border-neutral-200 animate-pulse" />
        <div className="h-64 rounded-2xl bg-neutral-100 border border-neutral-200 animate-pulse" />
      </section>
    </main>
  );
}
