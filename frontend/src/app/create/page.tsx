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
import { pinTemplate, resolveTemplate } from '@/templates/registry';
import TemplateControls from '@/templates/TemplateControls';
import { templateService } from '@/services/templateService';

interface FormDataState extends Record<string, string> {
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

/** Package fields and personalization drive the editor; state holds loaded defaults, live edits and submission feedback. */
function CreateInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || 'hb04-basic';

  const [template, setTemplate] = useState<TemplateDefinition>(DEFAULT_TEMPLATES[0]);
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const templatePackage = resolveTemplate(template.schema);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError('');
    async function load() {
      const local = DEFAULT_TEMPLATES.find(item => item.id.toLowerCase() === templateId.toLowerCase());
      try {
        const detail = await templateService.getTemplateByCodeOrId(templateId);
        const current = { ...local, ...detail, id: detail.code, schema: JSON.parse(detail.contentSchema), defaultData: JSON.parse(detail.defaultData || '{}') } as TemplateDefinition;
        if (!active) return;
        setTemplate(current);
        setFormData(current.defaultData);
      } catch {
        if (!active) return;
        if (local) { setTemplate(local); setFormData(local.defaultData); }
        else setLoadError('Không thể tải mẫu thiệp đã chọn.');
      } finally { if (active) setIsLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [templateId]);

  const liveSchema = useMemo<PageSchema>(() => {
    if (!templatePackage) return template.schema;
    return pinTemplate(templatePackage.personalize(template.schema, formData, template.defaultData));
  }, [template, templatePackage, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    let targetSlug = `${slugify(formData.groomName || 'chu-re')}-${slugify(formData.brideName || 'co-dau')}`;

    try {
      const result = await invitationService.quickCreate(formData, liveSchema, template.id);
      if (result && result.slug) {
        targetSlug = result.slug;
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể tạo thiệp. Vui lòng thử lại.');
      setIsSubmitting(false);
      return;
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

  if (isLoading) return <div role="status" className="p-12 text-center">Đang tải mẫu thiệp…</div>;
  if (loadError || !templatePackage) return <div role="alert" className="p-12 text-center">{loadError || 'Phiên bản mẫu chưa được hỗ trợ.'}<Link href="/#kho-thiep" className="block underline">Quay lại kho mẫu</Link></div>;

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#fafafa] dark:bg-[#0c0e17] text-neutral-800 dark:text-neutral-100 flex flex-col">
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
                {templatePackage?.fields.map(field => (
                  <label key={field.key} className="block space-y-1 text-sm font-semibold">
                    <span>{field.label}{field.required ? ' *' : ''}</span>
                    <input name={field.key} type={field.type} required={field.required} value={formData[field.key] || ''}
                      onChange={event => setFormData({ ...formData, [field.key]: event.target.value })}
                      className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-neutral-900" />
                  </label>
                ))}
                <TemplateControls schema={template.schema} onChange={schema => setTemplate({ ...template, schema })} />

                {/* Submit Action Bar */}
                {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}
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
                <div className="relative flex-1 overflow-y-auto max-h-[560px] select-text no-scrollbar">
                  <PageRenderer
                    schema={liveSchema}
                    slug={template.id}
                    containerClassName="max-w-full"
                    embedded
                  />
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
