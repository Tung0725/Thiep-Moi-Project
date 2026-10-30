'use client';

import React from 'react';
import Link from 'next/link';

/**
 * HeroSection Component
 * Purpose: Khu vực tiêu đề chính giới thiệu nền tảng tạo thiệp trực tuyến với mockup 3 điện thoại ảnh thật trang nhã, không đụng hàng.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#fff0f3] via-white to-white dark:from-[#13151f] dark:via-[#0f1117] dark:to-[#0f1117] pt-8 md:pt-14 pb-14 md:pb-20 border-b border-[#eeeeee] dark:border-[#242838]">
      {/* Background Soft Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-8 h-80 w-80 rounded-full bg-[#ff6b8a] opacity-15 blur-3xl"
      ></div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/4 h-80 w-80 rounded-full bg-[#ffc2d1] opacity-25 blur-3xl"
      ></div>

      <div className="relative max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Hero Left Content Column */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            {/* Trust Rating Badge */}
            <div className="inline-flex items-center gap-2 self-center lg:self-start px-4 py-1.5 rounded-full border border-mh-border dark:border-[#2d3142] bg-white dark:bg-[#161824] shadow-[0_2px_8px_rgba(0,0,0,0.06)] mb-4">
              <span className="h-2 w-2 rounded-full bg-mh-primary animate-pulse"></span>
              <span className="text-[13px] font-semibold text-[#2d2d2d] dark:text-slate-200">
                4.9/5 ★ Hơn <strong className="text-mh-primary font-bold">65.000+</strong> cặp đôi đã tin dùng
              </span>
            </div>

            {/* Main Headline with 2 Distinct Lines */}
            <h1 className="font-extrabold tracking-tight">
              <span className="block text-[32px] sm:text-[40px] lg:text-[46px] text-[#2d2d2d] dark:text-white leading-[1.2]">
                Tạo Thiệp Cưới &amp; Sự Kiện Online
              </span>
              <span className="block text-[24px] sm:text-[32px] lg:text-[36px] text-mh-primary font-bold mt-1.5 leading-[1.25]">
                Miễn phí chỉ trong vài phút
              </span>
            </h1>

            {/* Subtitle Description */}
            <div className="max-w-xl mt-4">
              <p className="text-[15px] font-bold text-[#2d2d2d] dark:text-slate-200">
                Thiệp cưới, sinh nhật, tân gia, sự kiện — Tất cả trong 1 nơi.
              </p>
              <p className="text-[14px] text-[#555555] dark:text-slate-400 mt-1.5 leading-relaxed">
                Không cần kỹ năng thiết kế — chỉ vài thao tác đơn giản là có thiệp đẹp! Tích hợp quản lý RSVP, bản đồ chỉ đường và mừng cưới QR tự động.
              </p>
            </div>

            {/* Dual Pill CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-6 w-full sm:w-auto">
              <a
                href="#kho-thiep"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mh-primary hover:bg-mh-primary-hover text-white text-[15px] font-bold px-7 py-3.5 rounded-full shadow-sm hover:shadow transition-all"
              >
                <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                <span>Tạo thiệp Miễn Phí ngay</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <a
                href="#kho-thiep"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#161824] border border-mh-border dark:border-[#2d3142] text-[#2d2d2d] dark:text-slate-200 hover:border-mh-primary hover:text-mh-primary text-[15px] font-semibold px-7 py-3.5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[19px] text-mh-primary">visibility</span>
                <span>Xem mẫu thiệp</span>
              </a>
            </div>

            {/* Core Value Checkmarks */}
            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-6 text-[13px] text-[#555555] dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="text-mh-primary font-bold">✓</span> Hoàn toàn miễn phí
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-mh-primary font-bold">✓</span> Không cần tải app
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-mh-primary font-bold">✓</span> Chỉnh sửa tức thì 24/7
              </li>
            </ul>
          </div>

          {/* Hero Right Visual Column - 3-Phone Showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[560px] flex items-center justify-center">
              {/* Floating Top Badge */}
              <div className="absolute -top-3 left-4 sm:left-8 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-[#161824]/95 border border-mh-border/80 dark:border-[#2d3142] backdrop-blur-md px-3.5 py-1.5 text-[12px] font-semibold text-mh-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <span className="material-symbols-outlined text-[15px]">devices</span>
                <span>Hoàn hảo trên mọi thiết bị</span>
              </div>

              {/* 3-Phones Mockup Image */}
              <div className="relative w-full overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src="/images/wedding-phones-showcase.png"
                  alt="Trọn bộ 3 màn hình thiệp cưới trực tuyến trên điện thoại: Album cưới, Lễ thành hôn và Lời chúc mừng"
                  className="w-full h-auto object-contain select-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.08)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
