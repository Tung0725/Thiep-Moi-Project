'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * RegisterPage Component
 * Purpose: Route chuyển hướng người dùng từ /register sang tab đăng ký tại cổng /login?mode=register.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ.
 */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0f1117]">
      <span className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
    </div>
  );
}
