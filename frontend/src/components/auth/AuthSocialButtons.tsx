'use client';

import React from 'react';

interface AuthSocialButtonsProps {
  authMode: 'login' | 'register';
}

/**
 * AuthSocialButtons Component
 * Purpose: Cung cấp các nút đăng nhập/đăng ký nhanh 1 chạm qua Google và Apple kèm vạch phân cách.
 * Props:
 *  - authMode: Chế độ xác thực hiện tại ('login' | 'register').
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function AuthSocialButtons({ authMode }: AuthSocialButtonsProps) {
  const actionPrefix = authMode === 'login' ? 'Đăng nhập' : 'Đăng ký';

  return (
    <div className="space-y-2.5 mb-3.5">
      {/* Social Provider Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Google 1-Click Sign-in */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#32374d] bg-white dark:bg-[#202334] hover:bg-surface-container-low dark:hover:bg-[#282d42] hover:border-gray-300 dark:hover:border-slate-500 text-on-surface dark:text-white font-semibold text-xs transition-all duration-150 shadow-sm group cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              fill="#4285F4"
            />
            <path
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              fill="#34A853"
            />
            <path
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              fill="#FBBC05"
            />
            <path
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              fill="#EA4335"
            />
          </svg>
          <span className="truncate">{actionPrefix} Google</span>
        </button>

        {/* Apple 1-Click Sign-in */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#32374d] bg-white dark:bg-[#202334] hover:bg-surface-container-low dark:hover:bg-[#282d42] hover:border-gray-300 dark:hover:border-slate-500 text-on-surface dark:text-white font-semibold text-xs transition-all duration-150 shadow-sm group cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-black dark:text-white shrink-0 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.91.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.81 1.02.08 2.05-.49 2.68-1.26z" />
          </svg>
          <span className="truncate">{actionPrefix} Apple</span>
        </button>
      </div>

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-2.5">
        <div className="w-full h-px bg-surface-container-highest dark:bg-[#2b2f42]"></div>
        <span className="absolute bg-white dark:bg-[#161824] px-2.5 text-[10px] font-bold uppercase tracking-wider text-outline/80 dark:text-slate-400">
          Hoặc bằng email / số điện thoại
        </span>
      </div>
    </div>
  );
}
