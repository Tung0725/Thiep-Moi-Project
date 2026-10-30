'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BrandLogo from '@/components/common/BrandLogo';
import { authService } from '@/services/authService';

/**
 * VerifyEmailContent Component
 * Purpose: Xử lý kích hoạt tài khoản thông qua token xác thực nhận từ query param của URL email.
 * Props: Không yêu cầu props.
 * Key States:
 *  - status: 'loading' | 'success' | 'error'
 *  - message: Thông báo kết quả từ backend
 *  - emailToResend: Email dùng để gửi lại mã khi token hết hạn
 *  - isResending: Trạng thái đang gọi API gửi lại email
 */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang tiến hành xác thực tài khoản của bạn...');
  const [emailToResend, setEmailToResend] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const hasRequested = React.useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác thực hợp lệ trong liên kết.');
      return;
    }

    if (hasRequested.current) {
      return;
    }
    hasRequested.current = true;

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Tài khoản loiyeuthuong.vn của bạn đã được kích hoạt thành công!');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Kích hoạt tài khoản thất bại. Mã có thể đã hết hạn.');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToResend.trim()) return;

    setIsResending(true);
    setResendFeedback(null);

    try {
      await authService.resendVerification(emailToResend.trim());
      setResendFeedback('Liên kết kích hoạt mới đã được gửi! Vui lòng kiểm tra hộp thư email của bạn.');
    } catch (err: unknown) {
      setResendFeedback(err instanceof Error ? err.message : 'Không thể gửi lại email lúc này.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FFF2F5] via-[#FCF9F7] to-[#FDE8ED] dark:from-[#0b0d13] dark:via-[#0f1117] dark:to-[#1a0e14] text-on-surface dark:text-slate-100">
      {/* Brand Header */}
      <div className="mb-6">
        <BrandLogo size="md" showTagline={true} />
      </div>

      {/* Main Verification Status Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#161824] rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100 dark:border-[#2b2f42] text-center">
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <span className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <h2 className="text-lg font-bold font-display">Đang kích hoạt tài khoản...</h2>
            <p className="text-xs text-secondary dark:text-slate-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[2.5rem]">check_circle</span>
            </div>
            <h2 className="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
              Kích Hoạt Thành Công!
            </h2>
            <p className="text-sm text-secondary dark:text-slate-300">{message}</p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.01] transition"
              >
                <span>Đăng Nhập Ngay</span>
                <span className="material-symbols-outlined text-[1.2rem]">arrow_forward</span>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[2.5rem]">error</span>
            </div>
            <h2 className="text-xl font-extrabold font-display text-rose-600 dark:text-rose-400">
              Xác Thực Chưa Hoàn Tất
            </h2>
            <p className="text-xs sm:text-sm text-secondary dark:text-slate-300">{message}</p>

            {/* Resend Verification Form */}
            <form onSubmit={handleResend} className="pt-2 text-left space-y-2 border-t border-pink-100 dark:border-slate-800 mt-4">
              <label htmlFor="resendEmail" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                Nhập email của bạn để nhận mã kích hoạt mới:
              </label>
              <input
                id="resendEmail"
                type="email"
                required
                value={emailToResend}
                onChange={(e) => setEmailToResend(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-pink-100 dark:border-slate-700 bg-surface-container-low dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow hover:bg-primary-container transition disabled:opacity-60 cursor-pointer"
              >
                {isResending ? 'Đang gửi...' : 'Gửi Lại Email Kích Hoạt'}
              </button>
              {resendFeedback && (
                <p className="text-xs text-center font-medium text-primary dark:text-rose-400 pt-1">
                  {resendFeedback}
                </p>
              )}
            </form>

            <div className="pt-2">
              <Link href="/login" className="text-xs text-primary dark:text-rose-400 font-bold hover:underline">
                Quay về trang đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VerifyEmailPage Component
 * Purpose: Wrapper chứa Suspense để an toàn khi dùng useSearchParams trong Next.js App Router.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0f1117]">
          <span className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
