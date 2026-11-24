'use client';

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { OpeningEffectConfig } from '@/types/schema';
import { useEmbeddedStageHeight } from '../useEmbeddedStageHeight';

interface OpeningEnvelopeProps {
  config?: OpeningEffectConfig;
  embedded?: boolean;
}

/**
 * OpeningEnvelope Component
 * Purpose: Hiệu ứng hai cánh thiệp đỏ chữ Song Hỷ (split-panels) đặt khớp tuyệt đối 100% bên trong khung thiệp 400px:
 *   - Loại bỏ hoàn toàn lỗi lệch trục ngang do thanh cuộn trình duyệt và không đè lên thanh điều hướng hệ thống.
 *   - Tự động cân chỉnh chiều cao theo vùng hiển thị thực tế để con dấu Song Hỷ luôn nằm đúng tâm màn hình.
 *   - Cánh phải luồn 3px dưới cánh trái (scaleX 1.015 từ mép phải) triệt tiêu hoàn toàn khe hở sọc trắng dọc mà vẫn giữ tâm Song Hỷ ở đúng 50%.
 *   - Chờ cả hai ảnh giải mã xong mới đếm 500ms rồi trượt mở đối xứng (-84% / +84%) mượt mà.
 * Props:
 *   - config: Cấu hình OpeningEffectConfig (leftImage, rightImage, delayMs, durationMs).
 *   - embedded: Cờ hiển thị trong khung iPhone giả lập trên trang /create.
 * Key States:
 *   - topOffset: Khoảng cách từ đỉnh viewport tới đỉnh khung thiệp khi mới tải trang.
 *   - leftReady, rightReady: Trạng thái đã giải mã xong ảnh hai cánh cửa.
 *   - isOpen: Trạng thái đang trượt mở.
 *   - isHidden: Trạng thái gỡ khỏi DOM sau khi mở xong.
 */
export function OpeningEnvelope({ config, embedded = false }: OpeningEnvelopeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [topOffset, setTopOffset] = useState(0);
  const [leftReady, setLeftReady] = useState(false);
  const [rightReady, setRightReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const stageHeight = useEmbeddedStageHeight(
    containerRef,
    Boolean(embedded && config?.enabled && !isHidden)
  );

  const leftImage = config?.leftImage || '/templates/hb04/opening/left-thiep.webp';
  const rightImage = config?.rightImage || '/templates/hb04/opening/right-thiep.webp';
  const delayMs = Math.min(config?.delayMs ?? 500, 700);
  const durationMs = Math.max(config?.durationMs ?? 1350, 1200);
  const bothReady = leftReady && rightReady;

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (embedded || !containerRef.current || typeof window === 'undefined') return;
    if (window.scrollY < 20) {
      const rectTop = Math.round(containerRef.current.getBoundingClientRect().top);
      if (rectTop > 0 && rectTop < 240) {
        setTopOffset(rectTop);
      }
    }
  }, [embedded]);

  const leftImgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete) {
      setLeftReady(true);
    }
  }, []);

  const rightImgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete) {
      setRightReady(true);
    }
  }, []);

  // Safety fallback in case onLoad doesn't fire on slow/cached network
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setLeftReady(true);
      setRightReady(true);
    }, 650);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Trigger smooth opening after both door textures are ready
  useEffect(() => {
    if (!bothReady) return;

    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(openTimer);
  }, [bothReady, delayMs]);

  // Remove overlay completely once slide transition finishes
  useEffect(() => {
    if (!isOpen) return;

    const hideTimer = setTimeout(() => {
      setIsHidden(true);
    }, durationMs + 120);

    return () => clearTimeout(hideTimer);
  }, [isOpen, durationMs]);

  if (isHidden || !config?.enabled) return null;

  const visibleHeightExpr = topOffset > 0 ? `calc(100dvh - ${topOffset}px)` : '100dvh';
  const negativeMarginExpr = topOffset > 0 ? `calc(-100dvh + ${topOffset}px)` : '-100dvh';
  const embeddedHeight = stageHeight ? `${stageHeight}px` : '100dvh';

  const viewportStyle: React.CSSProperties = embedded
    ? {
        top: '0px',
        height: embeddedHeight,
        marginBottom: `-${embeddedHeight}`,
        backgroundColor: bothReady ? 'transparent' : '#a61114',
      }
    : {
        top: topOffset > 56 ? '56px' : '0px',
        height: visibleHeightExpr,
        marginBottom: negativeMarginExpr,
        backgroundColor: bothReady ? 'transparent' : '#a61114',
      };

  const transitionTiming = `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      ref={containerRef}
      aria-label="Hiệu ứng mở cánh thiệp"
      onClick={() => setIsOpen(true)}
      style={viewportStyle}
      className={`sticky left-0 w-full z-30 overflow-hidden select-none ${
        isOpen ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
      }`}
    >
      {/* Left Door Panel (Exact 50% center Double Happiness seal + realistic paper flap shadow) */}
      <div
        style={{
          transform: isOpen ? 'translate3d(-84%, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: transitionTiming,
          filter: 'drop-shadow(3px 0 7px rgba(0, 0, 0, 0.3))',
        }}
        className="absolute inset-0 w-full h-full z-20 will-change-transform"
      >
        <img
          ref={leftImgRef}
          src={leftImage}
          alt="Cánh thiệp trái"
          onLoad={() => setLeftReady(true)}
          onError={() => setLeftReady(true)}
          className="w-full h-full object-cover object-center block pointer-events-none"
        />
      </div>

      {/* Right Door Panel (Tucked 3px under left panel via right-anchored 1.015x scale to seal white center gap) */}
      <div
        style={{
          transformOrigin: 'right center',
          transform: isOpen ? 'translate3d(84%, 0, 0) scaleX(1)' : 'translate3d(0, 0, 0) scaleX(1.015)',
          transition: transitionTiming,
        }}
        className="absolute inset-0 w-full h-full z-10 will-change-transform"
      >
        <img
          ref={rightImgRef}
          src={rightImage}
          alt="Cánh thiệp phải"
          onLoad={() => setRightReady(true)}
          onError={() => setRightReady(true)}
          className="w-full h-full object-cover object-center block pointer-events-none"
        />
      </div>
    </div>
  );
}
