'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { invitationService } from '@/services/invitationService';
import { TemplateRendererProps } from '../../types';
import { schemaToArchData } from '../toArchData';
import { useInvitationAutoScroll } from '../useAutoScroll';
import { useEmbeddedStageHeight } from '../../useEmbeddedStageHeight';
import { createSourceRuntime } from './source-runtime';
import messages from './source-messages.json';
import defaults from './source-defaults.json';
import './source-fonts.css';

interface SourceComment {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

function mixHex(hex: string, target: string, ratio: number): string {
  const clean = (value: string) => {
    const m = value.trim().match(/^#([0-9a-f]{6})$/i);
    return m
      ? [0, 2, 4].map((offset) => parseInt(m[1].slice(offset, offset + 2), 16))
      : null;
  };
  const a = clean(hex);
  const b = clean(target);
  if (!a || !b) return hex;
  const mixed = a.map((ch, idx) => Math.round(ch + (b[idx] - ch) * ratio));
  return `#${mixed.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function buildArchTheme(primaryColor: string, backgroundColor: string, headingFont: string, bodyFont: string) {
  const isDefault =
    primaryColor.toUpperCase() === '#1F3A25' && backgroundColor.toLowerCase() === '#fff7eb';

  if (isDefault) {
    return {
      palette: { green: '#1F3A25', cream: '#fff7eb', barText: '#e8f0e4', gray: '#666666' },
      envelopeTheme: undefined,
      giftColors: undefined,
      artworkFilter: undefined,
      fonts: undefined,
    };
  }

  const dark = mixHex(primaryColor, '#05080a', 0.55);
  const mid = mixHex(primaryColor, '#0a0f12', 0.35);
  const softTint = mixHex(primaryColor, '#ffffff', 0.8);
  const lightTint = mixHex(primaryColor, '#ffffff', 0.88);
  const cream = backgroundColor || '#fff7eb';

  return {
    palette: { green: primaryColor, cream, barText: '#f7f4ef', gray: '#666666' },
    envelopeTheme: {
      background: `linear-gradient(to bottom right, ${dark}, ${mid}, ${primaryColor})`,
      cardBg: primaryColor,
      textPrimary: '#f7f4ef',
      textSecondary: 'rgba(247, 244, 239, 0.85)',
      accent: '#f7f4ef',
      dividerTo: 'rgba(247, 244, 239, 0.5)',
      buttonBg: '#f7f4ef',
      buttonText: primaryColor,
      guestBoxBorder: 'rgba(247, 244, 239, 0.3)',
      particleColors: [softTint, lightTint, primaryColor, '#ece4d8'],
    },
    giftColors: {
      secondary: mixHex(primaryColor, '#ffffff', 0.45),
      modalBackground: lightTint,
    },
    artworkFilter: {
      sunburst: 'grayscale(1) contrast(0.95) brightness(0.75)',
      chuHy: 'grayscale(1) contrast(0.95) brightness(0.85)',
    },
    fonts: {
      heading:
        headingFont && headingFont !== 'Big Caslon'
          ? `"${headingFont}", "Big Caslon", "Baskerville", "Times New Roman", ChungDoiIndic, serif`
          : '"Big Caslon", "Baskerville", "Times New Roman", ChungDoiIndic, serif',
      body:
        bodyFont && bodyFont !== 'Baskerville'
          ? `"${bodyFont}", "Baskerville", "Times New Roman", ChungDoiIndic, serif`
          : '"Baskerville", "Times New Roman", ChungDoiIndic, serif',
    },
  };
}

/**
 * Runs the preserved Song Hy components with schema props and project API adapters.
 * Props select saved content, public slug and editor embedding. State tracks source
 * stylesheet readiness, opening, music and persisted guestbook feedback.
 */
export default function Renderer({
  schema,
  slug: requestedSlug,
  embedded = false,
  containerClassName,
}: TemplateRendererProps) {
  const slug = embedded ? undefined : requestedSlug;
  const host = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [ready, setReady] = useState(false);
  const [opened, setOpened] = useState(false);
  const [comments, setComments] = useState<SourceComment[]>([]);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState({
    isPending: false,
    isError: false,
    isSuccess: false,
  });

  const primaryColor = schema.theme.primaryColor || '#1F3A25';
  const backgroundColor = schema.theme.backgroundColor || '#fff7eb';
  const headingFont = schema.theme.headingFont || 'Big Caslon';
  const bodyFont = schema.theme.bodyFont || 'Baskerville';

  const hasContent = schema.blocks.some(
    (item) => (item.type === 'SONG_HY_GREEN' || item.type === 'HERO') && !item.isHidden
  );
  const stageHeight = useEmbeddedStageHeight(host, Boolean(embedded && hasContent));
  const sourceData = useMemo(
    () => (hasContent ? schemaToArchData(schema) : null),
    [schema, hasContent]
  );

  const themeSettings = useMemo(
    () => buildArchTheme(primaryColor, backgroundColor, headingFont, bodyFont),
    [primaryColor, backgroundColor, headingFont, bodyFont]
  );

  const runtime = useMemo(
    () =>
      shadow
        ? createSourceRuntime({
            portal: shadow,
            track: schema.effects.musicUrl
              ? { id: 'song-hy-local', url: schema.effects.musicUrl }
              : null,
            ...themeSettings,
          })
        : null,
    [shadow, schema.effects.musicUrl, themeSettings]
  );

  const loadComments = useCallback(async () => {
    if (!slug) {
      setComments(defaults.comments);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await invitationService.getWishes(slug, 0, 100);
      setComments(
        response.content.map((wish) => ({
          id: String(wish.id),
          name: wish.guestName,
          message: wish.message || 'Đã gửi phản hồi tham dự.',
          timestamp: wish.createdAt,
        }))
      );
      setError('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Không thể tải lời chúc.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useInvitationAutoScroll(opened && ready && !embedded, shadow);

  useEffect(() => {
    if (host.current) setShadow(host.current.shadowRoot || host.current.attachShadow({ mode: 'open' }));
  }, []);

  useEffect(() => {
    if (!shadow || ready) return;
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, [shadow, ready]);

  useEffect(() => {
    const openImmediately = () => setOpened(true);
    window.addEventListener('invitation-preview:open-envelope', openImmediately);
    return () => window.removeEventListener('invitation-preview:open-envelope', openImmediately);
  }, []);

  useEffect(() => {
    void loadComments();
    const refresh = (event: Event) => {
      if ((event as CustomEvent).detail?.slug === slug) void loadComments();
    };
    window.addEventListener('song-hy:response-saved', refresh);
    return () => window.removeEventListener('song-hy:response-saved', refresh);
  }, [loadComments, slug]);

  useEffect(() => {
    if (embedded || opened) return;
    const media = window.matchMedia('(prefers-reduced-motion:reduce)');
    const reduce = () => {
      if (media.matches) setOpened(true);
    };
    reduce();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    media.addEventListener('change', reduce);
    return () => {
      document.documentElement.style.overflow = previous;
      media.removeEventListener('change', reduce);
    };
  }, [opened, embedded]);

  const saveComment = async (_data: unknown, comment?: SourceComment) => {
    if (!comment) return;
    if (!slug) {
      setComments((current) => [comment, ...current]);
      return;
    }
    setSubmission({ isPending: true, isError: false, isSuccess: false });
    try {
      await invitationService.submitWish(slug, {
        guestName: comment.name,
        attendanceStatus: 'MAYBE',
        guestCount: 1,
        message: comment.message,
      });
      await loadComments();
      setSubmission({ isPending: false, isError: false, isSuccess: true });
    } catch (failure) {
      setSubmission({ isPending: false, isError: true, isSuccess: false });
      throw failure;
    }
  };

  const data = useMemo(
    () =>
      sourceData && runtime
        ? {
            ...runtime.normalize(sourceData),
            comments,
            musicTrackId: undefined,
            invitationId: slug || 'song-hy-demo',
            invitationSlug: slug || 'song-hy-xanh',
          }
        : null,
    [sourceData, runtime, comments, slug]
  );

  if (!hasContent) return <p className="p-6 text-center">Nội dung thiệp đang được ẩn.</p>;

  const original = data as Record<string, unknown>;
  const Envelope = runtime?.Envelope as React.ComponentType<Record<string, unknown>> | undefined;
  const Template = runtime?.Template as React.ComponentType<Record<string, unknown>> | undefined;
  const IntlProvider = runtime?.IntlProvider as React.ComponentType<Record<string, unknown>> | undefined;
  const SubmissionProvider = runtime?.SubmissionProvider as
    | React.ComponentType<Record<string, unknown>>
    | undefined;
  const InvitationProvider = runtime?.InvitationProvider as
    | React.ComponentType<Record<string, unknown>>
    | undefined;
  const MusicPlayer = runtime?.MusicPlayer as React.ComponentType<Record<string, unknown>> | undefined;
  const open = () => setOpened(true);
  const minStageHeight = embedded && stageHeight ? `${stageHeight}px` : '100dvh';

  return (
    <div
      ref={host}
      className={containerClassName}
      data-template="song-hy-green-v1"
      data-invitation-open={opened}
      style={{ width: '100%', minHeight: minStageHeight }}
    >
      {!ready && <p role="status" className="p-6 text-center">Đang tải thiệp…</p>}
      {shadow &&
        runtime &&
        Envelope &&
        Template &&
        IntlProvider &&
        SubmissionProvider &&
        InvitationProvider &&
        createPortal(
          <>
            <link
              rel="stylesheet"
              href="/template-designs/song-hy-green/v1.css"
              ref={(node) => {
                if (node?.sheet) setReady(true);
              }}
              onLoad={() => setReady(true)}
              onError={() =>
                setError('Không thể tải giao diện thiệp. Vui lòng tải lại trang.')
              }
            />
            <style>{`:host{color:#666;font-family:Baskerville,"Times New Roman",serif}dialog{color:#666}`}</style>
            {embedded && (
              <style>{`
                :host{--embedded-stage-height:${minStageHeight}}
                [data-landing-screenshot-id="invite-envelope"]{position:relative!important;inset:auto!important;width:100%!important;height:var(--embedded-stage-height,100dvh)!important;min-height:420px!important;z-index:20!important}
                [data-landing-screenshot-id="invite-envelope"]>.relative{max-width:calc(100% - 32px)!important}
                [data-landing-screenshot-id="invite-envelope"]>.relative>.relative{max-width:100%!important}
              `}</style>
            )}
            <IntlProvider locale="vi" messages={messages} timeZone="Asia/Ho_Chi_Minh">
              <SubmissionProvider value={submission}>
                <InvitationProvider value={slug ? { invitationSlug: slug } : null}>
                  <main
                    lang="vi"
                    dir="ltr"
                    style={{
                      visibility: ready ? 'visible' : 'hidden',
                      minHeight: embedded && stageHeight ? minStageHeight : undefined,
                    }}
                  >
                    {opened ? (
                      <Template data={data} isPreview={embedded} onDataChange={saveComment} />
                    ) : (
                      <Envelope
                        groomName={String(
                          original.groomShortName || original.groomFullName || ''
                        )}
                        brideName={String(
                          original.brideShortName || original.brideFullName || ''
                        )}
                        weddingDate={original.date}
                        templateId="song_hy_green"
                        particleSeed={slug || 'song-hy-xanh'}
                        onOpen={open}
                        audioRef={audio}
                        envelopeTheme={runtime.envelope.theme}
                        envelopeDecorations={runtime.envelope.decorations}
                        envelopeFonts={runtime.envelope.fonts}
                        data={data}
                        openFallbackHref="#invitation"
                      />
                    )}
                    {opened && loading && <p role="status">Đang tải lời chúc…</p>}
                    {error && <p role="alert">{error}</p>}
                    <audio ref={audio} src={schema.effects.musicUrl} loop preload="auto" />
                    {opened && !embedded && schema.effects.musicUrl && MusicPlayer && (
                      <MusicPlayer
                        trackId="song-hy-local"
                        audioRef={audio}
                        autoPlay
                        volume={0.5}
                        themeColor={primaryColor}
                      />
                    )}
                  </main>
                </InvitationProvider>
              </SubmissionProvider>
            </IntlProvider>
          </>,
          shadow
        )}
    </div>
  );
}
