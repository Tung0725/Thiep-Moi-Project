'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { invitationService } from '@/services/invitationService';
import { TemplateRendererProps } from '../types';
import { useInvitationAutoScroll } from '../minimalism-dark-red/useInvitationAutoScroll';
import { createSourceRuntime } from './source-runtime';
import messages from './source-messages.json';
import defaults from './source-defaults.json';
import './source-fonts.css';

interface SourceComment { id: string; name: string; message: string; timestamp: string }

/**
 * Runs the preserved Song Hy components with schema props and project API adapters.
 * Props select saved content, public slug and editor embedding. State tracks source
 * stylesheet readiness, opening, music and persisted guestbook feedback.
 */
export default function Renderer({ schema, slug: requestedSlug, embedded = false, containerClassName }: TemplateRendererProps) {
  const slug = embedded ? undefined : requestedSlug;
  const host = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [ready, setReady] = useState(false);
  const [opened, setOpened] = useState(embedded);
  const [comments, setComments] = useState<SourceComment[]>([]);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState({ isPending: false, isError: false, isSuccess: false });
  const block = schema.blocks.find(item => item.type === 'SONG_HY_GREEN' && !item.isHidden);
  const sourceData = block?.props.data as Record<string, unknown> | undefined;
  const runtime = useMemo(() => shadow ? createSourceRuntime({ portal: shadow,
    track: schema.effects.musicUrl ? { id: 'song-hy-local', url: schema.effects.musicUrl } : null,
  }) : null, [shadow, schema.effects.musicUrl]);
  const loadComments = useCallback(async () => {
    if (!slug) { setComments(defaults.comments); setLoading(false); return; }
    setLoading(true);
    try {
      const response = await invitationService.getWishes(slug, 0, 100);
      setComments(response.content.map(wish => ({ id: String(wish.id), name: wish.guestName, message: wish.message || 'Đã gửi phản hồi tham dự.', timestamp: wish.createdAt })));
      setError('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Không thể tải lời chúc.');
    } finally { setLoading(false); }
  }, [slug]);
  useInvitationAutoScroll(opened && ready && !embedded, shadow);
  useEffect(() => {
    if (host.current) setShadow(host.current.shadowRoot || host.current.attachShadow({ mode: 'open' }));
  }, []);
  useEffect(() => {
    void loadComments();
    const refresh = (event: Event) => { if ((event as CustomEvent).detail?.slug === slug) void loadComments(); };
    window.addEventListener('song-hy:response-saved', refresh);
    return () => window.removeEventListener('song-hy:response-saved', refresh);
  }, [loadComments, slug]);
  useEffect(() => {
    if (embedded || opened) return;
    const media = window.matchMedia('(prefers-reduced-motion:reduce)');
    const reduce = () => { if (media.matches) setOpened(true); };
    reduce();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    media.addEventListener('change', reduce);
    return () => { document.documentElement.style.overflow = previous; media.removeEventListener('change', reduce); };
  }, [opened, embedded]);
  const saveComment = async (_data: unknown, comment?: SourceComment) => {
    if (!comment) return;
    if (!slug) { setComments(current => [comment, ...current]); return; }
    setSubmission({ isPending: true, isError: false, isSuccess: false });
    try {
      await invitationService.submitWish(slug, { guestName: comment.name, attendanceStatus: 'MAYBE', guestCount: 1, message: comment.message });
      await loadComments();
      setSubmission({ isPending: false, isError: false, isSuccess: true });
    } catch (failure) {
      setSubmission({ isPending: false, isError: true, isSuccess: false });
      throw failure;
    }
  };
  const data = useMemo(() => sourceData && runtime ? {
    ...runtime.normalize(sourceData), comments, musicTrackId: undefined, invitationId: slug || 'song-hy-demo', invitationSlug: slug || 'song-hy-xanh',
  } : null, [sourceData, runtime, comments, slug]);
  if (!block) return <p className="p-6 text-center">Nội dung thiệp đang được ẩn.</p>;
  const original = data as Record<string, unknown>;
  const Envelope = runtime?.Envelope as React.ComponentType<Record<string, unknown>> | undefined;
  const Template = runtime?.Template as React.ComponentType<Record<string, unknown>> | undefined;
  const IntlProvider = runtime?.IntlProvider as React.ComponentType<Record<string, unknown>> | undefined;
  const SubmissionProvider = runtime?.SubmissionProvider as React.ComponentType<Record<string, unknown>> | undefined;
  const InvitationProvider = runtime?.InvitationProvider as React.ComponentType<Record<string, unknown>> | undefined;
  const MusicPlayer = runtime?.MusicPlayer as React.ComponentType<Record<string, unknown>> | undefined;
  const open = () => setOpened(true);
  return (
    <div ref={host} className={containerClassName} data-template="song-hy-green-v1" data-invitation-open={opened} style={{ width: '100%', minHeight: embedded ? 560 : '100dvh' }}>
      {/* Original isolated styles and component runtime */}
      {!ready && <p role="status" className="p-6 text-center">Đang tải thiệp…</p>}
      {shadow && runtime && Envelope && Template && IntlProvider && SubmissionProvider && InvitationProvider && createPortal(<>
        <link rel="stylesheet" href="/template-designs/song-hy-green/v1.css" onLoad={() => setReady(true)} onError={() => setError('Không thể tải giao diện thiệp. Vui lòng tải lại trang.')} />
        <style>{`:host{color:#666;font-family:Baskerville,"Times New Roman",serif}dialog{color:#666}`}</style>
        <IntlProvider locale="vi" messages={messages} timeZone="Asia/Ho_Chi_Minh">
          <SubmissionProvider value={submission}>
            <InvitationProvider value={slug ? { invitationSlug: slug } : null}>
              <main lang="vi" dir="ltr" style={{ visibility: ready ? 'visible' : 'hidden' }}>
                {/* Native cover and invitation states */}
                {opened ? <Template data={data} isPreview={embedded} onDataChange={saveComment} /> :
                  <Envelope groomName={String(original.groomShortName || original.groomFullName || '')} brideName={String(original.brideShortName || original.brideFullName || '')}
                    weddingDate={original.date} templateId="song_hy_green" particleSeed={slug || 'song-hy-xanh'} onOpen={open} audioRef={audio}
                    envelopeTheme={runtime.envelope.theme} envelopeDecorations={runtime.envelope.decorations} envelopeFonts={runtime.envelope.fonts} data={data} openFallbackHref="#invitation" />}
                {opened && loading && <p role="status">Đang tải lời chúc…</p>}
                {error && <p role="alert">{error}</p>}
                {/* User-controlled replacement music */}
                <audio ref={audio} src={schema.effects.musicUrl} loop preload="auto" />
                {opened && !embedded && schema.effects.musicUrl && MusicPlayer && <MusicPlayer trackId="song-hy-local" audioRef={audio} autoPlay volume={0.5} themeColor="#1F3A25" />}
              </main>
            </InvitationProvider>
          </SubmissionProvider>
        </IntlProvider>
      </>, shadow)}
    </div>
  );
}
