'use client';

import React from 'react';

/**
 * SocialProofSection Component
 * Purpose: Hiển thị các chỉ số thống kê ấn tượng và bảo chứng từ các tạp chí, studio cưới danh tiếng.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function SocialProofSection() {
  return (
    <section className="w-full bg-surface-container-lowest dark:bg-[#0b0d13] py-space-xl shadow-sm dark:border-b dark:border-[#2d3142]/60 transition-colors">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
        {/* High Impact Statistical Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-lg mb-space-xl pb-space-lg">
          {/* Metric 1 */}
          <div className="flex flex-col items-center text-center p-space-sm rounded-2xl bg-surface-container-low/70 dark:bg-[#161824] dark:border dark:border-[#2d3142]/60 transition-colors">
            <span className="font-display text-headline-xl md:text-display font-extrabold text-primary">
              65.000+
            </span>
            <span className="font-label-lg text-label-lg text-on-surface dark:text-white font-semibold mt-1">
              Cặp đôi tin cậy
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
              Gửi gắm ngày trọng đại
            </span>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col items-center text-center p-space-sm rounded-2xl bg-surface-container-low/70 dark:bg-[#161824] dark:border dark:border-[#2d3142]/60 transition-colors">
            <span className="font-display text-headline-xl md:text-display font-extrabold text-primary">
              1.8 Triệu+
            </span>
            <span className="font-label-lg text-label-lg text-on-surface dark:text-white font-semibold mt-1">
              Lượt khách mời mở thiệp
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
              Tương tác mượt mà tức thì
            </span>
          </div>

          {/* Metric 3 */}
          <div className="flex flex-col items-center text-center p-space-sm rounded-2xl bg-surface-container-low/70 dark:bg-[#161824] dark:border dark:border-[#2d3142]/60 transition-colors">
            <span className="font-display text-headline-xl md:text-display font-extrabold text-primary">
              99.8%
            </span>
            <span className="font-label-lg text-label-lg text-on-surface dark:text-white font-semibold mt-1">
              Tỷ lệ hài lòng tuyệt đối
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
              Dựa trên phản hồi người dùng
            </span>
          </div>

          {/* Metric 4 */}
          <div className="flex flex-col items-center text-center p-space-sm rounded-2xl bg-surface-container-low/70 dark:bg-[#161824] dark:border dark:border-[#2d3142]/60 transition-colors">
            <span className="font-display text-headline-xl md:text-display font-extrabold text-tertiary-container dark:text-amber-400 flex items-center justify-center gap-1">
              4.9{' '}
              <span
                className="material-symbols-outlined text-[32px] text-tertiary-fixed-dim dark:text-amber-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </span>
            <span className="font-label-lg text-label-lg text-on-surface dark:text-white font-semibold mt-1">
              Đánh giá 5 sao
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
              Top #1 nền tảng thiệp số
            </span>
          </div>
        </div>

        {/* Studio & Media Trust Badges */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-md pt-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-slate-400 font-bold text-center md:text-left">
            Được khuyên dùng bởi các tạp chí cưới &amp; thương hiệu hàng đầu:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-space-xl opacity-75 dark:opacity-90 grayscale hover:grayscale-0 transition-all">
            <span className="font-headline-sm font-bold text-secondary dark:text-slate-300 tracking-tight">
              MARRY<span className="text-primary font-normal">.vn</span>
            </span>
            <span className="font-headline-sm font-bold text-secondary dark:text-slate-300 tracking-wider">
              TuArt Wedding
            </span>
            <span className="font-headline-sm font-bold text-secondary dark:text-slate-300 tracking-tight">
              WEDDINGBOOK
            </span>
            <span className="font-headline-sm font-bold text-secondary dark:text-slate-300 tracking-tight">
              Kim Tuyến Bridal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
