'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invitationService } from '@/services/invitationService';
import { TemplateRendererProps } from '../types';
import { customizeScene } from './customizeScene';
import { FallingParticles, FloatingAudioPlayer, SplitPanelsOpening } from './effects';
import {
  extractEditorialSettings,
  mediaUrl,
} from './personalize';
import { PopupModalOverlay, SceneNodeView, SceneRenderContext } from './SceneNodeView';
import { useEmbeddedStageHeight } from '../useEmbeddedStageHeight';
import {
  AlbumImageItem,
  DEFAULT_SCENE_URL,
  DemoWish,
  EditorialScene,
  SceneEvent,
  SceneNode,
} from './types';
import { AlbumModalOverlay, ImageLightboxOverlay } from './widgets';
import './animations.css';

const DESKTOP_WIDTH = 960;
const HOST_DESKTOP_MAX_WIDTH = 900;
const MOBILE_WIDTH = 428;
const DEMO_SLUG = 'ds03-sang-trong';

const sceneCache = new Map<string, Promise<EditorialScene>>();

function loadScene(url: string): Promise<EditorialScene> {
  const cached = sceneCache.get(url);
  if (cached) return cached;
  const promise = fetch(url, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as EditorialScene;
  });
  sceneCache.set(url, promise);
  return promise;
}

