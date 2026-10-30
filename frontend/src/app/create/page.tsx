'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_TEMPLATES, TemplateDefinition } from '@/data/defaultTemplates';
import { PageSchema } from '@/types/schema';
import { slugify } from '@/lib/utils';
import { invitationService } from '@/services/invitationService';
import BrandLogo from '@/components/common/BrandLogo';
import { PageRenderer } from '@/components/renderer/PageRenderer';

interface FormDataState {
  groomName: string;
  brideName: string;
  groomPhone: string;
  bridePhone: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  coverImageUrl: string;
}

function CreateInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || 'hb04-basic';

  const [template, setTemplate] = useState<TemplateDefinition>(DEFAULT_TEMPLATES[0]);
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    groomName: '',
    brideName: '',
    groomPhone: '',
    bridePhone: '',
    eventDate: '',
    eventTime: '',
    venueName: '',
    venueAddress: '',
    coverImageUrl: '',
  });

  // Load template and initialize form
  useEffect(() => {
    const matched = DEFAULT_TEMPLATES.find((t) => t.id.toLowerCase() === templateId.toLowerCase());
    const current = matched || DEFAULT_TEMPLATES[0];
    setTemplate(current);

    setFormData({
      groomName: current.defaultData.groomName,
      brideName: current.defaultData.brideName,
      groomPhone: current.defaultData.groomPhone,
      bridePhone: current.defaultData.bridePhone,
      eventDate: current.defaultData.eventDate,
      eventTime: current.defaultData.eventTime,
      venueName: current.defaultData.venueName,
      venueAddress: current.defaultData.venueAddress,
      coverImageUrl: current.defaultData.coverImageUrl,
    });
  }, [templateId]);

  // Compute live preview schema in real-time
  const liveSchema = useMemo<PageSchema>(() => {
    const originalSchema = template.schema;
    const formattedDate = formData.eventDate
      ? formData.eventDate.split('-').reverse().join(' . ')
      : '28 . 12 . 2026';
    const fullTargetDate = `${formData.eventDate || '2026-12-28'}T${formData.eventTime || '11:30'}:00`;

    const updatedBlocks = originalSchema.blocks.map((block) => {
      if (block.type === 'HERO') {
        return {
          ...block,
          props: {
            ...block.props,
            groomName: formData.groomName || 'Chú rể',
            brideName: formData.brideName || 'Cô dâu',
            eventDate: formattedDate,
            coverImageUrl: formData.coverImageUrl || template.defaultData.coverImageUrl,
          },
        };
      }
      if (block.type === 'COUNTDOWN') {
        return {
          ...block,
          props: {
            ...block.props,
            targetDate: fullTargetDate,
          },
        };
      }
      if (block.type === 'LOCATION') {
        return {
          ...block,
          props: {
            ...block.props,
            ceremonyVenue: formData.venueName || 'Trung Tâm Tiệc Cưới',
            address: formData.venueAddress || 'Địa chỉ sảnh tiệc',
            eventTime: `${formData.eventTime || '11:30'} - Ngày ${formattedDate}`,
          },
        };
      }
      return block;
    });

    return {
      ...originalSchema,
      blocks: updatedBlocks,
    };
  }, [template, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let targetSlug = `${slugify(formData.groomName || 'chu-re')}-${slugify(formData.brideName || 'co-dau')}`;

    try {
      const result = await invitationService.quickCreate(formData, liveSchema, template.id);
      if (result && result.slug) {
        targetSlug = result.slug;
      }
    } catch {
      // Local development fallback
    }

    try {
      const payload = {
        templateId: template.id,
        customData: formData,
        schema: liveSchema,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`invitation_${targetSlug}`, JSON.stringify(payload));
    } catch {
      // Storage access error handling
    }

    router.push(`/t/${targetSlug}`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#fafafa] dark:bg-[#0c0e17] text-neutral-800 dark:text-neutral-100 flex flex-col">
      {/* Top Application Header */}
      <header className="w-full bg-white dark:bg-[#151724] border-b border-neutral-200/80 dark:border-neutral-800 sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/#kho-thiep"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
            aria-label="Quay lại kho mẫu"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <BrandLogo size="sm" showTagline={false} />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-mh-primary animate-pulse" />
            <span>Mẫu: {template.title}</span>
          </span>

          <Link
            href={`/templates/${template.id}`}
            className="py-1.5 px-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:border-mh-primary hover:text-mh-primary transition"
          >
            Xem mẫu gốc
          </Link>
        </div>
      </header>

      {/* Mobile View Switcher Tab Bar */}
      <div className="lg:hidden bg-white dark:bg-[#151724] border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-center gap-2 sticky top-[57px] z-30">
        <button
          type="button"
          onClick={() => setActiveMobileTab('form')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'form'
              ? 'bg-mh-primary text-white shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">edit_note</span>
          <span>1. Chỉnh sửa thông tin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'preview'
              ? 'bg-mh-primary text-white shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">smartphone</span>
          <span>2. Xem trước thiệp ({formData.groomName || 'Chú rể'} &amp; {formData.brideName || 'Cô dâu'})</span>
        </button>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-white dark:bg-[#151724] rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
                  Tùy Biến Thông Tin Thiệp Cưới
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Nhập thông tin của dâu rể, khung xem trước bên phải sẽ cập nhật trực tiếp theo từng ký tự.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Groom & Bride Names */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-mh-primary flex items-center gap-1.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    <span>1. Thông Tin Cô Dâu &amp; Chú Rể</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Groom */}
                    <div className="space-y-3 p-4 rounded-2xl bg-[#fafafa] dark:bg-[#1a1c2b] border border-neutral-100 dark:border-neutral-800">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Họ và tên Chú Rể <span className="text-mh-primary">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.groomName}
                          onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                          placeholder="VD: Tuấn Kiệt"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Số điện thoại Chú Rể
                        </label>
                        <input
                          type="tel"
                          value={formData.groomPhone}
                          onChange={(e) => setFormData({ ...formData, groomPhone: e.target.value })}
                          placeholder="VD: 0901 234 567"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                        />
                      </div>
                    </div>

                    {/* Bride */}
                    <div className="space-y-3 p-4 rounded-2xl bg-[#fafafa] dark:bg-[#1a1c2b] border border-neutral-100 dark:border-neutral-800">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Họ và tên Cô Dâu <span className="text-mh-primary">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.brideName}
                          onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                          placeholder="VD: Mai Phương"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Số điện thoại Cô Dâu
                        </label>
                        <input
                          type="tel"
                          value={formData.bridePhone}
                          onChange={(e) => setFormData({ ...formData, bridePhone: e.target.value })}
                          placeholder="VD: 0909 888 999"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Date, Time & Venue */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-mh-primary flex items-center gap-1.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span>2. Thời Gian &amp; Địa Điểm Tổ Chức Tiệc</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Ngày cử hành hôn lễ <span className="text-mh-primary">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Giờ đón khách / Khai tiệc <span className="text-mh-primary">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.eventTime}
                        onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Tên Trung tâm Tiệc cưới / Tư gia <span className="text-mh-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      placeholder="VD: Trung Tâm Tiệc Cưới Riverside Palace"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Địa chỉ cụ thể sảnh tiệc <span className="text-mh-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      placeholder="VD: 360D Bến Vân Đồn, Phường 1, Quận 4, TP. Hồ Chí Minh"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                    />
                  </div>
                </div>

                {/* Section 3: Wedding Photo */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-mh-primary flex items-center gap-1.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    <span>3. Hình Ảnh Bìa Thiệp Cưới</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Đường dẫn ảnh bìa cưới (URL ảnh)
                    </label>
                    <input
                      type="url"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      placeholder="https://example.com/anh-cuoi.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-mh-primary/30"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Mặc định hệ thống đã chọn sẵn bức ảnh cưới mẫu cao cấp chuẩn tỷ lệ.
                    </p>
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div className="pt-4 flex items-center justify-between gap-4">
                  <Link
                    href="/#kho-thiep"
                    className="py-3 px-6 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                  >
                    Hủy bỏ
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3.5 px-8 rounded-full bg-mh-primary hover:bg-mh-primary-hover text-white text-sm font-bold shadow-lg shadow-mh-primary/30 hover:scale-[1.01] active:scale-[0.99] transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Tạo &amp; Nhận Link Thiệp Cưới</span>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Sticky Phone Canvas Preview (Desktop) */}
          <div
            className={`lg:col-span-5 sticky top-24 ${
              activeMobileTab === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="mb-2 text-center hidden lg:block">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#151724] border border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Khung xem trước di động thời gian thực</span>
                </span>
              </div>

              {/* iPhone Simulated Device Frame */}
              <div className="w-full max-w-[340px] rounded-[38px] bg-white dark:bg-[#121420] shadow-[0_25px_60px_rgba(0,0,0,0.22)] border-[8px] border-neutral-900 overflow-hidden relative flex flex-col">
                {/* Notch */}
                <div className="w-full h-5 bg-neutral-900 flex items-center justify-center shrink-0">
                  <div className="w-16 h-3 bg-neutral-950 rounded-b-md" />
                </div>

                {/* Live Rendered Content */}
                <div className="flex-1 overflow-y-auto max-h-[560px] select-text no-scrollbar">
                  <PageRenderer schema={liveSchema} slug={template.id} containerClassName="max-w-full" />
                </div>

                {/* Bottom Bar */}
                <div className="w-full h-4 bg-neutral-900 flex items-center justify-center shrink-0">
                  <div className="w-24 h-1 bg-neutral-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * CreateInvitationPage Component
 * Purpose: Trang chuyên biệt tùy biến thông tin thiệp cưới (/create?templateId=...) với bố cục 2 cột và khung Live Preview tức thì.
 */
export default function CreateInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <span className="w-10 h-10 border-3 border-mh-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateInvitationContent />
    </Suspense>
  );
}
