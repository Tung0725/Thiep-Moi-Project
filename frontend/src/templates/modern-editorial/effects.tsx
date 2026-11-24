'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AudioSettings,
  DEFAULT_AUDIO_PAUSE_ICON,
  DEFAULT_AUDIO_PLAY_ICON,
  FallingEffects,
  OpeningEffect,
} from './types';

function clampOffset(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(-100, Math.min(100, value))
    : fallback;
}

/**
 * Sticky viewport wrapper used in `embedded` containers (`/create/preview` and `/editor/studio`)
 * so overlays stay pinned to the visible frame height instead of stretching to 13,000px.
 */
function EmbeddedStickyStage({
  stageHeight,
  zIndex,
  pointerEvents,
  overflow,
  children,
}: {
  stageHeight?: number;
  zIndex: number;
  pointerEvents: 'none' | 'auto';
  overflow?: 'hidden' | 'visible';
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: stageHeight ? `${stageHeight}px` : '100vh',
          maxHeight: '100%',
          overflow,
          pointerEvents,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Native React split-panel opening overlay matching DS03's diagonal envelope motion.
 * Slides left/right panels apart cleanly across desktop, mobile, `/create` preview, and Studio.
 */
export function SplitPanelsOpening({
  openingEffect,
  platform,
  embedded,
  stageHeight,
  onComplete,
}: {
  openingEffect?: OpeningEffect;
  platform: 'desktop' | 'mobile';
  embedded?: boolean;
  stageHeight?: number;
  onComplete?: () => void;
}) {
  const isMobile = platform === 'mobile';
  const leftImg = isMobile
    ? openingEffect?.mobileLeftPanelImage || openingEffect?.leftPanelImage
    : openingEffect?.leftPanelImage || openingEffect?.mobileLeftPanelImage;
  const rightImg = isMobile
    ? openingEffect?.mobileRightPanelImage || openingEffect?.rightPanelImage
    : openingEffect?.rightPanelImage || openingEffect?.mobileRightPanelImage;

  const enabled = Boolean(openingEffect?.enabled && leftImg && rightImg);
  const [opened, setOpened] = useState(false);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(!enabled);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  const duration = Math.max(0, openingEffect?.duration ?? 1800);
  const delay = Math.max(0, openingEffect?.delay ?? 600);
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

  useEffect(() => {
    setOpened(false);
    setFading(false);
    setGone(!enabled);

    if (!enabled) {
      doneRef.current?.();
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setGone(true);
      doneRef.current?.();
      return;
    }

    let rafInner = 0;
    const rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => setOpened(true));
    });
    const fadeTimer = window.setTimeout(() => setFading(true), delay + Math.max(0, duration - 240));
    const finishTimer = window.setTimeout(() => {
      setGone(true);
      doneRef.current?.();
    }, delay + duration + 60);

    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [enabled, platform, delay, duration]);

  if (!enabled || gone) return null;

  const usingDesktopSpecific = !isMobile && Boolean(openingEffect?.leftPanelImage && openingEffect?.rightPanelImage);
  const leftOffsetX = isMobile
    ? clampOffset(openingEffect?.mobileLeftPanelInitialOffsetX, clampOffset(openingEffect?.leftPanelInitialOffsetX, -8))
    : usingDesktopSpecific
      ? clampOffset(openingEffect?.leftPanelInitialOffsetX, 0)
      : -6;
  const leftOffsetY = isMobile
    ? clampOffset(openingEffect?.mobileLeftPanelInitialOffsetY, clampOffset(openingEffect?.leftPanelInitialOffsetY, 0))
    : clampOffset(openingEffect?.leftPanelInitialOffsetY, 0);
  const rightOffsetX = isMobile
    ? clampOffset(openingEffect?.mobileRightPanelInitialOffsetX, clampOffset(openingEffect?.rightPanelInitialOffsetX, 22))
    : usingDesktopSpecific
      ? clampOffset(openingEffect?.rightPanelInitialOffsetX, 0)
      : 18;
  const rightOffsetY = isMobile
    ? clampOffset(openingEffect?.mobileRightPanelInitialOffsetY, clampOffset(openingEffect?.rightPanelInitialOffsetY, 0))
    : clampOffset(openingEffect?.rightPanelInitialOffsetY, 0);

  const scaleMode = openingEffect?.imageScaleMode === 'stretch' ? '100% 100%' : 'cover';
  const topRight =
    openingEffect?.preferRightPanelOnTop !== false || openingEffect?.topPanelZIndex === 'right';

  const panelStyle = (side: 'left' | 'right'): React.CSSProperties => {
    const ox = side === 'left' ? leftOffsetX : rightOffsetX;
    const oy = side === 'left' ? leftOffsetY : rightOffsetY;
    const targetX = side === 'left' ? `calc(${ox}% - 110%)` : `calc(${ox}% + 110%)`;
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: (side === 'right') === topRight ? 2 : 1,
      backgroundImage: `url("${side === 'left' ? leftImg : rightImg}")`,
      backgroundSize: scaleMode,
      backgroundPosition: side === 'left' ? 'left center' : 'right center',
      backgroundRepeat: 'no-repeat',
      transition: `transform ${duration}ms ${easing} ${delay}ms`,
      transform: opened ? `translate3d(${targetX}, ${oy}%, 0)` : `translate3d(${ox}%, ${oy}%, 0)`,
      willChange: 'transform',
      backfaceVisibility: 'hidden',
    };
  };

  const panelsContent = (
    <div
      aria-hidden="true"
      data-opening-overlay="split-panels"
      onClick={() => setOpened(true)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        opacity: fading ? 0 : 1,
        transition: 'opacity 240ms ease-out',
        backgroundColor: '#f4efe8',
      }}
    >
      <div style={panelStyle('left')} />
      <div style={panelStyle('right')} />
    </div>
  );

  if (embedded) {
    return (
      <EmbeddedStickyStage
        stageHeight={stageHeight}
        zIndex={60}
        pointerEvents={opened ? 'none' : 'auto'}
        overflow="hidden"
      >
        {panelsContent}
      </EmbeddedStickyStage>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: isMobile ? '100%' : 900,
        height: '100dvh',
        zIndex: 60,
        pointerEvents: opened ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      {panelsContent}
    </div>
  );
}

