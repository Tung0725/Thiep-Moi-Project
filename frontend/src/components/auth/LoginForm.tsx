'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

/**
 * LoginForm Component
 * Purpose: Form đăng nhập loiyeuthuong.vn với bố cục đầy đặn, giữ nguyên kích thước khung thẻ không bị thu nhỏ so với trang đăng ký.
 * Props:
 *  - onSwitchToRegister: Callback chuyển sang giao diện đăng ký.
 * Key States:
 *  - identifier: Email hoặc số điện thoại.
 *  - password: Mật khẩu người dùng.
 *  - rememberMe: Tùy chọn duy trì đăng nhập.
 *  - showPassword: Trạng thái hiển thị mật khẩu.
 *  - isLoading: Trạng thái đang gọi API.
 *  - errorMessage: Thông báo lỗi xác thực từ backend.
 */
export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsUnverified(false);
    setResendMessage(null);
    setIsLoading(true);

    try {
      await authService.login({
        email: identifier.trim(),
        password,
      });
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi đăng nhập. Vui lòng thử lại.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('chưa được kích hoạt')) {
        setIsUnverified(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!identifier.trim()) return;
    try {
      await authService.resendVerification(identifier.trim());
      setResendMessage('Liên kết kích hoạt mới đã được gửi tới email của bạn.');
    } catch (err: unknown) {
      setResendMessage(err instanceof Error ? err.message : 'Không thể gửi lại email lúc này.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <form className="space-y-3.5 sm:space-y-4 max-w-md w-full mx-auto" onSubmit={handleSubmit}>
      {/* Form Header Title & Subtitle */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-on-surface dark:text-white tracking-tight">
          Đăng Nhập
        </h2>
        <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 mt-1">
          Chào mừng bạn quay trở lại với loiyeuthuong.vn
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-xs sm:text-sm font-semibold text-error space-y-1.5 animate-shake">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.2rem]">error</span>
            <span>{errorMessage}</span>
          </div>
          {isUnverified && (
            <div>
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-xs font-bold text-primary dark:text-rose-400 underline hover:opacity-80 cursor-pointer"
              >
                Nhấn vào đây để nhận lại email kích hoạt
              </button>
            </div>
          )}
          {resendMessage && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {resendMessage}
            </p>
          )}
        </div>
      )}

      {/* Email Identifier Field */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-on-surface dark:text-slate-200 mb-1.5" htmlFor="loginIdentifier">
          Email đăng nhập <span className="text-primary">*</span>
        </label>
        <input
          id="loginIdentifier"
          type="email"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="nhapemail@gmail.com"
          className="w-full px-4 py-2.5 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-on-surface dark:text-slate-200 mb-1.5" htmlFor="loginPassword">
          Mật khẩu <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <input
            id="loginPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập ít nhất 6 ký tự"
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 hover:text-primary transition p-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[1.1rem]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-slate-700 dark:bg-[#202334] accent-primary cursor-pointer"
          />
          <span className="text-xs sm:text-sm text-secondary dark:text-slate-300 font-medium">
            Ghi nhớ đăng nhập trên thiết bị này
          </span>
        </label>
        <a className="text-xs sm:text-sm font-semibold text-primary dark:text-rose-400 hover:underline" href="#">
          Quên mật khẩu?
        </a>
      </div>

      {/* Submit Login CTA Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-primary to-primary-container dark:from-rose-600 dark:to-pink-600 text-white font-display font-bold text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>Đăng Nhập Ngay</span>
            <span className="material-symbols-outlined text-[1.2rem]">
              arrow_forward
            </span>
          </>
        )}
      </button>

      {/* Switch to Register Link */}
      <div className="pt-1 text-center">
        <p className="text-xs sm:text-sm text-secondary dark:text-slate-400">
          Chưa có tài khoản loiyeuthuong?
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary dark:text-rose-400 font-bold hover:underline ml-1 cursor-pointer"
          >
            Đăng ký miễn phí ngay
          </button>
        </p>
      </div>

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-2 sm:my-2.5">
        <div className="w-full h-px bg-surface-container-highest dark:bg-[#2b2f42]"></div>
        <span className="absolute bg-white dark:bg-[#161824] px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-outline/80 dark:text-slate-400">
          Hoặc đăng nhập với
        </span>
      </div>

      {/* Google 1-Click Sign-in Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#32374d] bg-white dark:bg-[#202334] hover:bg-surface-container-low dark:hover:bg-[#282d42] hover:border-gray-300 dark:hover:border-slate-500 text-on-surface dark:text-white font-semibold text-xs sm:text-sm transition-all duration-150 shadow-sm group cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
        <span>Đăng nhập với Google</span>
      </button>
    </form>
  );
}
