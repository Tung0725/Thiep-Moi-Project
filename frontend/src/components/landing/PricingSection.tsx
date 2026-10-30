'use client';

import React, { useState } from 'react';

/**
 * PricingSection Component
 * Purpose: Bảng giá dịch vụ 3 gói (BASIC, PRO SPECIAL, VIP) tinh tế, chuẩn tỷ lệ meHappy với bộ chuyển đổi Tự thiết kế / Trọn gói.
 * Props: Không yêu cầu props.
 * Key States:
 *  - pricingMode: Hình thức ('self' | 'agency').
 */
export default function PricingSection() {
  const [pricingMode, setPricingMode] = useState<'self' | 'agency'>('self');

  return (
    <section className="w-full py-14 md:py-20 bg-white dark:bg-[#0b0d13] border-b border-[#eeeeee] dark:border-[#242838]" id="bang-gia">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
            Bảng giá <span className="text-mh-primary">phù hợp mọi nhu cầu</span>
          </h2>
          <p className="text-[14px] md:text-base text-[#555555] dark:text-slate-400 max-w-xl">
            Bắt đầu tạo và chia sẻ thiệp hoàn toàn miễn phí, nâng cấp khi bạn muốn mở rộng thời gian lưu trữ và hiệu ứng cao cấp.
          </p>

          {/* Pricing Mode Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#f4f4f5] dark:bg-[#161824] border border-[#eeeeee] dark:border-[#2d3142] mt-4">
            <button
              type="button"
              onClick={() => setPricingMode('self')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                pricingMode === 'self'
                  ? 'bg-white dark:bg-mh-primary text-[#2d2d2d] dark:text-white shadow-sm'
                  : 'text-[#71717a] dark:text-slate-400 hover:text-[#2d2d2d]'
              }`}
            >
              Tự thiết kế online
            </button>
            <button
              type="button"
              onClick={() => setPricingMode('agency')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                pricingMode === 'agency'
                  ? 'bg-white dark:bg-mh-primary text-[#2d2d2d] dark:text-white shadow-sm'
                  : 'text-[#71717a] dark:text-slate-400 hover:text-[#2d2d2d]'
              }`}
            >
              Thiết kế trọn gói A-Z
            </button>
          </div>
        </div>

        {/* 3 Tier Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Tier 1: BASIC (Miễn phí) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#161824] border border-[#eeeeee] dark:border-[#2d3142] shadow-sm hover:shadow transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#f4f4f5] dark:bg-[#222536] text-[12px] font-bold text-[#2d2d2d] dark:text-slate-200">
                  CƠ BẢN
                </span>
                <span className="text-[12px] font-semibold text-[#71717a] dark:text-slate-400">
                  Miễn phí
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-[#2d2d2d] dark:text-white">
                BASIC
              </h3>
              <p className="text-[13px] text-[#555555] dark:text-slate-400 mt-1">
                Phù hợp cho các buổi tiệc nhỏ &amp; thông báo tin vui
              </p>
              <div className="my-6">
                <span className="text-[32px] font-extrabold text-[#2d2d2d] dark:text-white">
                  0đ
                </span>
                <span className="text-[12px] text-[#71717a] dark:text-slate-400 block mt-0.5">
                  Tạo và chia sẻ không giới hạn
                </span>
              </div>
              <ul className="flex flex-col gap-3 text-[13px] text-[#2d2d2d] dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Kho mẫu thiệp cơ bản đa dạng</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Lưu trữ thiệp 6 tháng</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Nhận tối đa 50 lượt xác nhận RSVP</span>
                </li>
                <li className="flex items-center gap-2 text-[#999999] dark:text-slate-500">
                  <span className="material-symbols-outlined text-[17px]">close</span>
                  <span>Tích hợp mã QR mừng cưới</span>
                </li>
                <li className="flex items-center gap-2 text-[#999999] dark:text-slate-500">
                  <span className="material-symbols-outlined text-[17px]">close</span>
                  <span>Hiệu ứng mở sáp độc quyền</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="#kho-thiep"
                className="block w-full py-3 text-center rounded-full border border-mh-border dark:border-[#2d3142] text-[#2d2d2d] dark:text-slate-200 hover:border-mh-primary hover:text-mh-primary text-[14px] font-semibold transition-colors"
              >
                Tạo thiệp miễn phí
              </a>
            </div>
          </div>

          {/* Tier 2: PRO SPECIAL (Phổ biến nhất) */}
          <div className="relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#161824] border-2 border-mh-primary shadow-md hover:shadow-lg transition-all lg:-translate-y-2">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-mh-primary text-white text-[11px] font-bold shadow-sm whitespace-nowrap">
              Gói Phổ Biến Nhất
            </div>
            <div>
              <div className="flex items-center justify-between mb-3 pt-1">
                <span className="px-3 py-1 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-[12px] font-bold text-mh-primary">
                  PRO
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold">
                  Tiết kiệm 50%
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-[#2d2d2d] dark:text-white">
                PRO SPECIAL
              </h3>
              <p className="text-[13px] text-[#555555] dark:text-slate-400 mt-1">
                Lựa chọn lý tưởng cho hơn 90% cặp đôi
              </p>
              <div className="my-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-extrabold text-mh-primary">
                    190.000đ
                  </span>
                  <span className="text-[13px] text-[#999999] line-through">
                    380.000đ
                  </span>
                </div>
                <span className="text-[12px] text-[#71717a] dark:text-slate-400 block mt-0.5">
                  Thanh toán 1 lần — Dùng trọn vẹn
                </span>
              </div>
              <ul className="flex flex-col gap-3 text-[13px] text-[#2d2d2d] dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Mở khóa toàn bộ mẫu PRO sang trọng</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Lưu trữ thiệp an toàn 2 năm</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>RSVP không giới hạn khách mời</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Mừng cưới qua VietQR &amp; ví điện tử</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-mh-primary">check_circle</span>
                  <span>Nhạc nền lãng mạn &amp; hoa rơi sống động</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="#kho-thiep"
                className="block w-full py-3 text-center rounded-full bg-mh-primary hover:bg-mh-primary-hover text-white text-[14px] font-bold shadow transition-all"
              >
                Chọn gói PRO ngay
              </a>
            </div>
          </div>

          {/* Tier 3: VIP LUXURY */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#161824] border border-[#eeeeee] dark:border-[#2d3142] shadow-sm hover:shadow transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[12px] font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">workspace_premium</span> VIP
                </span>
                <span className="text-[12px] font-semibold text-[#71717a] dark:text-slate-400">
                  Trọn đời
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-[#2d2d2d] dark:text-white">
                VIP LUXURY
              </h3>
              <p className="text-[13px] text-[#555555] dark:text-slate-400 mt-1">
                Trải nghiệm cao cấp và lưu niệm vĩnh viễn
              </p>
              <div className="my-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-extrabold text-[#2d2d2d] dark:text-white">
                    290.000đ
                  </span>
                  <span className="text-[13px] text-[#999999] line-through">
                    590.000đ
                  </span>
                </div>
                <span className="text-[12px] text-[#71717a] dark:text-slate-400 block mt-0.5">
                  Lưu giữ kỷ niệm ngày cưới vĩnh viễn
                </span>
              </div>
              <ul className="flex flex-col gap-3 text-[13px] text-[#2d2d2d] dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-500">check_circle</span>
                  <span><strong>Lưu trữ vĩnh viễn trọn đời</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-500">check_circle</span>
                  <span>Mở khóa 100% thư viện mẫu VIP</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-500">check_circle</span>
                  <span>Tên miền riêng (vd: tuankiet.loiyeuthuong.vn)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-500">check_circle</span>
                  <span>Hiệu ứng mở phong bì sáp vàng dập nổi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-500">check_circle</span>
                  <span>Hỗ trợ thiết kế &amp; chỉnh sửa riêng 1-1</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="#kho-thiep"
                className="block w-full py-3 text-center rounded-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:opacity-90 text-[14px] font-semibold transition-opacity"
              >
                Nâng cấp VIP ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
