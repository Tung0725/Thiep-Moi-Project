'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PageRenderer } from '@/templates/PageRenderer';
import { PageSchema } from '@/types/schema';
import {
  PhotoSlotReference,
  PREVIEW_FOCUS_PHOTO_EVENT,
  PREVIEW_READY_EVENT,
  PREVIEW_REPLAY_OPENING_EVENT,
  PREVIEW_SCROLL_TOP_EVENT,
  PREVIEW_SELECT_PHOTO_EVENT,
  PREVIEW_SYNC_EVENT,
} from '@/components/create/previewProtocol';

interface PreviewPayload {
  schema: PageSchema;
  slug: string;
}

const DECORATIVE_ASSET_PATTERN = /flower|envelope|castle|heart|\/ladi\/|couple-flourish|seal/i;

function normalizeComparableUrl(raw: string): string {
  if (!raw) return '';
  if (raw.startsWith('data:')) return raw;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.origin === window.location.origin ? parsed.pathname + parsed.search : parsed.href;
  } catch {
    return raw;
  }
}

function findImagesDeep(root: Document | ShadowRoot | Element): HTMLImageElement[] {
  const images: HTMLImageElement[] = [];
  const elements = root.querySelectorAll('*');
  elements.forEach((el) => {
    if (el instanceof HTMLImageElement) {
      images.push(el);
    }
    if (el instanceof HTMLElement && el.shadowRoot) {
      images.push(...findImagesDeep(el.shadowRoot));
    }
  });
  return images;
}

function resolveSlotForImage(
  img: HTMLImageElement,
  slots: PhotoSlotReference[]
): string | null {
  const explicit = img.getAttribute('data-photo-slot');
  if (explicit) return explicit;

  const rawAttr = img.getAttribute('src') || '';
  const resolvedSrc = img.currentSrc || img.src || rawAttr;
  if (!resolvedSrc || DECORATIVE_ASSET_PATTERN.test(rawAttr) || DECORATIVE_ASSET_PATTERN.test(resolvedSrc)) {
    return null;
  }

  const normalizedAttr = normalizeComparableUrl(rawAttr);
  const normalizedResolved = normalizeComparableUrl(resolvedSrc);

  for (const slot of slots) {
    const candidate = normalizeComparableUrl(slot.url);
    if (!candidate) continue;
    if (candidate === normalizedAttr || candidate === normalizedResolved) {
      return slot.id;
    }
  }
  return null;
}

function pulseHighlightImage(img: HTMLImageElement) {
  img.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const prevOutline = img.style.outline;
  const prevOffset = img.style.outlineOffset;
  const prevShadow = img.style.boxShadow;
  const prevTransition = img.style.transition;

  img.style.transition = 'outline 0.2s ease, box-shadow 0.2s ease';
  img.style.outline = '3px solid #ff2056';
  img.style.outlineOffset = '2px';
  img.style.boxShadow = '0 0 0 6px rgba(255, 32, 86, 0.24)';

  window.setTimeout(() => {
    img.style.outline = prevOutline;
    img.style.outlineOffset = prevOffset;
    img.style.boxShadow = prevShadow;
    img.style.transition = prevTransition;
  }, 1800);
}

/**
 * Isolated invitation preview page rendered inside the iPhone and Fullscreen iframes on /create.
 * Synchronizes schema state over same-origin postMessage, handles mobile CSS isolation,
 * and supports two-way interactive photo slot clicking and focus highlighting.
 */