function injectEditorialFonts(fontMap?: Record<string, string>) {
  if (typeof document === 'undefined') return;
  const googleLinks = [
    '/templates/ds03-sang-trong/runtime/v1/media/fonts/google.css',
    '/templates/ds03-sang-trong/runtime/v1/media/fonts/invitation-google.css',
    'https://fonts.googleapis.com/css2?family=Arima:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Philosopher:wght@400;700&display=swap',
  ];
  for (const href of googleLinks) {
    if (!document.head.querySelector(`link[data-me-font="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.meFont = href;
      document.head.appendChild(link);
    }
  }
  if (!fontMap || document.head.querySelector('style[data-me-fontmap="true"]')) return;
  const rules = Object.entries(fontMap)
    .filter(([, url]) => typeof url === 'string' && url)
    .map(([family, url]) => `@font-face{font-family:'${family}';src:url('${url}');font-display:swap;}`)
    .join('\n');
  if (rules) {
    const style = document.createElement('style');
    style.dataset.meFontmap = 'true';
    style.textContent = rules;
    document.head.appendChild(style);
  }
}

function buildGoogleCalendarUrl(event: SceneEvent): string {
  const dateStr = (event.calendarDate || '').replace(/-/g, '');
  const timeStr = (event.calendarStartTime || '11:00').replace(':', '');
  const start = dateStr ? `${dateStr}T${timeStr}00` : '';
  const endHour = String((Number(timeStr.slice(0, 2)) + 2) % 24).padStart(2, '0');
  const end = dateStr ? `${dateStr}T${endHour}${timeStr.slice(2)}00` : '';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.calendarTitle || 'Lễ cưới',
    ...(start && end ? { dates: `${start}/${end}` } : {}),
    ...(event.calendarLocation ? { location: event.calendarLocation } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function openExternalSafe(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === 'https:' && !url.username && !url.password) {
      window.open(url.href, '_blank', 'noopener,noreferrer');
    }
  } catch {
    return;
  }
}

function useEditorialAutoScroll(
  enabled: boolean,
  hostRef: React.RefObject<HTMLDivElement>,
  speed: number,
  blocked: boolean
) {
  useEffect(() => {
    if (!enabled || blocked) return;
    const query = new URLSearchParams(window.location.search);
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      query.get('screenshot') === 'true' ||
      query.get('videoCapture') === '1'
    ) {
      return;
    }

    let raf = 0;
    let started = false;
    let paused = false;
    let finished = false;
    let position = window.scrollY;
    let lastTime = 0;
    const pxPerSec = Math.max(25, speed * 6);

    const tick = (now: number) => {
      raf = 0;
      if (!started || paused || finished || document.hidden) return;
      const elapsed = lastTime ? Math.min(now - lastTime, 100) : 0;
      lastTime = now;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScroll > 10) {
        position = Math.min(position + (elapsed / 1000) * pxPerSec, maxScroll);
        window.scrollTo({ top: position, behavior: 'instant' });
        if (position >= maxScroll - 1) {
          finished = true;
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const pause = () => {
      paused = true;
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) >= 24) pause();
    };
    const onTouch = () => pause();
    const onFocusIn = (e: Event) => {
      const target = e.target;
      if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        pause();
      }
    };
    const onHostClick = (e: Event) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest('button, a, input, textarea, select, [role="button"], [role="dialog"]')
      ) {
        pause();
      }
    };

    const startTimer = window.setTimeout(() => {
      started = true;
      position = window.scrollY;
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    }, 1800);

    const hostEl = hostRef.current;
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('focusin', onFocusIn);
    hostEl?.addEventListener('click', onHostClick);

    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(startTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('focusin', onFocusIn);
      hostEl?.removeEventListener('click', onHostClick);
    };
  }, [enabled, hostRef, speed, blocked]);
}

/**
 * Unified Engine 2 (`modern-editorial@1`, 900px desktop / 428px mobile).
 * 100% Native React Scene-Graph Renderer powered by pure `scene.json` + static MinIO media.
 */
export default function Renderer({
  schema,
  slug,
  embedded,
  containerClassName,
  onEndReached,
}: TemplateRendererProps) {
  const editorial = useMemo(() => extractEditorialSettings(schema), [schema]);
  const visible = editorial.visible;
  const publicSlug = !embedded && slug !== DEMO_SLUG ? slug : undefined;
  const sceneUrl = editorial.sceneUrl || DEFAULT_SCENE_URL;

  const { values, photoOverrides, textOverrides, orderedSectionIds } = editorial;
  const musicUrl = schema.effects.musicUrl === '' ? '' : mediaUrl(schema.effects.musicUrl);

  const hostRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : MOBILE_WIDTH
  );
  const stageHeight = useEmbeddedStageHeight(hostRef, Boolean(embedded && visible));
  const [scene, setScene] = useState<EditorialScene | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [openingDone, setOpeningDone] = useState(false);

  const [wishes, setWishes] = useState<DemoWish[]>([]);
  const [wishesLoading, setWishesLoading] = useState(Boolean(publicSlug));

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<AlbumImageItem[] | null>(null);
  const [activePopup, setActivePopup] = useState<SceneNode | null>(null);
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  const notify = useCallback((msg: string, isError = false) => {
    setToast({ msg, isError });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    loadScene(sceneUrl)
      .then((loaded) => {
        if (!active) return;
        setScene(loaded);
        injectEditorialFonts(loaded.template.fontMap);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [sceneUrl, reloadNonce]);

  useEffect(() => {
    if (!publicSlug) {
      setWishes(scene?.demoWishes || []);
      setWishesLoading(false);
      return;
    }
    let active = true;
    setWishesLoading(true);
    invitationService
      .getWishes(publicSlug, 0, 100)
      .then((res) => {
        if (!active) return;
        setWishes(
          res.content
            .filter((w) => w.message)
            .map((w) => ({
              id: String(w.id),
              guestName: w.guestName,
              message: w.message,
              createdAt: w.createdAt,
            }))
        );
      })
      .catch(() => {
        if (active) setWishes([]);
      })
      .finally(() => {
        if (active) setWishesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [publicSlug, scene]);

  useEffect(() => {
    if (!hostRef.current) return;
    const resize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setContainerWidth(entry.contentRect.width);
    });
    resize.observe(hostRef.current);
    return () => resize.disconnect();
  }, [visible]);

  useEffect(() => {
    const onFocusPhoto = (event: Event) => {
      const nodeId = (event as CustomEvent<{ nodeId?: string }>).detail?.nodeId;
      if (!nodeId || !hostRef.current) return;
      const el = hostRef.current.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const prevOutline = el.style.outline;
      const prevShadow = el.style.boxShadow;
      el.style.outline = '3px solid #ff2056';
      el.style.boxShadow = '0 0 0 6px rgba(255, 32, 86, 0.24)';
      window.setTimeout(() => {
        el.style.outline = prevOutline;
        el.style.boxShadow = prevShadow;
      }, 1800);
    };
    window.addEventListener('invitation-preview:focus-ds03-photo', onFocusPhoto);
    return () => window.removeEventListener('invitation-preview:focus-ds03-photo', onFocusPhoto);
  }, []);

  useEffect(() => {
    if (!onEndReached) return;
    let wasAtEnd = false;
    const onScroll = () => {
      const reached =
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (reached === wasAtEnd) return;
      wasAtEnd = reached;
      onEndReached(reached);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onEndReached]);

  const isMobile = embedded ? containerWidth <= 520 : containerWidth <= 768;
  const platform: 'desktop' | 'mobile' = isMobile ? 'mobile' : 'desktop';

  const customized = useMemo(() => {
    if (!scene) return null;
    return customizeScene(scene, {
      values: { ...values, coverImageUrl: mediaUrl(values.coverImageUrl) },
      photoOverrides,
      textOverrides,
      theme: {
        primaryColor: schema.theme.primaryColor,
        backgroundColor: schema.theme.backgroundColor,
        accentColor: schema.theme.accentColor,
        headingFont: schema.theme.headingFont,
      },
      fallingType: schema.effects.fallingType,
      musicUrl,
      publicCard: Boolean(publicSlug),
    });
  }, [
    scene,
    values,
    photoOverrides,
    textOverrides,
    schema.theme.primaryColor,
    schema.theme.backgroundColor,
    schema.theme.accentColor,
    schema.theme.headingFont,
    schema.effects.fallingType,
    musicUrl,
    publicSlug,
  ]);

  const activeDoc = useMemo(() => {
    if (!customized) return null;
    const baseDoc = isMobile ? customized.mobile : customized.desktop;
    if (orderedSectionIds === null) return baseDoc;

    const overlays = baseDoc.sections.filter((s) => s.type !== 'Sections');
    const sectionsById = new Map(
      baseDoc.sections.filter((s) => s.type === 'Sections').map((s) => [s.id, s])
    );
    const orderedSections = orderedSectionIds
      .map((id) => sectionsById.get(id))
      .filter((s): s is SceneNode => Boolean(s));

    return {
      sections: [...orderedSections, ...overlays],
    };
  }, [customized, isMobile, orderedSectionIds]);

  const totalCanvasHeight = useMemo(() => {
    if (!activeDoc) return 0;
    return activeDoc.sections
      .filter((s) => s.type === 'Sections' && !s.hidden && !s.props.hidden)
      .reduce((sum, s) => sum + (parseFloat(String(s.props.height || 0)) || 0), 0);
  }, [activeDoc]);

  const autoScrollEnabled = Boolean(
    !embedded &&
      customized?.template.customEffects?.autoScroll?.enabled &&
      openingDone
  );
  useEditorialAutoScroll(
    autoScrollEnabled,
    hostRef,
    customized?.template.customEffects?.autoScroll?.speed ?? 8,
    Boolean(albumImages || activePopup || lightboxUrl)
  );

  const handleSceneEvents = useCallback(
    (events?: SceneEvent[]) => {
      if (!events?.length || !activeDoc) return;
      for (const ev of events) {
        if (ev.eventType === 'open-lightbox' && ev.lightboxImageUrl) {
          setLightboxUrl(ev.lightboxImageUrl);
        } else if (ev.eventType === 'add-to-calendar') {
          openExternalSafe(buildGoogleCalendarUrl(ev));
        } else if (ev.eventType === 'link' && ev.url) {
          openExternalSafe(ev.url);
        } else if (ev.eventType === 'call') {
          const phone =
            ev.phoneNumber ||
            (ev.callAutoFillField === 'groomPhone'
              ? values.groomName
              : undefined);
          if (phone && /^\+?[\d\s()-]{6,}$/.test(phone)) {
            window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
          } else {
            notify('Số điện thoại liên hệ chưa được cập nhật.', true);
          }
        } else if (ev.eventType === 'open-album-modal') {
          const modalNode =
            activeDoc.sections.find(
              (s) => s.type === 'AlbumModal' && (!ev.albumModalId || s.id === ev.albumModalId)
            ) || activeDoc.sections.find((s) => s.type === 'AlbumModal');
          if (modalNode?.props.albumImages?.length) {
            setAlbumImages(modalNode.props.albumImages);
          }
        } else if (ev.eventType === 'open-popup') {
          const popupNode =
            activeDoc.sections.find(
              (s) => s.type === 'Popup' && (!ev.popupId || s.id === ev.popupId)
            ) || activeDoc.sections.find((s) => s.type === 'Popup');
          if (popupNode) setActivePopup(popupNode);
        } else if (ev.eventType === 'navigate-section') {
          const targetId = ev.targetSectionId || ev.sectionId;
          const target = targetId
            ? hostRef.current?.querySelector<HTMLElement>(`[data-node-id="${targetId}"]`)
            : hostRef.current?.querySelector<HTMLElement>('form')?.closest('[data-node-id]');
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (ev.eventType === 'copy-clipboard' && ev.defaultValue) {
          navigator.clipboard?.writeText(ev.defaultValue).catch(() => {});
          notify('Đã sao chép số tài khoản!');
        }
      }
    },
    [activeDoc, notify, values.groomName]
  );

  const ctx: SceneRenderContext = useMemo(
    () => ({
      svgBank: scene?.svgBank || {},
      isMobile,
      publicSlug,
      interactiveEdit: Boolean(embedded),
      wishes,
      wishesLoading,
      onWishCreated: (created) => setWishes((prev) => [created, ...prev]),
      onEvent: handleSceneEvents,
      onNotify: notify,
      onPhotoClick: (nodeId) => {
        window.dispatchEvent(
          new CustomEvent('invitation-preview:photo-click', {
            detail: { slotId: `ds03:${nodeId}` },
          })
        );
      },
    }),
    [scene?.svgBank, isMobile, publicSlug, embedded, wishes, wishesLoading, handleSceneEvents, notify]
  );

  if (!visible) return <p className="p-6 text-center">Nội dung thiệp đang được ẩn.</p>;

  const baseWidth = isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH;
  const maxDesktop = !embedded && !isMobile ? Math.min(containerWidth, HOST_DESKTOP_MAX_WIDTH) : containerWidth;
  const scale = Math.max(0.25, Math.min(1, maxDesktop / baseWidth));
  const scaledHeight = totalCanvasHeight > 0 ? Math.ceil(totalCanvasHeight * scale) : undefined;

  return (
    <div
      ref={hostRef}
      className={containerClassName}
      data-template="modern-editorial-v1"
      data-viewport-platform={platform}
      data-invitation-open={Boolean(scene && customized)}
      style={{
        width: '100%',
        maxWidth: !embedded && !isMobile ? HOST_DESKTOP_MAX_WIDTH : undefined,
        margin: !embedded && !isMobile ? '0 auto' : undefined,
        height: scaledHeight,
        minHeight: embedded && !scaledHeight ? 420 : undefined,
        position: 'relative',
        overflow: 'clip',
        backgroundColor: schema.theme.backgroundColor || '#fcf9fe',
      }}
    >
      {!scene && !loadError && (
        <p role="status" className="grid min-h-[320px] place-content-center text-sm text-neutral-600">
          Đang tải thiệp…
        </p>
      )}

      {loadError && (
        <div role="alert" className="grid min-h-[320px] place-content-center gap-3 p-6 text-center">
          <p>Không thể tải giao diện thiệp.</p>
          <button
            type="button"
            className="rounded-lg border border-neutral-300 px-4 py-2"
            onClick={() => {
              sceneCache.delete(sceneUrl);
              setReloadNonce((n) => n + 1);
            }}
          >
            Tải lại
          </button>
        </div>
      )}

      {scene && customized && activeDoc && (
        <>
          <div
            data-editorial-canvas="true"
            style={{
              width: baseWidth,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {activeDoc.sections.map((section) => (
              <SceneNodeView key={section.id} node={section} ctx={ctx} />
            ))}
          </div>

          <SplitPanelsOpening
            openingEffect={customized.template.openingEffect}
            platform={platform}
            embedded={embedded}
            stageHeight={stageHeight}
            onComplete={() => setOpeningDone(true)}
          />

          <FallingParticles
            effects={customized.template.effects}
            isMobile={isMobile}
            embedded={embedded}
            stageHeight={stageHeight}
          />

          <FloatingAudioPlayer
            audioSettings={customized.template.audioSettings}
            embedded={embedded}
            stageHeight={stageHeight}
          />
        </>
      )}

      {albumImages && (
        <AlbumModalOverlay images={albumImages} onClose={() => setAlbumImages(null)} />
      )}

      {activePopup && (
        <PopupModalOverlay
          popupNode={activePopup}
          ctx={ctx}
          onClose={() => setActivePopup(null)}
        />
      )}

      {lightboxUrl && (
        <ImageLightboxOverlay imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 95,
            backgroundColor: toast.isError ? '#dc2626' : '#1f2937',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 9999,
            fontSize: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {toast.msg}
        </div>
      )}

      {embedded && (
        <style>{`
          [data-template="modern-editorial-v1"] [data-photo-editable="true"] {
            cursor: pointer !important;
            transition: outline 0.15s ease;
          }
          [data-template="modern-editorial-v1"] [data-photo-editable="true"]:hover {
            outline: 2px dashed rgba(255, 32, 86, 0.85) !important;
            outline-offset: -2px;
          }
        `}</style>
      )}
    </div>
  );
}