/**
 * Lightweight canvas particle overlay replicating DS03's wobble falling dots, hearts, petals, or snow.
 */
export function FallingParticles({
  effects,
  isMobile,
  embedded,
  stageHeight,
}: {
  effects?: FallingEffects;
  isMobile: boolean;
  embedded?: boolean;
  stageHeight?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const srcUrl = effects?.imageUrls?.[0]?.url || effects?.imageUrl;

  useEffect(() => {
    if (!effects || effects.enabled === false || !srcUrl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const sprite = new Image();
    sprite.src = srcUrl;

    const coverage = Math.max(4, effects.coverageLevel ?? 20);
    const count = isMobile ? Math.max(1, Math.floor(0.4 * coverage)) : coverage;
    const minSize = effects.minSize ?? 5;
    const maxSize = effects.maxSize ?? 15;
    const baseSpeed = Math.max(0.6, (effects.fallSpeed ?? 5) * 0.25);

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = embedded && parent ? parent.clientWidth : window.innerWidth;
      canvas.height = embedded && parent ? parent.clientHeight : window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * canvas.width,
      y: (idx / count) * canvas.height - canvas.height,
      size: minSize + Math.random() * Math.max(1, maxSize - minSize),
      vy: baseSpeed * (0.7 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobbleAmp: effects.fallMode === 'straight' ? 0 : 0.65,
      opacity: 0.65 + Math.random() * 0.35,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y += p.vy;
        p.phase += p.wobbleSpeed;
        p.x += Math.sin(p.phase) * p.wobbleAmp;
        if (p.y > canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha = p.opacity;
        if (sprite.complete && sprite.naturalWidth > 0) {
          ctx.drawImage(sprite, p.x, p.y, p.size, p.size);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [effects, isMobile, embedded, stageHeight, srcUrl]);

  if (!effects || effects.enabled === false || !srcUrl) return null;

  const canvasEl = (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: embedded ? 'relative' : 'fixed',
        inset: embedded ? undefined : 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        zIndex: embedded ? undefined : 30,
      }}
    />
  );

  if (embedded) {
    return (
      <EmbeddedStickyStage stageHeight={stageHeight} zIndex={30} pointerEvents="none" overflow="hidden">
        {canvasEl}
      </EmbeddedStickyStage>
    );
  }

  return canvasEl;
}

/**
 * Floating audio controller with autoplay recovery on first user interaction.
 */
export function FloatingAudioPlayer({
  audioSettings,
  embedded,
  stageHeight,
}: {
  audioSettings?: AudioSettings;
  embedded?: boolean;
  stageHeight?: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const audioUrl = audioSettings?.audioUrl;

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) {
      setPlaying(false);
      return;
    }

    if (embedded || audioSettings?.autoPlay === false) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || !audioRef.current) return;
      audioRef.current.volume = 0.7;
      audioRef.current
        .play()
        .then(() => {
          if (!cancelled) setPlaying(true);
        })
        .catch(() => {
          if (!cancelled) setPlaying(false);
        });
    };

    tryPlay();
    const unlock = () => {
      if (audioRef.current && audioRef.current.paused) {
        tryPlay();
      }
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', unlock);
    };
  }, [audioUrl, audioSettings?.autoPlay, embedded]);

  if (!audioUrl) return null;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.volume = 0.7;
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const playIcon = audioSettings?.useDefaultIcons !== false
    ? DEFAULT_AUDIO_PLAY_ICON
    : audioSettings?.playIconUrl || DEFAULT_AUDIO_PLAY_ICON;
  const pauseIcon = audioSettings?.useDefaultIcons !== false
    ? DEFAULT_AUDIO_PAUSE_ICON
    : audioSettings?.pauseIconUrl || DEFAULT_AUDIO_PAUSE_ICON;

  const buttonEl = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-label={playing ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
      className={playing && audioSettings?.enableAnimations !== false ? 'me-audio-playing' : undefined}
      style={{
        position: embedded ? 'absolute' : 'fixed',
        left: embedded ? 14 : 'max(16px, env(safe-area-inset-left))',
        bottom: embedded ? 14 : 'max(16px, env(safe-area-inset-bottom))',
        zIndex: 55,
        pointerEvents: 'auto',
        width: 42,
        height: 42,
        borderRadius: '9999px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <img
        src={playing ? playIcon : pauseIcon}
        alt={playing ? 'Đang phát nhạc' : 'Đã tắt nhạc'}
        style={{ width: 26, height: 26, objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
      />
    </button>
  );

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {embedded ? (
        <EmbeddedStickyStage stageHeight={stageHeight} zIndex={55} pointerEvents="none" overflow="visible">
          {buttonEl}
        </EmbeddedStickyStage>
      ) : (
        buttonEl
      )}
    </>
  );
}
