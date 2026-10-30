'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

/**
 * RegisterForm Component
 * Purpose: Form đăng ký loiyeuthuong.vn được chuẩn hóa tỷ lệ vừa khít màn hình, hiển thị đầy đủ nút Google mà không bị cắt xén.
 * Props:
 *  - onSwitchToLogin: Callback chuyển về giao diện đăng nhập.
 * Key States:
 *  - fullName, phone, email, password, confirmPassword: Dữ liệu nhập form.
 *  - eventType: Loại sự kiện quan tâm.
 *  - passwordStrength: Đánh giá độ mạnh mật khẩu.
 *  - agreeTerms: Trạng thái chấp thuận điều khoản.
 *  - isLoading: Trạng thái đang gọi API.
 *  - errorMessage: Thông báo lỗi xác thực hoặc trùng lặp.
 */
export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [eventType, setEventType] = useState<'wedding' | 'birthday' | 'party'>('wedding');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;
  const strengthLabel = strengthScore === 3 ? (hasSpecial ? 'Rất mạnh' : 'Đạt chuẩn') : strengthScore === 2 ? 'Khá an toàn' : strengthScore === 1 ? 'Yếu' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Email không đúng định dạng hợp lệ (ví dụ: email@gmail.com)');
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone) {
      const phoneRegex = /^0[35789][0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setErrorMessage('Số điện thoại phải gồm 10 chữ số hợp lệ (bắt đầu bằng 03, 05, 07, 08 hoặc 09)');
        return;
      }
    }

    if (!isPasswordValid) {
      setErrorMessage('Mật khẩu chưa đạt yêu cầu: cần tối thiểu 8 ký tự, ít nhất 1 chữ hoa và 1 số.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: cleanPhone || undefined,
        password,
      });
      setRegisteredEmail(email.trim());
      setIsRegistered(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi đăng ký tài khoản. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[2.5rem]">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-extrabold font-display text-on-surface dark:text-white">
          Kiểm Tra Email Của Bạn
        </h2>
        <p className="text-xs sm:text-sm text-secondary dark:text-slate-300 max-w-sm mx-auto">
          Chúng tôi đã gửi liên kết kích hoạt đến <strong className="text-primary dark:text-rose-400">{registeredEmail}</strong>. Vui lòng mở email và bấm vào liên kết để kích hoạt tài khoản loiyeuthuong.vn.
        </p>
        <div className="pt-3">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.01] transition cursor-pointer"
          >
            Chuyển Sang Đăng Nhập
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleRegister = () => {
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <form className="space-y-2.5" onSubmit={handleSubmit}>
      {/* Form Header Title & Subtitle */}
      <div className="mb-2">
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-on-surface dark:text-white tracking-tight">
          Tạo Tài Khoản
        </h2>
        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5">
          Khởi đầu ngày trọng đại với thiệp cưới điện tử thông minh
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-error-container/30 border border-error/30 text-xs font-semibold text-error flex items-center gap-2 animate-shake">
          <span className="material-symbols-outlined text-[1.1rem]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Full Name Field */}
      <div>
        <label className="block text-xs font-bold text-on-surface dark:text-slate-200 mb-0.5" htmlFor="regFullName">
          Họ &amp; Tên<span className="text-primary">*</span>
        </label>
        <input
          id="regFullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn An"
          className="w-full px-3.5 py-2 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-xs sm:text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      {/* Phone & Email Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-bold text-on-surface dark:text-slate-200 mb-0.5" htmlFor="regPhone">
            Số điện thoại <span className="text-[10px] font-normal text-secondary dark:text-slate-400">(Tùy chọn)</span>
          </label>
          <input
            id="regPhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912 345 678"
            className="w-full px-3.5 py-2 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-xs sm:text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface dark:text-slate-200 mb-0.5" htmlFor="regEmail">
            Email cá nhân <span className="text-primary">*</span>
          </label>
          <input
            id="regEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@gmail.com"
            className="w-full px-3.5 py-2 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-xs sm:text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      </div>

      {/* Password & Confirm Password Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-bold text-on-surface dark:text-slate-200 mb-0.5" htmlFor="regPassword">
            Mật khẩu <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <input
              id="regPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Từ 8 ký tự, 1 hoa, 1 số"
              className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-xs sm:text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 hover:text-primary transition p-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.05rem]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface dark:text-slate-200 mb-0.5" htmlFor="regConfirmPassword">
            Xác nhận mật khẩu <span className="text-primary">*</span>
          </label>
          <input
            id="regConfirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className="w-full px-3.5 py-2 rounded-xl border border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-white text-xs sm:text-sm placeholder:text-outline/60 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#202334] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      </div>

      {/* Password Strength & Sequential Requirements Checklist */}
      {password && (
        <div className="space-y-1.5 p-2 rounded-xl bg-surface-container-low/70 dark:bg-[#1b1e2c] border border-pink-100/70 dark:border-[#2b2f42] text-[11px]">
          <div className="flex items-center justify-between font-medium">
            <span className="text-secondary dark:text-slate-400">Độ mạnh mật khẩu:</span>
            <span className={`font-bold ${isPasswordValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {strengthLabel}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-surface-container dark:bg-[#2b2f42] rounded-full overflow-hidden flex gap-1">
            <div className={`h-full w-1/3 transition-all duration-300 ${hasMinLength ? 'bg-emerald-500' : 'bg-surface-container-high dark:bg-[#32374d]'}`}></div>
            <div className={`h-full w-1/3 transition-all duration-300 ${hasUppercase ? 'bg-emerald-500' : 'bg-surface-container-high dark:bg-[#32374d]'}`}></div>
            <div className={`h-full w-1/3 transition-all duration-300 ${hasNumber ? 'bg-emerald-500' : 'bg-surface-container-high dark:bg-[#32374d]'}`}></div>
          </div>
          {/* Checklist in sequential order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-0.5 text-[10px] sm:text-[11px]">
            <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-secondary dark:text-slate-400'}`}>
              <span className="material-symbols-outlined text-[13px]">
                {hasMinLength ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>1. Tối thiểu 8 ký tự</span>
            </div>
            <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-secondary dark:text-slate-400'}`}>
              <span className="material-symbols-outlined text-[13px]">
                {hasUppercase ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>2. Ít nhất 1 chữ hoa</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-secondary dark:text-slate-400'}`}>
              <span className="material-symbols-outlined text-[13px]">
                {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>3. Ít nhất 1 số</span>
            </div>
          </div>
        </div>
      )}

      {/* Event Category Selection */}
      <div>
        <label className="block text-xs font-bold text-on-surface dark:text-slate-200 mb-1">
          Loại sự kiện quan tâm:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border cursor-pointer select-none text-xs font-medium transition ${
              eventType === 'wedding'
                ? 'border-primary bg-primary-fixed/30 dark:bg-rose-950/60 text-primary dark:text-rose-300 font-bold shadow-sm'
                : 'border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-slate-300 hover:bg-white dark:hover:bg-[#282d42]'
            }`}
          >
            <input
              type="radio"
              name="eventType"
              value="wedding"
              checked={eventType === 'wedding'}
              onChange={() => setEventType('wedding')}
              className="hidden"
            />
            <span className="material-symbols-outlined text-[1rem]">favorite</span>
            <span>Thiệp cưới</span>
          </label>
          <label
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border cursor-pointer select-none text-xs font-medium transition ${
              eventType === 'birthday'
                ? 'border-primary bg-primary-fixed/30 dark:bg-rose-950/60 text-primary dark:text-rose-300 font-bold shadow-sm'
                : 'border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-slate-300 hover:bg-white dark:hover:bg-[#282d42]'
            }`}
          >
            <input
              type="radio"
              name="eventType"
              value="birthday"
              checked={eventType === 'birthday'}
              onChange={() => setEventType('birthday')}
              className="hidden"
            />
            <span className="material-symbols-outlined text-[1rem]">cake</span>
            <span>Thôi nôi</span>
          </label>
          <label
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border cursor-pointer select-none text-xs font-medium transition ${
              eventType === 'party'
                ? 'border-primary bg-primary-fixed/30 dark:bg-rose-950/60 text-primary dark:text-rose-300 font-bold shadow-sm'
                : 'border-pink-100 dark:border-[#2b2f42] bg-surface-container-low dark:bg-[#202334] text-on-surface dark:text-slate-300 hover:bg-white dark:hover:bg-[#282d42]'
            }`}
          >
            <input
              type="radio"
              name="eventType"
              value="party"
              checked={eventType === 'party'}
              onChange={() => setEventType('party')}
              className="hidden"
            />
            <span className="material-symbols-outlined text-[1rem]">celebration</span>
            <span>Sự kiện</span>
          </label>
        </div>
      </div>

      {/* Terms Agreement Checkbox */}
      <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-slate-700 dark:bg-[#202334] accent-primary cursor-pointer"
        />
        <span className="text-xs text-secondary dark:text-slate-400">
          Tôi đồng ý với{' '}
          <a className="text-primary dark:text-rose-400 underline font-semibold" href="#">
            Điều khoản dịch vụ
          </a>{' '}
          và{' '}
          <a className="text-primary dark:text-rose-400 underline font-semibold" href="#">
            Chính sách bảo mật
          </a>.
        </span>
      </label>

      {/* Submit Register CTA Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-gradient-to-r from-primary to-primary-container dark:from-rose-600 dark:to-pink-600 text-white font-display font-bold text-sm shadow-md shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-0.5"
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>Tạo Tài Khoản &amp; Bắt Đầu</span>
            <span className="material-symbols-outlined text-[1.15rem]">
              arrow_forward
            </span>
          </>
        )}
      </button>

      {/* Switch to Login Link */}
      <div className="pt-0.5 text-center">
        <p className="text-xs text-secondary dark:text-slate-400">
          Đã có tài khoản loiyeuthuong?
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary dark:text-rose-400 font-bold hover:underline ml-1 cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-1.5">
        <div className="w-full h-px bg-surface-container-highest dark:bg-[#2b2f42]"></div>
        <span className="absolute bg-white dark:bg-[#161824] px-2.5 text-[10px] font-bold uppercase tracking-wider text-outline/80 dark:text-slate-400">
          Hoặc đăng ký với
        </span>
      </div>

      {/* Google 1-Click Sign-in Button */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-[#32374d] bg-white dark:bg-[#202334] hover:bg-surface-container-low dark:hover:bg-[#282d42] hover:border-gray-300 dark:hover:border-slate-500 text-on-surface dark:text-white font-semibold text-xs sm:text-sm transition-all duration-150 shadow-sm group cursor-pointer"
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
        <span>Đăng ký với Google</span>
      </button>
    </form>
  );
}
