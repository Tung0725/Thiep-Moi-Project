'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, MailOpen, Maximize2, Monitor, MousePointerClick, Smartphone, X } from 'lucide-react';
import { PageSchema } from '@/types/schema';
import {
  PhotoSlotReference,
  PREVIEW_FOCUS_PHOTO_EVENT,
  PREVIEW_READY_EVENT,
  PREVIEW_REPLAY_OPENING_EVENT,
  PREVIEW_SCROLL_TOP_EVENT,
  PREVIEW_SELECT_PHOTO_EVENT,
  PREVIEW_SYNC_EVENT,
} from './previewProtocol';

interface IPhonePreviewFrameProps {
  schema: PageSchema;
  slug: string;
  templateWidth: number;
  templateTitle: string;
  photoSlotMap?: PhotoSlotReference[];
  focusRequest?: { slotId: string; url?: string; nonce: number } | null;
  onSelectPhotoSlot?: (slotId: string) => void;
}

/**
 * Computes WCAG relative luminance from a hex color to choose dark or light status bar ink.
 */
function isDarkBackground(hexColor: string | undefined): boolean {
  if (!hexColor) return false;
  const normalized = hexColor.trim().replace('#', '');
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return false;

  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.35;
}

/**
 * Authentic iPhone 16 Pro (393:852) live preview shell hosting an isolated mobile-width iframe,
 * with tap-to-edit photo selection, scroll-to-slot focus highlighting, and edge-to-edge fullscreen view.
 */
