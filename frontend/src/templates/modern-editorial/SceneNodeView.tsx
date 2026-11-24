'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DS03_SLOT_META } from './photoSlots';
import { RsvpFormWidget, WishFormWidget, WishListWidget } from './widgets';
import {
  DemoWish,
  DisplayAnimation,
  SceneEvent,
  SceneNode,
  SceneNodeProps,
} from './types';

const EDITABLE_PHOTO_NODES = new Set(DS03_SLOT_META.map((item) => item.nodeId));
const SAFE_MAP_URL_PREFIX = 'https://www.google.com/maps';

export interface SceneRenderContext {
  svgBank: Record<string, string>;
  isMobile: boolean;
  publicSlug?: string;
  interactiveEdit: boolean;
  wishes: DemoWish[];
  wishesLoading: boolean;
  onWishCreated: (wish: DemoWish) => void;
  onEvent: (events: SceneEvent[] | undefined) => void;
  onNotify: (msg: string, isError?: boolean) => void;
  onPhotoClick: (nodeId: string) => void;
}

function quoteFont(family?: string): string | undefined {
  if (!family || family === 'inherit') return family;
  return /["',]/.test(family) ? family : `'${family}'`;
}

function sizeCss(value?: string | number): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return `${value}px`;
  return /px|%|rem|em|vh|vw/.test(value) ? value : `${value}px`;
}

function eventAriaLabel(events?: SceneEvent[]): string | undefined {
  if (!events?.length) return undefined;
  const first = events[0];
  if (first.eventType === 'open-popup') return 'Mở hộp mừng cưới';
  if (first.eventType === 'open-album-modal') return 'Mở album ảnh';
  if (first.eventType === 'open-lightbox') return 'Xem ảnh phóng to';
  if (first.eventType === 'add-to-calendar') return 'Thêm vào lịch';
  return 'Thao tác thiệp';
}

function radiusCss(borderRadius?: number[] | number, radius?: number): string | undefined {
  if (Array.isArray(borderRadius) && borderRadius.length === 4) {
    return `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`;
  }
  if (typeof borderRadius === 'number' && borderRadius > 0) return `${borderRadius}px`;
  if (typeof radius === 'number' && radius > 0) return `${radius}px`;
  return undefined;
}

function borderCss(
  borderWidth?: number[] | number,
  borderStyle?: string,
  borderColor?: string
): string | undefined {
  const width = Array.isArray(borderWidth) ? borderWidth[0] : borderWidth;
  if (!width || width <= 0) return undefined;
  return `${width}px ${borderStyle || 'solid'} ${borderColor || '#000000'}`;
}

function rgbaColor(color: SceneNodeProps['color']): string | undefined {
  if (typeof color === 'string') return color;
  if (color && typeof color === 'object') {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
  }
  return undefined;
}

function decodeHtmlText(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, '\u00A0');
}

function renderFormattedText(raw: string): React.ReactNode {
  const parts = raw.split(/<br\s*\/?>/gi);
  return parts.map((segment, index) => (
    <React.Fragment key={index}>
      {decodeHtmlText(segment)}
      {index < parts.length - 1 && <br />}
    </React.Fragment>
  ));
}