export default function IsolatedPreviewPage() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [interactiveEdit, setInteractiveEdit] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

  const interactiveEditRef = useRef(false);
  const photoSlotMapRef = useRef<PhotoSlotReference[]>([]);
  const prevTemplateKeyRef = useRef<string>('');

  useEffect(() => {
    const origin = window.location.origin;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const data = event.data as {
        type?: string;
        schema?: PageSchema;
        slug?: string;
        interactiveEdit?: boolean;
        photoSlotMap?: PhotoSlotReference[];
        slotId?: string;
        url?: string;
      } | null;
      if (!data || typeof data.type !== 'string') return;

      if (data.type === PREVIEW_SYNC_EVENT && data.schema) {
        const nextInteractive = Boolean(data.interactiveEdit);
        const nextSlug = typeof data.slug === 'string' ? data.slug : 'preview';
        const nextKey = `${nextSlug}-${data.schema.template?.id || 'default'}-${data.schema.template?.version || 1}`;
        if (prevTemplateKeyRef.current && prevTemplateKeyRef.current !== nextKey) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        prevTemplateKeyRef.current = nextKey;

        interactiveEditRef.current = nextInteractive;
        photoSlotMapRef.current = Array.isArray(data.photoSlotMap) ? data.photoSlotMap : [];
        setInteractiveEdit(nextInteractive);
        setPayload({
          schema: data.schema,
          slug: nextSlug,
        });
      }

      if (data.type === PREVIEW_SCROLL_TOP_EVENT) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
      }

      if (data.type === PREVIEW_REPLAY_OPENING_EVENT) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setReplayNonce((prev) => prev + 1);
      }

      if (data.type === PREVIEW_FOCUS_PHOTO_EVENT && typeof data.slotId === 'string') {
        if (data.slotId.startsWith('ds03:')) {
          window.dispatchEvent(
            new CustomEvent('invitation-preview:focus-ds03-photo', {
              detail: { nodeId: data.slotId.slice(5) },
            })
          );
          return;
        }

        window.dispatchEvent(new CustomEvent('invitation-preview:open-envelope'));

        const locateAndHighlight = (): boolean => {
          const allImgs = findImagesDeep(document);
          let target = allImgs.find(
            (img) => img.getAttribute('data-photo-slot') === data.slotId
          );
          if (!target && data.url) {
            const normalizedTarget = normalizeComparableUrl(data.url);
            target = allImgs.find(
              (img) =>
                !DECORATIVE_ASSET_PATTERN.test(img.getAttribute('src') || '') &&
                (normalizeComparableUrl(img.getAttribute('src') || '') === normalizedTarget ||
                  normalizeComparableUrl(img.src || '') === normalizedTarget)
            );
          }
          if (target) {
            pulseHighlightImage(target);
            return true;
          }
          return false;
        };

        if (!locateAndHighlight()) {
          window.setTimeout(locateAndHighlight, 180);
        }
      }
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (!interactiveEditRef.current) return;
      const path = event.composedPath();
      const img = path.find((node): node is HTMLImageElement => node instanceof HTMLImageElement);
      if (!img) return;

      const slotId = resolveSlotForImage(img, photoSlotMapRef.current);
      if (!slotId) return;

      event.preventDefault();
      event.stopPropagation();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: PREVIEW_SELECT_PHOTO_EVENT, slotId }, origin);
      }
    };

    const handleDs03PhotoClick = (event: Event) => {
      if (!interactiveEditRef.current) return;
      const slotId = (event as CustomEvent<{ slotId?: string }>).detail?.slotId;
      if (!slotId) return;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: PREVIEW_SELECT_PHOTO_EVENT, slotId }, origin);
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('invitation-preview:photo-click', handleDs03PhotoClick);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: PREVIEW_READY_EVENT }, origin);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('invitation-preview:photo-click', handleDs03PhotoClick);
    };
  }, []);

  return (
    <>
      <style>{`
        html {
          margin: 0;
          padding: 0;
          overflow-x: clip;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        body {
          margin: 0;
          padding: 0;
          overflow: visible;
          overscroll-behavior-y: contain;
        }
        html::-webkit-scrollbar {
          display: none;
        }
        ${
          interactiveEdit
            ? `[data-photo-slot] {
                cursor: pointer !important;
                transition: outline 0.15s ease, filter 0.15s ease;
              }
              [data-photo-slot]:hover {
                outline: 2px dashed rgba(255, 32, 86, 0.85) !important;
                outline-offset: -2px;
                filter: brightness(0.96);
              }`
            : ''
        }
      `}</style>

      {!payload ? (
        <div
          role="status"
          className="min-h-dvh w-full flex flex-col items-center justify-center gap-3 bg-white text-neutral-500 p-6"
        >
          <span className="w-7 h-7 border-2 border-neutral-300 border-t-mh-primary rounded-full animate-spin" />
          <p className="text-xs font-medium">Đang chuẩn bị khung xem trước…</p>
        </div>
      ) : (
        <div
          className="min-h-dvh w-full pb-6"
          style={{ backgroundColor: payload.schema.theme.backgroundColor || '#FFFFFF' }}
        >
          <PageRenderer
            key={`${payload.slug}-${payload.schema.template?.id || 'default'}-${payload.schema.template?.version || 1}-${replayNonce}`}
            schema={payload.schema}
            slug={payload.slug}
            containerClassName="max-w-full"
            embedded
          />
        </div>
      )}
    </>
  );
}
