'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageSchema } from '@/types/schema';
import { DEFAULT_TEMPLATES } from '@/data/defaultTemplates';
import { invitationService } from '@/services/invitationService';
import { PageRenderer } from '@/components/renderer/PageRenderer';

interface PublicInvitationPageProps {
  params: {
    slug: string;
  };
}

/**
 * PublicInvitationPage Component
 * Purpose: Trang hiển thị thiệp cưới trực tuyến công khai (/t/[slug]), nạp dữ liệu Schema thực tế và cung cấp thanh tác vụ chia sẻ link Zalo/QR cho khách mời.
 * Props:
 *   - params.slug: Chuỗi định danh slug duy nhất của thiệp cưới.
 * Key States:
 *   - schema: Cấu trúc PageSchema đang hiển thị.
 *   - isCopied: Trạng thái thông báo đã sao chép link Zalo.
 *   - isLoading: Trạng thái đang tải schema.
 */
export default function PublicInvitationPage({ params }: PublicInvitationPageProps) {
  const { slug } = params;
  const [schema, setSchema] = useState<PageSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInvitation() {
      // 1. Try fetching from Backend API
      try {
        const card = await invitationService.getPublicCard(slug);
        if (card && card.contentSchema && isMounted) {
          const parsed = JSON.parse(card.contentSchema);
          setSchema(parsed);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback: Proceed to check local store or template match
      }

      // 2. Check if saved in localStorage (from QuickCustomize flow)
      try {
        const stored = localStorage.getItem(`invitation_${slug}`);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (parsed.schema) {
            setSchema(parsed.schema);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Storage access error handling
      }

      // 3. Check if slug matches any default template ID
      if (isMounted) {
        const matchedTemplate = DEFAULT_TEMPLATES.find(
          (t) => t.id.toLowerCase() === slug.toLowerCase()
        );

        if (matchedTemplate) {
          setSchema(matchedTemplate.schema);
        } else {
          setSchema(DEFAULT_TEMPLATES[0].schema);
        }
        setIsLoading(false);
      }
    }

    loadInvitation();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fffafb] gap-3">
        <span className="w-10 h-10 border-3 border-mh-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">Đang chuẩn bị thiệp mừng...</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-mh-primary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">favorite_border</span>
        </div>
        <h1 className="text-xl font-bold text-neutral-800">Không tìm thấy thiệp mời</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm">
          Đường dẫn thiệp có thể đã thay đổi hoặc không tồn tại.
        </p>
        <Link
          href="/"
          className="mt-6 py-2.5 px-6 rounded-full bg-mh-primary text-white text-xs font-bold shadow hover:bg-mh-primary-hover transition"
        >
          Trở về Trang chủ loiyeuthuong.vn
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-start bg-[#1a1c23]">
      {/* Centered Mobile Canvas Viewport Container */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white dark:bg-[#121420] shadow-2xl relative flex flex-col pb-20">
        <PageRenderer schema={schema} slug={slug} />
      </div>

      {/* Floating Bottom Social Action Bar */}
      <aside className="fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 bg-white/95 dark:bg-[#181a28]/95 backdrop-blur-md rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 p-2 shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 pl-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 truncate">
            loiyeuthuong.vn
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2 px-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isCopied ? 'check' : 'share'}
            </span>
            <span>{isCopied ? 'Đã sao chép!' : 'Chia sẻ thiệp'}</span>
          </button>

          {/* Create Own Invitation CTA */}
          <Link
            href="/"
            className="py-2 px-3.5 rounded-xl bg-mh-primary hover:bg-mh-primary-hover text-white text-xs font-bold shadow-sm transition flex items-center gap-1"
          >
            <span>Tự tạo thiệp</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </aside>

      {/* Copy Notification Toast */}
      {isCopied && (
        <div className="fixed top-5 z-50 py-2 px-4 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Đã sao chép liên kết thiệp cưới vào bộ nhớ tạm!</span>
        </div>
      )}
    </div>
  );
}