function recolorSvg(svgRaw: string, iconColor?: string, preserve?: boolean): string {
  if (!iconColor || preserve || /data-preserve-colors="true"/.test(svgRaw)) return svgRaw;
  if (typeof DOMParser === 'undefined') return svgRaw;
  try {
    const doc = new DOMParser().parseFromString(svgRaw, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return svgRaw;
    svg.setAttribute('fill', iconColor);
    svg.querySelectorAll('path, circle, rect, polygon, ellipse').forEach((shape) => {
      const currentFill = shape.getAttribute('fill');
      if (currentFill !== 'none' && currentFill !== 'transparent') {
        shape.setAttribute('fill', iconColor);
      }
    });
    return new XMLSerializer().serializeToString(doc);
  } catch {
    return svgRaw;
  }
}

function resolveSvg(rawOrRef: string | undefined, svgBank: Record<string, string>): string | undefined {
  if (!rawOrRef) return undefined;
  return rawOrRef.startsWith('$svg_') ? svgBank[rawOrRef] : rawOrRef;
}

function extractMapSrc(nodeProps: SceneNodeProps): string | undefined {
  if (typeof nodeProps.mapEmbedUrl === 'string' && nodeProps.mapEmbedUrl.startsWith(SAFE_MAP_URL_PREFIX)) {
    return nodeProps.mapEmbedUrl;
  }
  if (typeof nodeProps.htmlContent === 'string') {
    const match = /src=["']([^"']+)["']/i.exec(nodeProps.htmlContent);
    if (match?.[1]?.startsWith(SAFE_MAP_URL_PREFIX)) return match[1];
  }
  return undefined;
}

function DisplayAnimated({
  animation,
  children,
}: {
  animation?: DisplayAnimation | null;
  children: (ref: React.RefObject<HTMLDivElement>, animClass: string, animStyle?: React.CSSProperties) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const effect = animation?.effect;
  const [visible, setVisible] = useState(!effect);

  useEffect(() => {
    if (!effect || !ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!animation?.repeat) observer.unobserve(entry.target);
          } else if (animation?.repeat) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [effect, animation?.repeat]);

  if (!effect) return <>{children(ref, '')}</>;

  const animClass = visible ? `me-anim-active me-anim-${effect}` : 'me-anim-pending';
  const animStyle: React.CSSProperties | undefined = visible
    ? { animationDuration: `${animation?.duration ?? 1}s` }
    : undefined;

  return <>{children(ref, animClass, animStyle)}</>;
}

function resolveButtonParts(node: SceneNode): {
  text?: string;
  textStyleSource?: SceneNodeProps;
  svgCode?: string;
  iconColor?: string;
  preserveColors?: boolean;
  iconStyleSource?: SceneNodeProps;
} {
  const p = node.props;
  const linked = node.linkedNodes || {};
  const textRefObj = linked[`text${node.id}`];
  const textRefId = textRefObj && '$ref' in textRefObj ? textRefObj.$ref : undefined;
  const iconRefObj = linked[`icon${node.id}`];
  const iconRefId = iconRefObj && '$ref' in iconRefObj ? iconRefObj.$ref : undefined;

  const textChild = textRefId
    ? node.children?.find((c) => c.id === textRefId)
    : node.children?.find((c) => c.type === 'Text');
  const iconChild = iconRefId
    ? node.children?.find((c) => c.id === iconRefId)
    : node.children?.find((c) => c.type === 'Icon');

  const resolvedText =
    (typeof textChild?.props?.text === 'string' && textChild.props.text) ||
    p.textComponent?.text ||
    p.text;

  return {
    text: resolvedText,
    textStyleSource: textChild?.props,
    svgCode: iconChild?.props?.svgCode || p.iconComponent?.svgCode,
    iconColor: iconChild?.props?.iconColor || p.iconComponent?.iconColor,
    preserveColors:
      iconChild?.props?.preserveOriginalColors ?? p.iconComponent?.preserveOriginalColors,
    iconStyleSource: iconChild?.props,
  };
}

/**
 * Recursive native React renderer for every node type in the DS03 scene graph.
 */
export function SceneNodeView({
  node,
  ctx,
}: {
  node: SceneNode;
  ctx: SceneRenderContext;
}) {
  const p = node.props || {};
  if (node.hidden || p.hidden) return null;

  if (node.type === 'AlbumModal' || node.type === 'Popup') {
    return null;
  }

  if (node.type === 'Sections') {
    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <section
            ref={ref}
            data-node-id={node.id}
            className={animClass || undefined}
            style={{
              position: 'relative',
              width: '100%',
              height: p.height,
              backgroundColor: p.backgroundColor || '#fcf9fe',
              overflow: 'hidden',
              ...animStyle,
            }}
          >
            {node.children?.map((child) => (
              <SceneNodeView key={child.id} node={child} ctx={ctx} />
            ))}
          </section>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'Container') {
    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            className={animClass || undefined}
            onClick={p.events?.length ? () => ctx.onEvent(p.events) : undefined}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.backgroundColor,
              backgroundImage: p.backgroundImage ? `url("${p.backgroundImage}")` : undefined,
              backgroundSize: p.backgroundSize || 'cover',
              backgroundPosition: p.backgroundPosition || 'center center',
              backgroundRepeat: p.backgroundRepeat || 'no-repeat',
              borderRadius: radiusCss(p.borderRadius, p.radius),
              border: borderCss(p.borderWidth, p.borderStyle, p.borderColor),
              cursor: p.events?.length ? 'pointer' : undefined,
              boxSizing: 'border-box',
              ...animStyle,
            }}
          >
            {node.children?.map((child) => (
              <SceneNodeView key={child.id} node={child} ctx={ctx} />
            ))}
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'GroupV2' || node.type === 'GroupV3') {
    const transform = p.rotate ? `rotate(${p.rotate}deg)` : undefined;
    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            data-group-kind={node.type === 'GroupV3' ? 'v3' : 'v2'}
            className={animClass || undefined}
            onClick={p.events?.length ? () => ctx.onEvent(p.events) : undefined}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              transform,
              cursor: p.events?.length ? 'pointer' : undefined,
              ...animStyle,
            }}
          >
            {node.children?.map((child) => (
              <SceneNodeView key={child.id} node={child} ctx={ctx} />
            ))}
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'Text') {
    const autoWidth = !p.width || p.width === 'auto';
    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            role={p.events?.length ? 'button' : undefined}
            tabIndex={p.events?.length ? 0 : undefined}
            className={animClass || undefined}
            onClick={p.events?.length ? () => ctx.onEvent(p.events) : undefined}
            onKeyDown={
              p.events?.length
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      ctx.onEvent(p.events);
                    }
                  }
                : undefined
            }
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              ...(autoWidth ? { width: 'max-content', maxWidth: '100%' } : { width: p.width }),
              height: p.height,
              color: rgbaColor(p.color) ?? '#000000',
              fontFamily: quoteFont(p.fontFamily),
              fontSize: sizeCss(p.fontSize) ?? '15px',
              fontWeight: p.fontWeight,
              fontStyle: p.fontStyle,
              lineHeight: p.lineHeight ?? '1.4',
              letterSpacing: sizeCss(p.letterSpacing),
              textAlign: p.textAlign as React.CSSProperties['textAlign'],
              textTransform: p.textTransform as React.CSSProperties['textTransform'],
              textDecoration: p.textDecoration,
              cursor: p.events?.length ? 'pointer' : undefined,
              wordBreak: 'break-word',
              ...animStyle,
            }}
          >
            {typeof p.text === 'string' ? renderFormattedText(p.text) : null}
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'Image') {
    const transforms: string[] = [];
    if (p.rotate) transforms.push(`rotate(${p.rotate}deg)`);
    if (p.rotateX) transforms.push(`rotateX(${p.rotateX}deg)`);
    if (p.rotateY) transforms.push(`rotateY(${p.rotateY}deg)`);

    const crop = p.cropData;
    const imgStyle: React.CSSProperties = crop
      ? {
          width: '100%',
          height: '100%',
          display: 'block',
          transform: `translate(${(-crop.x * 100) / crop.width}%, ${(-crop.y * 100) / crop.height}%) scale(${100 / crop.width}, ${100 / crop.height})`,
          transformOrigin: 'top left',
        }
      : {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        };

    const isEditableSlot = ctx.interactiveEdit && EDITABLE_PHOTO_NODES.has(node.id);
    const hasClick = isEditableSlot || Boolean(p.events?.length);

    const handleClick = (event: React.MouseEvent) => {
      if (isEditableSlot) {
        event.preventDefault();
        event.stopPropagation();
        ctx.onPhotoClick(node.id);
        return;
      }
      if (p.events?.length) {
        ctx.onEvent(p.events);
      }
    };

    const borderRadius = radiusCss(p.borderRadius, p.radius);

    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            data-photo-editable={isEditableSlot ? 'true' : undefined}
            className={animClass || undefined}
            onClick={hasClick ? handleClick : undefined}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              borderRadius,
              border: borderCss(p.borderWidth, p.borderStyle, p.borderColor),
              transform: transforms.length ? transforms.join(' ') : undefined,
              cursor: hasClick ? 'pointer' : undefined,
              overflow: 'hidden',
              boxSizing: 'border-box',
              ...animStyle,
            }}
          >
            <img src={p.url} alt="" draggable={false} style={imgStyle} />
            {p.overlayType === 'color' && p.overlayColor && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: p.overlayColor,
                  opacity: (p.overlayOpacity ?? 50) / 100,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'Icon') {
    const rawSvg = resolveSvg(p.svgCode, ctx.svgBank);
    const svgHtml = rawSvg ? recolorSvg(rawSvg, p.iconColor, p.preserveOriginalColors) : '';
    const interactive = Boolean(p.events?.length);

    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? eventAriaLabel(p.events) : undefined}
            className={animClass || undefined}
            onClick={interactive ? () => ctx.onEvent(p.events) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      ctx.onEvent(p.events);
                    }
                  }
                : undefined
            }
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              cursor: interactive ? 'pointer' : undefined,
              ...animStyle,
            }}
          >
            {svgHtml && (
              <div
                className="me-wrapper-svg"
                style={{ width: '100%', height: '100%', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            )}
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'Button') {
    const { text, textStyleSource, svgCode, iconColor, preserveColors, iconStyleSource } =
      resolveButtonParts(node);
    const tc = p.textComponent;
    const rawBg =
      p.backgroundColor && p.backgroundColor !== 'var(--color-background)'
        ? p.backgroundColor
        : 'transparent';
    const rawTextColor =
      (textStyleSource?.color ? rgbaColor(textStyleSource.color) : undefined) ||
      tc?.color ||
      rgbaColor(p.color) ||
      '#FFFFFF';
    const fontSize = sizeCss(textStyleSource?.fontSize ?? tc?.fontSize);
    const resolvedSvg = resolveSvg(svgCode, ctx.svgBank);
    const coloredSvg = resolvedSvg ? recolorSvg(resolvedSvg, iconColor, preserveColors) : '';
    const iconOffset = p.iconHorizontalPosition ?? 0;
    const iconWidth = iconStyleSource?.width || p.iconComponent?.width || '20px';
    const iconHeight = iconStyleSource?.height || p.iconComponent?.height || '20px';

    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            role="button"
            tabIndex={0}
            data-node-id={node.id}
            className={animClass || undefined}
            onClick={() => ctx.onEvent(p.events)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                ctx.onEvent(p.events);
              }
            }}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              padding: '5px 10px',
              backgroundColor: rawBg,
              borderRadius: radiusCss(p.borderRadius, p.radius),
              border: borderCss(p.borderWidth, p.borderStyle, p.borderColor),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box',
              userSelect: 'none',
              ...animStyle,
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {p.showIcon && coloredSvg && (
                <div
                  className="me-wrapper-svg"
                  style={
                    p.iconPosition === 'center'
                      ? {
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: iconWidth,
                          height: iconHeight,
                          pointerEvents: 'none',
                          zIndex: 1,
                        }
                      : p.iconPosition === 'right'
                        ? {
                            position: 'absolute',
                            right: `${iconOffset}px`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: iconWidth,
                            height: iconHeight,
                            pointerEvents: 'none',
                          }
                        : {
                            position: 'absolute',
                            left: `${iconOffset}px`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: iconWidth,
                            height: iconHeight,
                            pointerEvents: 'none',
                          }
                  }
                  dangerouslySetInnerHTML={{ __html: coloredSvg }}
                />
              )}
              <span
                style={{
                  width: '100%',
                  textAlign: (textStyleSource?.textAlign || tc?.textAlign || 'center') as React.CSSProperties['textAlign'],
                  color: rawTextColor,
                  fontFamily: quoteFont(textStyleSource?.fontFamily || tc?.fontFamily),
                  fontSize,
                  fontWeight: textStyleSource?.fontWeight || tc?.fontWeight,
                  fontStyle: textStyleSource?.fontStyle || tc?.fontStyle,
                  lineHeight: textStyleSource?.lineHeight ?? tc?.lineHeight ?? '1.4',
                  letterSpacing: sizeCss(textStyleSource?.letterSpacing ?? tc?.letterSpacing),
                  textTransform: (textStyleSource?.textTransform || tc?.textTransform) as React.CSSProperties['textTransform'],
                }}
              >
                {text ? renderFormattedText(text) : null}
              </span>
            </div>
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'Line') {
    const stroke = Array.isArray(p.borderWidth) ? p.borderWidth[0] : p.borderWidth ?? 2;
    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            className={animClass || undefined}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: 0,
              borderTop: `${stroke}px solid ${p.borderColor || '#5F6459'}`,
              ...animStyle,
            }}
          />
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'HtmlSelector') {
    const mapSrc = extractMapSrc(p);
    if (!mapSrc) return null;
    return (
      <DisplayAnimated animation={p.displayAnimation}>
        {(ref, animClass, animStyle) => (
          <div
            ref={ref}
            data-node-id={node.id}
            className={animClass || undefined}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              overflow: 'hidden',
              ...animStyle,
            }}
          >
            <iframe
              title="Bản đồ địa điểm cưới"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </DisplayAnimated>
    );
  }

  if (node.type === 'RSVPForm') {
    return (
      <RsvpFormWidget
        node={node}
        publicSlug={ctx.publicSlug}
        isMobile={ctx.isMobile}
        onNotify={ctx.onNotify}
        onWishCreated={ctx.onWishCreated}
      />
    );
  }

  if (node.type === 'WishForm') {
    return (
      <WishFormWidget
        node={node}
        publicSlug={ctx.publicSlug}
        onWishCreated={ctx.onWishCreated}
        onNotify={ctx.onNotify}
      />
    );
  }

  if (node.type === 'WishList') {
    return <WishListWidget node={node} wishes={ctx.wishes} loading={ctx.wishesLoading} />;
  }

  return null;
}

/**
 * Centered popup modal overlay (e.g. Wedding Gift QR modal) rendering its scene children natively.
 */
export function PopupModalOverlay({
  popupNode,
  ctx,
  onClose,
}: {
  popupNode: SceneNode;
  ctx: SceneRenderContext;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const p = popupNode.props;
  const widthPx = parseFloat(String(p.width || 429)) || 429;
  const heightPx = parseFloat(String(p.height || 521)) || 521;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : widthPx + 32;
  const scale = Math.min(1, Math.max(0.65, (viewportWidth - 32) / widthPx));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hộp mừng cưới"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: Math.round(widthPx * scale),
          height: Math.round(heightPx * scale),
          backgroundColor: '#ffffff',
          borderRadius: radiusCss(p.borderRadius, p.radius) || '8px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.28)',
          overflow: 'hidden',
        }}
      >
        <div
          data-node-id={popupNode.id}
          style={{
            position: 'relative',
            width: widthPx,
            height: heightPx,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp mừng cưới"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 5,
              width: 30,
              height: 30,
              borderRadius: '9999px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✕
          </button>
          {popupNode.children?.map((child) => (
            <SceneNodeView key={child.id} node={child} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
}
