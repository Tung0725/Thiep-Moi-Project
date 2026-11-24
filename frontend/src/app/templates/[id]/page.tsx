'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { DEFAULT_TEMPLATES, TemplateDefinition } from '@/data/defaultTemplates';
import { templateService } from '@/services/templateService';
import { PageRenderer } from '@/templates/PageRenderer';

interface TemplateDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Full invitation demo for the selected template.
 * Props: params.id identifies the template loaded from the API or local catalog.
 * State: loaded template data.
 */
export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = params;
  const [template, setTemplate] = useState<TemplateDefinition | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    async function loadTemplate() {
      const matchedLocal = DEFAULT_TEMPLATES.find((t) => t.id.toLowerCase() === id.toLowerCase());

      try {
        const detail = await templateService.getTemplateByCodeOrId(id);
        if (detail && detail.contentSchema) {
          const parsedSchema = JSON.parse(detail.contentSchema);
          const effectiveSchema =
            matchedLocal && (parsedSchema.version || 1) < matchedLocal.schema.version
              ? matchedLocal.schema
              : parsedSchema;
          const parsedDefaultData = detail.defaultData
            ? JSON.parse(detail.defaultData)
            : (matchedLocal || DEFAULT_TEMPLATES[0]).defaultData;

          setTemplate({
            id: detail.code,
            category: (detail.category as 'wedding' | 'birthday' | 'event') || 'wedding',
            title: detail.title,
            style: detail.style || 'Tươi sáng & Thanh lịch',
            views: detail.viewsCount ? `${(detail.viewsCount / 1000).toFixed(1)}k` : '6.6k',
            likes: detail.likesCount ? `${detail.likesCount}` : '142',
            badge: (detail.badge as 'Miễn phí' | 'VIP') || 'Miễn phí',
            categoryLabel: detail.categoryLabel || 'Cưới',
            imageUrl:
              detail.imageUrl ||
              '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
            description: detail.description || '',
            defaultData: parsedDefaultData,
            schema: effectiveSchema,
          });
          return;
        }
      } catch {
        // Fallback to local default templates
      }

      setTemplate(matchedLocal || DEFAULT_TEMPLATES[0]);
    }
    loadTemplate();
  }, [id]);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafb]">
        <span className="w-10 h-10 border-3 border-mh-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: template.schema.theme.backgroundColor || '#FFFFFF',
        '--demo-accent': template.schema.theme.primaryColor,
      } as React.CSSProperties}
    >
      {/* Full invitation preview */}
      <div className="w-full pb-20">
        <PageRenderer
          key={template.id}
          schema={template.schema}
          containerClassName="invitation-demo"
        />
      </div>

      {/* Always-accessible floating action bar clear of bottom-left audio controls */}
      <motion.nav
        aria-label="Thao tác với mẫu thiệp"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] right-3 sm:right-6 z-40 flex max-w-[calc(100%-5rem)] items-center gap-2 rounded-full bg-white/90 dark:bg-[#151724]/90 backdrop-blur-md p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.14)] border border-neutral-200/80 dark:border-neutral-700/80"
      >
        <Link
          href="/#kho-thiep"
          aria-label="Quay lại kho mẫu thiệp"
          title="Quay lại kho mẫu thiệp"
          className="group inline-flex min-h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white text-sm font-semibold text-[var(--demo-accent)] transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--demo-accent)] sm:w-auto sm:px-4"
        >
          <ArrowLeft
            aria-hidden="true"
            size={17}
            className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-x-1"
          />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>
        <Link
          href={`/create?templateId=${template.id}`}
          className="group inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--demo-accent)] px-4 text-sm font-bold text-white shadow-sm transition-[filter,transform] duration-200 hover:brightness-110 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--demo-accent)] sm:px-5"
        >
          <span>Chọn mẫu này</span>
          <ArrowRight
            aria-hidden="true"
            size={17}
            className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1"
          />
        </Link>
      </motion.nav>
    </div>
  );
}
