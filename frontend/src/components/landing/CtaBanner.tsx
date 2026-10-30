'use client';

import React from 'react';

/**
 * CtaBanner Component
 * Purpose: Banner kêu gọi hành động cuối trang nhẹ nhàng, ấm áp lấy cảm hứng từ meHappy.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function CtaBanner() {
  return (
    <section className="w-full py-14 md:py-20 bg-white dark:bg-[#0b0d13]">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#fff0f3] via-[#ffe8ec] to-[#fff0f3] dark:from-[#1a1320] dark:via-[#161824] dark:to-[#1a1320] border border-mh-border dark:border-[#2d3142] p-8 md:p-14 text-center shadow-sm overflow-hidden">
          {/* Decorative Subtle Ambient Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#ff2056] opacity-10 blur-3xl"
          ></div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#ff9aa6] opacity-20 blur-3xl"
          ></div>

          {/* Banner Content */}
          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white dark:bg-[#202334] text-mh-primary font-bold text-xs shadow-sm">
              <span className="material-symbols-outlined text-[15px]">favorite</span> Khởi đầu trọn vẹn hạnh phúc
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
              Sẵn sàng tạo thiệp <span className="text-mh-primary">Miễn Phí ngay!</span>
            </h2>

            <p className="text-[14px] md:text-base text-[#555555] dark:text-slate-300 max-w-xl">
              Tham gia cùng hơn 65.000+ cặp đôi đã tin tưởng loiyeuthuong cho ngày trọng đại. Trải nghiệm hoàn toàn miễn phí, không cần cài đặt.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
              <a
                href="#kho-thiep"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mh-primary hover:bg-mh-primary-hover text-white text-[15px] font-bold px-8 py-3.5 rounded-full shadow transition-all"
              >
                <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                <span>Tạo thiệp miễn phí ngay</span>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#161824] border border-mh-border dark:border-[#2d3142] text-[#2d2d2d] dark:text-slate-200 hover:border-mh-primary hover:text-mh-primary text-[15px] font-semibold px-7 py-3.5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[19px] text-mh-primary">chat</span>
                <span>Hỗ trợ qua Zalo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
