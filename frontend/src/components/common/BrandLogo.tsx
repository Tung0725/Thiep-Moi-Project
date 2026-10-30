'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'default' | 'white';
  className?: string;
  href?: string;
}

/**
 * BrandLogo Component
 * Purpose: Logo chính thức độc bản của dự án "loiyeuthuong" (Lời Yêu Thương) với biểu tượng trái tim vô cực đôi cánh thư tình yêu, đồng bộ trên toàn bộ Navbar, Login, Register và Footer.
 * Props:
 *  - size: Kích thước hiển thị ('sm' | 'md' | 'lg').
 *  - showTagline: Tùy chọn hiển thị dòng chú thích phụ.
 *  - variant: Biến thể màu sắc ('default' | 'white').
 *  - href: Đường dẫn khi click (mặc định là '/').
 */
export default function BrandLogo({
  size = 'md',
  showTagline = true,
  variant = 'default',
  className = '',
  href = '/',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
  };

  const titleSizes = {
    sm: 'text-[15px]',
    md: 'text-[17px] sm:text-[19px]',
    lg: 'text-[22px] sm:text-[26px]',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-[11px] sm:text-[12px]',
  };

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Exclusive Brand Vector Icon (Double Intertwined Ribbon Hearts & Spark) */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#ff2056] via-[#ff4b72] to-[#ff7a97] shadow-sm shadow-[#ff2056]/30 group-hover:scale-105 transition-transform duration-200 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[68%] h-[68%] text-white drop-shadow-sm"
        >
          {/* Intertwined Heart Ribbon Mark */}
          <path
            d="M16 26.5C16 26.5 4.5 19.8 4.5 12.2C4.5 7.8 8.1 4.5 12.3 4.5C14.7 4.5 16 6 16 6C16 6 17.3 4.5 19.7 4.5C23.9 4.5 27.5 7.8 27.5 12.2C27.5 19.8 16 26.5 16 26.5Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path
            d="M16 24.5C16 24.5 6 18.5 6 12C6 8.5 8.8 5.8 12.2 5.8C14.2 5.8 15.5 6.9 16 7.6C16.5 6.9 17.8 5.8 19.8 5.8C23.2 5.8 26 8.5 26 12C26 18.5 16 24.5 16 24.5Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Sweet Words Ribbon Curve */}
          <path
            d="M11.5 12.5C13 14 14.5 15.2 16 16.5C17.5 15.2 19 14 20.5 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Golden Sparkle Star */}
          <circle cx="21.5" cy="8.5" r="1.5" fill="#FFE082" />
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 leading-none">
          <span
            className={`${titleSizes[size]} font-extrabold tracking-tight ${
              variant === 'white'
                ? 'text-white'
                : 'text-[#2d2d2d] dark:text-white group-hover:text-mh-primary transition-colors'
            }`}
          >
            loiyeuthuong
          </span>
          <span className="text-[10px] font-bold text-white bg-mh-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90 origin-left">
            .vn
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label="loiyeuthuong.vn Homepage">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
