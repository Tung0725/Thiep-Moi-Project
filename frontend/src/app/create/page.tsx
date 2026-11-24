'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Palette,
  Smartphone,
} from 'lucide-react';
import { DEFAULT_TEMPLATES, TemplateDefinition } from '@/data/defaultTemplates';
import { PageSchema } from '@/types/schema';
import { slugify } from '@/lib/utils';
import {
  addAlbumPhotos,
  applyPhotoSlotUpdate,
  getTemplatePhotoSlots,
  moveAlbumPhoto,
  removeAlbumPhoto,
} from '@/lib/photoSlots';
import { invitationService } from '@/services/invitationService';
import { templateService } from '@/services/templateService';
import BrandLogo from '@/components/common/BrandLogo';
import { pinTemplate, resolveTemplate } from '@/templates/registry';
import { TemplateField } from '@/templates/types';
import TemplateControls from '@/templates/TemplateControls';
import IPhonePreviewFrame from '@/components/create/IPhonePreviewFrame';
import PhotoSlotManager from '@/components/create/PhotoSlotManager';

type EditorTab = 'content' | 'images' | 'design';

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

const COUPLE_KEYS = ['groomName', 'brideName', 'groomPhone', 'bridePhone'] as const;
const FAMILY_KEYS = ['groomFather', 'groomMother', 'brideFather', 'brideMother'] as const;
const EVENT_KEYS = ['eventDate', 'eventTime', 'ceremonyTime', 'venueName', 'venueAddress'] as const;

const FIELD_AUTOCOMPLETE: Record<string, string> = {
  groomName: 'name',
  brideName: 'name',
  groomPhone: 'tel',
  bridePhone: 'tel',
  venueAddress: 'street-address',
};

/**
 * Merges edited user values into a newly selected template's defaults, keeping
 * any personal details the user already typed while refreshing untouched sample fields.
 */
function mergeEditedFields(
  previousForm: FormDataState,
  previousDefaults: Record<string, string>,
  nextDefaults: Record<string, string>
): FormDataState {
  const merged: Record<string, string> = { ...nextDefaults };
  for (const [key, value] of Object.entries(previousForm)) {
    if (key === 'coverImageUrl') {
      if (value.startsWith('data:image/')) {
        merged[key] = value;
      }
      continue;
    }
    if (value && value !== (previousDefaults[key] || '')) {
      merged[key] = value;
    }
  }
  return merged as FormDataState;
}

/**
 * Guided 3-tab invitation editor paired with an isolated live iPhone preview.
 * Supports switching templates without losing user edits, uploading/reordering photos,
 * and post-interaction accessible form validation.
 */
function CreateInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || 'hb04-basic';

  const [catalog, setCatalog] = useState<TemplateDefinition[]>(DEFAULT_TEMPLATES);
  const [template, setTemplate] = useState<TemplateDefinition>(DEFAULT_TEMPLATES[0]);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>('content');
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [selectedPhotoSlotId, setSelectedPhotoSlotId] = useState<string | null>(null);
  const [focusPhotoRequest, setFocusPhotoRequest] = useState<{
    slotId: string;
    url?: string;
    nonce: number;
  } | null>(null);

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

  const previousDefaultsRef = useRef<Record<string, string> | null>(null);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const templatePackage = resolveTemplate(template.schema);

  // Load template catalog once for the quick template switcher
  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      try {
        const remote = await templateService.getTemplates();
        if (!active || !remote || remote.length === 0) return;
        const mapped = remote.map((item) => {
          const fallback = DEFAULT_TEMPLATES.find((d) => d.id === item.code);
          return {
            id: item.code,
            category: (item.category as 'wedding' | 'birthday' | 'event') || 'wedding',
            title: item.title,
            style: item.style || fallback?.style || 'Thanh lịch',
            views: String(item.viewsCount ?? 0),
            likes: String(item.likesCount ?? 0),
            badge: (item.badge as 'Miễn phí' | 'VIP') || 'Miễn phí',
            categoryLabel: item.categoryLabel || 'Cưới',
            imageUrl: item.imageUrl || fallback?.imageUrl || DEFAULT_TEMPLATES[0].imageUrl,
            description: item.description || fallback?.description || '',
            defaultData: fallback?.defaultData || DEFAULT_TEMPLATES[0].defaultData,
            schema: fallback?.schema || DEFAULT_TEMPLATES[0].schema,
          } as TemplateDefinition;
        });
        setCatalog(mapped);
      } catch {
        // Keep DEFAULT_TEMPLATES fallback
      }
    }
    void loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  // Load selected template schema & merge with any already-edited user fields
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError('');

    async function load() {
      const local = DEFAULT_TEMPLATES.find((item) => item.id.toLowerCase() === templateId.toLowerCase());
      let resolved: TemplateDefinition | null = local || null;

      try {
        const detail = await templateService.getTemplateByCodeOrId(templateId);
        if (detail && detail.contentSchema) {
          const parsedSchema = JSON.parse(detail.contentSchema) as PageSchema;
          const effectiveSchema =
            local && (parsedSchema.version || 1) < local.schema.version
              ? local.schema
              : parsedSchema;
          const parsedDefaultData = detail.defaultData
            ? (JSON.parse(detail.defaultData) as Record<string, string>)
            : {};

          resolved = {
            ...(local || DEFAULT_TEMPLATES[0]),
            id: detail.code,
            title: detail.title,
            style: detail.style || local?.style || 'Tươi sáng & Thanh lịch',
            imageUrl: detail.imageUrl || local?.imageUrl || DEFAULT_TEMPLATES[0].imageUrl,
            description: detail.description || local?.description || '',
            defaultData: {
              ...(local?.defaultData || DEFAULT_TEMPLATES[0].defaultData),
              ...parsedDefaultData,
            },
            schema: pinTemplate(effectiveSchema),
          };
        }
      } catch {
        // Fallback silently to matched local template
      }

      if (!active) return;

      if (!resolved) {
        setLoadError('Không thể tải mẫu thiệp đã chọn.');
        setIsLoading(false);
        return;
      }

      setTemplate(resolved);
      if (previousDefaultsRef.current) {
        setFormData(
          mergeEditedFields(
            formDataRef.current,
            previousDefaultsRef.current,
            resolved.defaultData
          )
        );
      } else {
        setFormData({ ...resolved.defaultData });
      }
      previousDefaultsRef.current = resolved.defaultData;
      setTouchedFields({});
      setHasAttemptedSubmit(false);
      setIsLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [templateId]);

  const liveSchema = useMemo<PageSchema>(() => {
    if (!templatePackage) return template.schema;
    return pinTemplate(templatePackage.personalize(template.schema, formData, template.defaultData));
  }, [template, templatePackage, formData]);

  const photoSlots = useMemo(
    () => getTemplatePhotoSlots(liveSchema, formData, template.defaultData),
    [liveSchema, formData, template.defaultData]
  );

  const photoSlotMap = useMemo(
    () => photoSlots.map((slot) => ({ id: slot.id, url: slot.url })),
    [photoSlots]
  );

  const handleSelectPhotoFromPreview = useCallback((slotId: string) => {
    setSelectedPhotoSlotId(slotId);
    setActiveEditorTab('images');
    setActiveMobileTab('form');
  }, []);

  const handleFocusPhotoSlot = useCallback((slotId: string, url: string) => {
    setFocusPhotoRequest((prev) => ({
      slotId,
      url,
      nonce: (prev?.nonce ?? 0) + 1,
    }));
  }, []);

  const handleUpdatePhotoSlot = useCallback(
    (slotId: string, nextUrl: string) => {
      const updated = applyPhotoSlotUpdate(
        template.schema,
        formDataRef.current,
        template.defaultData,
        slotId,
        nextUrl
      );
      setTemplate((prev) => ({ ...prev, schema: updated.schema }));
      setFormData(updated.formData as FormDataState);
      if (submitError) setSubmitError('');
    },
    [template.schema, template.defaultData, submitError]
  );

  const getFieldError = (field: TemplateField): string => {
    if (!field.required) return '';
    const value = (formData[field.key] || '').trim();
    if (!value) {
      return `Vui lòng nhập ${field.label.toLowerCase()}.`;
    }
    return '';
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSelectTemplate = (nextId: string) => {
    setIsSwitcherOpen(false);
    if (nextId === template.id) return;
    router.replace(`/create?templateId=${encodeURIComponent(nextId)}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    setSubmitError('');

    const fields = templatePackage?.fields || [];
    const firstInvalidField = fields.find((field) => Boolean(getFieldError(field)));
    if (firstInvalidField) {
      setActiveEditorTab('content');
      setActiveMobileTab('form');
      window.requestAnimationFrame(() => {
        const input = document.getElementById(`field-${firstInvalidField.key}`);
        input?.focus();
      });
      return;
    }

    setIsSubmitting(true);
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

  const fieldsByKey = useMemo(() => {
    const map = new Map<string, TemplateField>();
    for (const field of templatePackage?.fields || []) {
      map.set(field.key, field);
    }
    return map;
  }, [templatePackage]);

  const coupleFields = COUPLE_KEYS.map((key) => fieldsByKey.get(key)).filter((f): f is TemplateField => Boolean(f));
  const familyFields = FAMILY_KEYS.map((key) => fieldsByKey.get(key)).filter((f): f is TemplateField => Boolean(f));
  const eventFields = EVENT_KEYS.map((key) => fieldsByKey.get(key)).filter((f): f is TemplateField => Boolean(f));

  const renderFieldInput = (field: TemplateField) => {
    const errorText = getFieldError(field);
    const showError = Boolean(errorText && (touchedFields[field.key] || hasAttemptedSubmit));
    const inputId = `field-${field.key}`;
    const errorId = `${inputId}-error`;
    const isAddress = field.key === 'venueAddress';

    return (
      <div key={field.key} className={`flex flex-col gap-1.5 ${isAddress ? 'sm:col-span-2' : ''}`}>
        <label htmlFor={inputId} className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
          {field.label}
          {field.required && <span className="text-mh-primary ml-0.5" aria-hidden="true">*</span>}
        </label>
        <input
          id={inputId}
          name={field.key}
          type={field.type === 'image' ? 'text' : field.type}
          required={field.required}
          value={formData[field.key] || ''}
          autoComplete={FIELD_AUTOCOMPLETE[field.key]}
          inputMode={field.type === 'tel' ? 'tel' : undefined}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : undefined}
          onBlur={() => setTouchedFields((prev) => ({ ...prev, [field.key]: true }))}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
          className={`min-h-[44px] w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm text-neutral-900 dark:text-white bg-white dark:bg-[#191c2b] transition-colors focus:outline-none ${
            showError
              ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 focus:border-red-600'
              : 'border-neutral-300 dark:border-neutral-700 focus:border-mh-primary'
          }`}
        />
        {showError && (
          <p id={errorId} className="text-xs font-medium text-red-700 dark:text-red-400">
            {errorText}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div role="status" className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#fafafa] dark:bg-[#0c0e17] p-12 text-center text-sm font-medium text-neutral-600 dark:text-neutral-300">
        <span className="w-9 h-9 border-3 border-mh-primary border-t-transparent rounded-full animate-spin" />
        <span>Đang tải mẫu thiệp…</span>
      </div>
    );
  }

  if (loadError || !templatePackage) {
    return (
      <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fafafa] dark:bg-[#0c0e17] p-12 text-center">
        <p className="text-base font-bold text-neutral-900 dark:text-white">
          {loadError || 'Phiên bản mẫu chưa được hỗ trợ.'}
        </p>
        <Link
          href="/#kho-thiep"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mh-primary text-white text-sm font-bold"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Quay lại kho mẫu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#fafafa] dark:bg-[#0c0e17] text-neutral-800 dark:text-neutral-100 flex flex-col">
      {/* Top Application Header */}
      <header className="w-full bg-white dark:bg-[#151724] border-b border-neutral-200/80 dark:border-neutral-800 sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/#kho-thiep"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white transition shrink-0"
            aria-label="Quay lại kho mẫu"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <BrandLogo size="sm" showTagline={false} />
        </div>

        <div className="relative flex items-center gap-2">
          {/* Quick Template Switcher */}
          <button
            type="button"
            onClick={() => setIsSwitcherOpen((prev) => !prev)}
            aria-expanded={isSwitcherOpen}
            aria-controls="template-switcher-panel"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary text-xs font-bold hover:brightness-95 transition cursor-pointer max-w-[220px] sm:max-w-xs"
          >
            <Layers size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">Mẫu: {template.title}</span>
            <ChevronDown size={14} className="shrink-0" aria-hidden="true" />
          </button>

          <Link
            href={`/templates/${template.id}`}
            className="hidden sm:inline-flex items-center gap-1 py-1.5 px-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:border-mh-primary hover:text-mh-primary transition"
          >
            <span>Xem mẫu gốc</span>
            <ExternalLink size={12} aria-hidden="true" />
          </Link>

          {isSwitcherOpen && (
            <>
              <div
                aria-hidden="true"
                onClick={() => setIsSwitcherOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div
                id="template-switcher-panel"
                role="region"
                aria-label="Chọn mẫu thiệp khác"
                className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#161824] border border-neutral-200 dark:border-neutral-700 shadow-2xl p-2 z-50"
              >
                <p className="px-2.5 py-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                  Đổi mẫu thiệp (giữ nguyên thông tin đã nhập)
                </p>
                <div className="max-h-72 overflow-y-auto space-y-1 no-scrollbar">
                  {catalog.map((item) => {
                    const active = item.id.toLowerCase() === template.id.toLowerCase();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTemplate(item.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-mh-primary'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-10 h-12 rounded-lg object-cover object-top shrink-0 bg-neutral-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{item.title}</p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            {item.style}
                          </p>
                        </div>
                        {active && <Check size={16} className="shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile View Switcher Tab Bar */}
      <div className="lg:hidden bg-white dark:bg-[#151724] border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-center gap-2 sticky top-[57px] z-30">
        <button
          type="button"
          onClick={() => setActiveMobileTab('form')}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileTab === 'form'
              ? 'bg-mh-primary text-white shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <Edit3 size={15} aria-hidden="true" />
          <span>1. Chỉnh sửa thiệp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileTab === 'preview'
              ? 'bg-mh-primary text-white shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <Smartphone size={15} aria-hidden="true" />
          <span className="truncate">
            2. Xem iPhone ({formData.groomName || 'Chú rể'} &amp; {formData.brideName || 'Cô dâu'})
          </span>
        </button>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3-Tab Guided Editor */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-white dark:bg-[#151724] rounded-2xl p-5 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
                  Tùy Chỉnh Thiệp Cưới
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Chỉnh thông tin, thay ảnh trực tiếp từ máy và xem kết quả chuẩn iPhone ngay bên phải.
                </p>
              </div>

              {/* Editor Section Tabs */}
              <div
                role="tablist"
                aria-label="Các mục chỉnh sửa thiệp"
                className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-[#1b1e2e] border border-neutral-200/70 dark:border-neutral-800"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeEditorTab === 'content'}
                  onClick={() => setActiveEditorTab('content')}
                  className={`min-h-[42px] px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeEditorTab === 'content'
                      ? 'bg-white dark:bg-[#151724] text-mh-primary shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Edit3 size={14} aria-hidden="true" />
                  <span>1. Nội dung</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeEditorTab === 'images'}
                  onClick={() => setActiveEditorTab('images')}
                  className={`min-h-[42px] px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeEditorTab === 'images'
                      ? 'bg-white dark:bg-[#151724] text-mh-primary shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon size={14} aria-hidden="true" />
                  <span>2. Hình ảnh</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeEditorTab === 'design'}
                  onClick={() => setActiveEditorTab('design')}
                  className={`min-h-[42px] px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeEditorTab === 'design'
                      ? 'bg-white dark:bg-[#151724] text-mh-primary shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Palette size={14} aria-hidden="true" />
                  <span>3. Thiết kế &amp; Nhạc</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Tab 1: Text & Event Details */}
                {activeEditorTab === 'content' && (
                  <div role="tabpanel" className="space-y-5">
                    {coupleFields.length > 0 && (
                      <fieldset className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
                        <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white">
                          Thông tin Dâu &amp; Rể
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {coupleFields.map(renderFieldInput)}
                        </div>
                      </fieldset>
                    )}

                    {familyFields.length > 0 && (
                      <fieldset className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
                        <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white">
                          Gia đình hai bên
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {familyFields.map(renderFieldInput)}
                        </div>
                      </fieldset>
                    )}

                    {eventFields.length > 0 && (
                      <fieldset className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
                        <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white">
                          Thời gian &amp; Địa điểm tổ chức
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {eventFields.map(renderFieldInput)}
                        </div>
                      </fieldset>
                    )}
                  </div>
                )}

                {/* Tab 2: WYSIWYG Photo Slot Manager */}
                {activeEditorTab === 'images' && (
                  <div role="tabpanel">
                    <PhotoSlotManager
                      schema={liveSchema}
                      formData={formData}
                      defaults={template.defaultData}
                      activeSlotId={selectedPhotoSlotId}
                      onSelectSlot={setSelectedPhotoSlotId}
                      onUpdateSlot={handleUpdatePhotoSlot}
                      onFocusSlot={handleFocusPhotoSlot}
                      onAddAlbumPhotos={(urls) =>
                        setTemplate((prev) => ({
                          ...prev,
                          schema: addAlbumPhotos(prev.schema, urls),
                        }))
                      }
                      onRemoveAlbumPhoto={(index) =>
                        setTemplate((prev) => ({
                          ...prev,
                          schema: removeAlbumPhoto(prev.schema, index),
                        }))
                      }
                      onMoveAlbumPhoto={(index, delta) =>
                        setTemplate((prev) => ({
                          ...prev,
                          schema: moveAlbumPhoto(prev.schema, index, delta),
                        }))
                      }
                    />
                  </div>
                )}

                {/* Tab 3: Theme, Music, Effects & Layout Order */}
                {activeEditorTab === 'design' && (
                  <div role="tabpanel">
                    <TemplateControls
                      schema={template.schema}
                      onChange={(schema) => setTemplate((prev) => ({ ...prev, schema }))}
                    />
                  </div>
                )}

                {/* Submission Error Banner */}
                {submitError && (
                  <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300">
                    {submitError}
                  </p>
                )}

                {/* Submit & Step Action Bar */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/#kho-thiep"
                      className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                      Hủy bỏ
                    </Link>

                    {activeEditorTab !== 'design' && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveEditorTab(activeEditorTab === 'content' ? 'images' : 'design')
                        }
                        className="min-h-[44px] inline-flex items-center gap-1 px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary transition cursor-pointer"
                      >
                        <span>
                          {activeEditorTab === 'content' ? 'Tiếp: Hình ảnh' : 'Tiếp: Thiết kế'}
                        </span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[46px] py-3 px-7 rounded-full bg-mh-primary hover:bg-mh-primary-hover text-white text-sm font-bold shadow-lg shadow-mh-primary/25 hover:scale-[1.01] active:scale-[0.99] transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Tạo &amp; Nhận Link Thiệp Cưới</span>
                        <CheckCircle2 size={18} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Sticky iPhone Frame Preview */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 ${
              activeMobileTab === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            <IPhonePreviewFrame
              schema={liveSchema}
              slug={template.id}
              templateWidth={templatePackage.width}
              templateTitle={template.title}
              photoSlotMap={photoSlotMap}
              focusRequest={focusPhotoRequest}
              onSelectPhotoSlot={handleSelectPhotoFromPreview}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * CreateInvitationPage Component
 * Purpose: Trang chuyên biệt tùy biến thông tin & hình ảnh thiệp cưới (/create?templateId=...)
 *   với trình chỉnh sửa 3 tab và khung iPhone xem trước độc lập theo thời gian thực.
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
