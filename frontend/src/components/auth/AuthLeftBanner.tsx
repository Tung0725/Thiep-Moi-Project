'use client';

import React from 'react';

/**
 * AuthLeftBanner Component
 * Purpose: Cột hiển thị hình ảnh thương hiệu và trải nghiệm cảm xúc lãng mạn bên trái của trang đăng nhập/đăng ký.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function AuthLeftBanner() {
  return (
    <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full flex flex-col justify-between p-7 sm:p-10 overflow-hidden bg-[#11131c]">
      {/* Background Wedding Editorial Photography */}
      <img
        alt="Romantic elegant wedding couple"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 ease-out"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVd89CemqFXXD2eVn26SrSzQNCKBYdw1_jiMFej5QQuzYQQTBN8fs0VC-8WiaHAgOZ1IpdDw9Xrgc1BW0PF-LFdMAkTQ5J-kPgQGMKyZM1NLPRkRh3YytIycTmXne3s3nY6xC0OZ_rOZMT0nqeB0m1QW-SXQTTDMHRJNqip-oZAESslAYW1XRlRM7qLEZAG8xca_ZqlTZMMtB-0KmVcJPNLTq3msTBYCxFBD1V9JsGyQEiaWjtdHuvDA"
      />

      {/* Cinematic Dual Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 dark:from-[#161824] dark:via-black/50 dark:to-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#161824]/80 hidden lg:block"></div>

    

      {/* Bottom Editorial Caption & Social Proof */}
      <div className="relative z-10 mt-auto pt-10 text-left space-y-2.5">
        <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 space-y-2">
          <p className="text-sm font-medium text-white/95 drop-shadow-sm leading-relaxed italic">
            &ldquo;Từng nét chữ, từng khung hình – Gửi gắm trọn vẹn yêu thương cho ngày hạnh phúc.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