export default function IPhonePreviewFrame({
  schema,
  slug,
  templateWidth,
  templateTitle,
  photoSlotMap = [],
  focusRequest = null,
  onSelectPhotoSlot,
}: IPhonePreviewFrameProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);
  const fullDialogRef = useRef<HTMLDialogElement>(null);

  const [viewportSize, setViewportSize] = useState({ width: 320, height: 694 });
  const [interactiveEdit, setInteractiveEdit] = useState(true);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [fullPreviewMode, setFullPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const virtualWidth = templateWidth === 400 ? 400 : 390;
  const darkStatusBg = isDarkBackground(schema.theme.backgroundColor);
  const statusBarBg = schema.theme.backgroundColor || '#ffffff';
  const statusBarInk = darkStatusBg ? '#f8fafc' : '#111827';

  const syncToFrame = useCallback(
    (targetWindow: Window | null | undefined, allowInteractiveEdit: boolean) => {
      if (!targetWindow || typeof window === 'undefined') return;
      targetWindow.postMessage(
        {
          type: PREVIEW_SYNC_EVENT,
          schema,
          slug,
          interactiveEdit: allowInteractiveEdit,
          photoSlotMap,
        },
        window.location.origin
      );
    },
    [schema, slug, photoSlotMap]
  );

  // Measure iPhone screen viewport dynamically so the mobile canvas scales smoothly with zero clipping.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Push live schema & interactive edit updates to inline iPhone and fullscreen iframes.
  useEffect(() => {
    syncToFrame(iframeRef.current?.contentWindow, interactiveEdit);
    if (isFullPreviewOpen) {
      syncToFrame(modalIframeRef.current?.contentWindow, false);
    }
  }, [syncToFrame, interactiveEdit, isFullPreviewOpen]);

  // Listen for iframe readiness handshakes and tap-on-photo events.
  useEffect(() => {
    const origin = window.location.origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const data = event.data as { type?: string; slotId?: string } | null;
      if (!data?.type) return;

      if (data.type === PREVIEW_READY_EVENT) {
        if (event.source === iframeRef.current?.contentWindow) {
          syncToFrame(iframeRef.current?.contentWindow, interactiveEdit);
        }
        if (event.source === modalIframeRef.current?.contentWindow) {
          syncToFrame(modalIframeRef.current?.contentWindow, false);
        }
      }

      if (
        data.type === PREVIEW_SELECT_PHOTO_EVENT &&
        typeof data.slotId === 'string' &&
        event.source === iframeRef.current?.contentWindow
      ) {
        onSelectPhotoSlot?.(data.slotId);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [syncToFrame, interactiveEdit, onSelectPhotoSlot]);

  // Scroll iPhone preview to the requested photo slot when triggered from the editor.
  useEffect(() => {
    if (!focusRequest || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: PREVIEW_FOCUS_PHOTO_EVENT,
        slotId: focusRequest.slotId,
        url: focusRequest.url,
      },
      window.location.origin
    );
  }, [focusRequest]);

  useEffect(() => {
    const dialog = fullDialogRef.current;
    if (!dialog) return;
    if (isFullPreviewOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isFullPreviewOpen && dialog.open) {
      dialog.close();
    }
  }, [isFullPreviewOpen]);

  const handleScrollToTop = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_SCROLL_TOP_EVENT },
      window.location.origin
    );
  };

  const handleReplayOpening = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_REPLAY_OPENING_EVENT },
      window.location.origin
    );
  };

  const scale = viewportSize.width > 0 ? viewportSize.width / virtualWidth : 1;
  const scaledHeight = scale > 0 ? viewportSize.height / scale : viewportSize.height;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Compact Preview Control Bar */}
      <div className="mb-2.5 w-full max-w-[368px] flex flex-wrap items-center justify-between gap-1.5 px-1">
        <button
          type="button"
          onClick={() => setInteractiveEdit((prev) => !prev)}
          aria-pressed={interactiveEdit}
          title="Khi bật, chạm trực tiếp vào ảnh trên iPhone để chọn sửa ngay ảnh đó"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold shadow-sm transition-colors cursor-pointer ${
            interactiveEdit
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-mh-primary'
              : 'bg-white dark:bg-[#151724] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <MousePointerClick size={12} aria-hidden="true" />
          <span>{interactiveEdit ? 'Chạm ảnh để sửa: Bật' : 'Chạm ảnh để sửa: Tắt'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReplayOpening}
            title="Xem lại hiệu ứng mở thiệp"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#151724] border border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary transition-colors cursor-pointer"
          >
            <MailOpen size={12} aria-hidden="true" />
            <span>Mở thiệp</span>
          </button>

          <button
            type="button"
            onClick={handleScrollToTop}
            title="Cuộn về đầu thiệp"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#151724] border border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary transition-colors cursor-pointer"
          >
            <ArrowUp size={12} aria-hidden="true" />
            <span>Đầu thiệp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFullPreviewMode('desktop');
              setIsFullPreviewOpen(true);
            }}
            title="Mở xem trước toàn màn hình"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#151724] border border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary transition-colors cursor-pointer"
          >
            <Maximize2 size={12} aria-hidden="true" />
            <span>Xem lớn</span>
          </button>
        </div>
      </div>

      {/* Realistic iPhone 16 Pro Titanium Hardware Shell (Locked 393:852 Aspect Ratio) */}
      <div className="relative mx-auto select-none">
        {/* Side Hardware Buttons */}
        <div
          aria-hidden="true"
          className="absolute -left-[3px] top-[15%] w-[3px] h-[3.2%] rounded-l-sm bg-gradient-to-b from-[#52525b] to-[#27272a]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-[3px] top-[21%] w-[3px] h-[6.5%] rounded-l-sm bg-gradient-to-b from-[#52525b] to-[#27272a]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-[3px] top-[29.5%] w-[3px] h-[6.5%] rounded-l-sm bg-gradient-to-b from-[#52525b] to-[#27272a]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-[3px] top-[24%] w-[3px] h-[10%] rounded-r-sm bg-gradient-to-b from-[#52525b] to-[#27272a]"
        />

        {/* Titanium Outer Bezel + Anodized Inner Ring */}
        <div className="rounded-[48px] bg-gradient-to-b from-[#52525b] via-[#27272a] to-[#3f3f46] p-[2.5px] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.35)]">
          <div className="rounded-[45.5px] bg-[#101012] p-[7px] ring-1 ring-white/10">
            {/* Inner Concentric Screen: exact 393:852 iPhone 16 Pro ratio */}
            <div
              style={{
                width: 'min(346px, calc(100vw - 3rem), calc((100dvh - 140px) * 393 / 852))',
                aspectRatio: '393 / 852',
              }}
              className="relative rounded-[39px] overflow-hidden bg-white flex flex-col"
            >
              {/* Adaptive iOS Status Bar + Dynamic Island */}
              <div
                aria-hidden="true"
                style={{ backgroundColor: statusBarBg, color: statusBarInk }}
                className="h-[38px] px-5 flex items-center justify-between shrink-0 transition-colors duration-200 z-20"
              >
                <span className="text-[11px] font-semibold tracking-tight tabular-nums leading-none">
                  9:41
                </span>

                {/* Dynamic Island Pill */}
                <div className="w-[84px] h-[22px] rounded-full bg-black flex items-center justify-end pr-2 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-[#0f172a] ring-1 ring-[#1e293b] flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-[#38bdf8]/45" />
                  </span>
                </div>

                {/* Signal, Wi-Fi, Battery Icons */}
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="9" viewBox="0 0 15 10" fill="currentColor">
                    <rect x="0" y="6" width="2.4" height="4" rx="0.7" />
                    <rect x="3.8" y="4.2" width="2.4" height="5.8" rx="0.7" />
                    <rect x="7.6" y="2.2" width="2.4" height="7.8" rx="0.7" />
                    <rect x="11.4" y="0" width="2.4" height="10" rx="0.7" />
                  </svg>
                  <svg width="12" height="9" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M8 9.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm-3.6-2a5.2 5.2 0 0 1 7.2 0 .75.75 0 0 1-1.05 1.07 3.7 3.7 0 0 0-5.1 0A.75.75 0 0 1 4.4 7.6Zm-2.8-2.8a9.2 9.2 0 0 1 12.8 0 .75.75 0 1 1-1.05 1.07 7.7 7.7 0 0 0-10.7 0A.75.75 0 0 1 1.6 4.8Z" />
                  </svg>
                  <svg width="20" height="9" viewBox="0 0 24 12" fill="none">
                    <rect
                      x="0.75"
                      y="1"
                      width="19.5"
                      height="10"
                      rx="2.6"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeOpacity="0.45"
                    />
                    <rect x="2.3" y="2.5" width="16.4" height="7" rx="1.4" fill="currentColor" />
                    <path d="M21.5 4.2v3.6a1.5 1.5 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.5" />
                  </svg>
                </div>
              </div>

              {/* Isolated Mobile Viewport Iframe */}
              <div ref={viewportRef} className="relative flex-1 w-full overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src="/create/preview"
                  title={`Xem trước thiệp ${templateTitle}`}
                  onLoad={() => syncToFrame(iframeRef.current?.contentWindow, interactiveEdit)}
                  style={{
                    width: `${virtualWidth}px`,
                    height: `${scaledHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    border: 0,
                    display: 'block',
                  }}
                />
              </div>

              {/* Translucent Home Indicator */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1.5 inset-x-0 z-20 flex justify-center"
              >
                <div
                  className={`w-24 h-1 rounded-full ${
                    darkStatusBg ? 'bg-white/45' : 'bg-black/30'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edge-to-Edge Fullscreen Preview Modal */}
      <dialog
        ref={fullDialogRef}
        aria-label={`Xem trước toàn màn hình: ${templateTitle}`}
        onCancel={() => setIsFullPreviewOpen(false)}
        className="fixed inset-0 w-screen h-dvh max-w-none max-h-none m-0 p-0 rounded-none border-0 bg-neutral-950 overflow-hidden open:flex open:flex-col"
      >
        {/* Fullscreen Header Toolbar */}
        <div className="h-[52px] flex items-center justify-between gap-3 px-4 sm:px-6 bg-white dark:bg-[#151724] border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="min-w-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
              Xem trước toàn màn hình · {templateTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setFullPreviewMode('desktop')}
                aria-pressed={fullPreviewMode === 'desktop'}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  fullPreviewMode === 'desktop'
                    ? 'bg-white dark:bg-neutral-700 text-mh-primary shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Monitor size={14} aria-hidden="true" />
                <span>Máy tính</span>
              </button>
              <button
                type="button"
                onClick={() => setFullPreviewMode('mobile')}
                aria-pressed={fullPreviewMode === 'mobile'}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  fullPreviewMode === 'mobile'
                    ? 'bg-white dark:bg-neutral-700 text-mh-primary shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Smartphone size={14} aria-hidden="true" />
                <span>iPhone</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullPreviewOpen(false)}
              aria-label="Đóng xem trước toàn màn hình"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <X size={15} aria-hidden="true" />
              <span>Đóng</span>
            </button>
          </div>
        </div>

        {/* Fullscreen Viewport Stage */}
        <div
          className={`flex-1 w-full overflow-hidden flex items-center justify-center ${
            fullPreviewMode === 'desktop' ? 'p-0 bg-white' : 'p-3 sm:p-5 bg-neutral-950'
          }`}
        >
          {isFullPreviewOpen && (
            <div
              style={
                fullPreviewMode === 'mobile'
                  ? {
                      height: 'min(852px, calc(100dvh - 84px))',
                      aspectRatio: '393 / 852',
                    }
                  : undefined
              }
              className={
                fullPreviewMode === 'desktop'
                  ? 'w-full h-full bg-white'
                  : 'max-w-full rounded-[38px] overflow-hidden shadow-2xl border-[6px] border-neutral-800 bg-white'
              }
            >
              <iframe
                ref={modalIframeRef}
                src="/create/preview"
                title={`Xem trước toàn màn hình: ${templateTitle}`}
                onLoad={() => syncToFrame(modalIframeRef.current?.contentWindow, false)}
                className="w-full h-full border-0 block"
              />
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
