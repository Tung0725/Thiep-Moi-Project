'use client';

import React, { createElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGuestbook } from '@/hooks/useGuestbook';
import { TemplateRendererProps } from '../types';
import source from './source-layout.json';
import { nodeText, OriginalNode, originalData, replaceNodeText } from './originalBindings';
import { useInvitationAutoScroll } from './useInvitationAutoScroll';
import './source-fonts.css';

const layout = source as unknown as {
  shell: OriginalNode; cover: OriginalNode; decorations: OriginalNode[];
  sections: Record<string, OriginalNode[]>; credit: OriginalNode;
  photo: OriginalNode; gift: OriginalNode; rsvp: OriginalNode;
  coverMotion: { particleColors: string[]; flyingDecorations: OriginalNode[] };
};
const attributes: Record<string, string> = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', maxlength: 'maxLength', minlength: 'minLength', readonly: 'readOnly', autofocus: 'autoFocus', allowfullscreen: 'allowFullScreen', referrerpolicy: 'referrerPolicy', frameborder: 'frameBorder', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'xlink:href': 'xlinkHref' };
const booleanAttributes = new Set(['required', 'disabled', 'checked', 'multiple', 'readOnly', 'autoFocus', 'allowFullScreen', 'hidden']);
const COVER_SEAL_MS = 500;
const COVER_COMPLETE_MS = 1300;
const COVER_PARTICLE_COUNT = 32;

/**
 * Renders the captured invitation tree and CSS in an isolated style scope.
 * Props provide schema content, a public guestbook slug and embedding options.
 * State controls stylesheet readiness, opening, gallery, dialogs and music playback.
 */
export default function OriginalRenderer({ schema, slug, embedded = false, containerClassName }: TemplateRendererProps) {
  const host = useRef<HTMLDivElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [ready, setReady] = useState(false);
  const [opened, setOpened] = useState(embedded);
  const [coverPhase, setCoverPhase] = useState<'idle' | 'opening' | 'away' | 'done'>(embedded ? 'done' : 'idle');
  const [coverParticles, setCoverParticles] = useState<Record<string, string>[]>([]);
  const openingStarted = useRef(false);
  const chime = useRef<AudioContext | null>(null);
  const [photo, setPhoto] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpSelection, setRsvpSelection] = useState<'ATTENDING' | 'DECLINED' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const giftDialog = useRef<HTMLDialogElement>(null);
  const rsvpDialog = useRef<HTMLDialogElement>(null);
  const guestbook = useGuestbook(slug);
  const data = originalData(schema);
  const isOpening = coverPhase === 'opening' || coverPhase === 'away';
  useInvitationAutoScroll(opened && ready && !embedded, shadow);

  useEffect(() => {
    if (!isOpening) return;
    const started = performance.now();
    const finish = () => { setCoverPhase('done'); setCoverParticles([]); setOpened(true); };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
    const away = window.setTimeout(() => {
      const colors = layout.coverMotion.particleColors;
      setCoverParticles(Array.from({ length: COVER_PARTICLE_COUNT }, (_, index) => {
        const angle = 2 * Math.PI * index / COVER_PARTICLE_COUNT + (Math.random() - .5) * .4;
        const radius = 25 + 60 * Math.random();
        const color = colors[Math.floor(Math.random() * colors.length)];
        return { color, textShadow: `0 0 10px ${color}`, fontSize: `${10 + 16 * Math.random()}px`, '--dx': `${Math.cos(angle) * radius * 5}px`, '--dy': `${Math.sin(angle) * radius * 5}px`, '--rot-start': `${(Math.random() - .5) * 30}deg`, '--rot-end': `${(Math.random() - .5) * 360}deg`, animation: `particle-burst 1.4s cubic-bezier(0.25,0.46,0.45,0.94) ${.15 * Math.random()}s forwards` };
      }));
      setCoverPhase('away');
    }, COVER_SEAL_MS);
    const done = window.setTimeout(finish, COVER_COMPLETE_MS);
    const resume = () => { if (document.visibilityState === 'visible' && performance.now() - started >= COVER_COMPLETE_MS) finish(); };
    const reduce = () => { if (reducedMotion.matches) finish(); };
    document.addEventListener('visibilitychange', resume);
    reducedMotion.addEventListener('change', reduce);
    return () => { clearTimeout(away); clearTimeout(done); document.removeEventListener('visibilitychange', resume); reducedMotion.removeEventListener('change', reduce); };
  }, [isOpening, schema.theme.primaryColor]);
  useEffect(() => {
    if (embedded || opened) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = previous; };
  }, [embedded, opened]);
  useEffect(() => () => { if (chime.current && chime.current.state !== 'closed') void chime.current.close(); }, []);

  useEffect(() => {
    if (host.current) setShadow(host.current.shadowRoot || host.current.attachShadow({ mode: 'open' }));
  }, []);
  useEffect(() => {
    if (photo !== null) photoDialog.current?.showModal(); else photoDialog.current?.close();
  }, [photo, opened, shadow]);
  useEffect(() => {
    if (giftOpen) giftDialog.current?.showModal(); else giftDialog.current?.close();
  }, [giftOpen, opened, shadow]);
  useEffect(() => {
    if (guestbook.isSent) setRsvpOpen(false);
  }, [guestbook.isSent, guestbook.wishes]);
  useEffect(() => {
    if (rsvpOpen) rsvpDialog.current?.showModal(); else rsvpDialog.current?.close();
  }, [rsvpOpen]);
  useEffect(() => {
    setActivePhoto(0);
    setPhoto(null);
  }, [schema]);
  useEffect(() => {
    if (!shadow || !opened) return;
    const update = () => shadow.querySelectorAll<HTMLElement>('[data-original-parallax]').forEach(element => {
      const offset = window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : Math.min(window.scrollY * Number(element.dataset.originalParallax), 40);
      element.style.transform = `translateY(${offset}px)`;
    });
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [shadow, opened]);
  useEffect(() => {
    if (!shadow || !opened || !ready) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      shadow.querySelectorAll<HTMLElement>('[data-fit-font]').forEach(element => {
        const parentName = element.dataset.fitFont === 'parent';
        const large = window.matchMedia('(min-width:768px)').matches;
        const maximum = parentName ? large ? 14 : 12 : large ? 46 : 43;
        const minimum = parentName ? 8 : 24;
        let size = maximum;
        element.style.fontSize = `${size}px`;
        const text = element.firstElementChild || element;
        while (size > minimum && text.getBoundingClientRect().width > element.getBoundingClientRect().width + 0.1) element.style.fontSize = `${--size}px`;
      });
    };
    const observer = new ResizeObserver(fit);
    shadow.querySelectorAll('[data-fit-font]').forEach(element => observer.observe(element));
    document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => { active = false; observer.disconnect(); window.removeEventListener('resize', fit); };
  }, [shadow, opened, ready, schema]);

  const open = () => {
    if (openingStarted.current || opened) return;
    openingStarted.current = true;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) { setCoverPhase('done'); setOpened(true); }
    else setCoverPhase('opening');
    if (typeof window.AudioContext === 'function') {
      try {
        const context = new AudioContext();
        chime.current = context;
        const now = context.currentTime;
        const note = (frequency: number, start: number, duration: number, volume: number, gainStart = now) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start);
          gain.gain.setValueAtTime(0, gainStart); gain.gain.linearRampToValueAtTime(volume, start + .01); gain.gain.exponentialRampToValueAtTime(.001, start + duration);
          oscillator.start(start); oscillator.stop(start + duration);
        };
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => note(frequency, now + .1 * index, 1.8, .035 - .005 * index));
        [1567.98, 2093].forEach((frequency, index) => note(frequency, now + .35 + .1 * index, 1.2, .015));
        [783.99, 987.77, 1174.66, 1567.98].forEach((frequency, index) => note(frequency, now + 1.2 + .06 * index, .6, .025, now + 1.2));
        const bass = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        bass.connect(filter); filter.connect(gain); gain.connect(context.destination);
        bass.type = 'sine'; bass.frequency.setValueAtTime(261.63, now);
        filter.type = 'lowpass'; filter.frequency.value = 400;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.025, now + .4); gain.gain.setValueAtTime(.02, now + 1); gain.gain.exponentialRampToValueAtTime(.001, now + 2.5);
        bass.start(now); bass.stop(now + 2.5);
      } catch { setFeedback('Trình duyệt không thể phát âm thanh mở thiệp.'); }
    }
    audio.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const shiftPhoto = (delta: number) => {
    if (!data.gallery.length) return;
    setPhoto(current => ((current || 0) + delta + data.gallery.length) % data.gallery.length);
  };
  const originalGallery = findNodes(layout.sections.GALLERY[0], node => node.tag === 'img' && String(node.attrs.src).includes('/photo-library/')).map(node => String(node.attrs.src));
  const localGallery = findNodes(layout.sections.GALLERY[0], node => node.tag === 'img' && String(node.attrs.src).includes('/images/')).map(node => String(node.attrs.src)).filter(url => !/castle|flower/.test(url));
  const referenceImages = originalGallery.length ? originalGallery : localGallery;
  const copySourceStyle = (value: unknown) => {
    if (!value || typeof value !== 'object') return value;
    const style = { ...value as Record<string, string> };
    const hex = schema.theme.primaryColor;
    const rgb = /^#[0-9a-f]{6}$/i.test(hex) ? [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)).join(', ') : '81, 20, 25';
    for (const key in style) style[key] = style[key].replace(/81,\s*20,\s*25/g, rgb).replace(/#511419/gi, hex);
    if (style.fontFamily?.includes('Viaoda Libre') && !['MinimalismCormorant', 'Viaoda Libre'].includes(schema.theme.headingFont)) style.fontFamily = schema.theme.headingFont;
    if (style.backgroundColor === 'rgb(255, 247, 235)' && schema.theme.backgroundColor !== '#f8f1e7') style.backgroundColor = schema.theme.backgroundColor;
    return style;
  };

  const render = (node: OriginalNode, section: string, key: string, options: { literal?: boolean; image?: string; account?: 'groom' | 'bride' } = {}): React.ReactNode => {
    if (typeof node === 'string') {
      return node;
    }
    const cls = String(node.attrs.class || '');
    const text = nodeText(node);
    if (section === 'gift' && text.includes('Chú Rể - TRAN TUAN KIET') && !text.includes('Cô Dâu')) options = { ...options, account: 'groom' };
    if (section === 'gift' && text.includes('Cô Dâu - LE MINH ANH') && !text.includes('Chú Rể')) options = { ...options, account: 'bride' };
    const account = options.account === 'groom' ? data.gifts?.groomAccount : options.account === 'bride' ? data.gifts?.brideAccount : undefined;
    if (section === 'gift' && node.tag === 'div' && text.startsWith('Chú Rể - TRAN TUAN KIET') && !text.includes('Cô Dâu') && !data.gifts?.groomAccount) return null;
    if (section === 'gift' && node.tag === 'div' && text.startsWith('Cô Dâu - LE MINH ANH') && !data.gifts?.brideAccount) return null;
    if (node.tag === 'dialog' && section === 'GIFTBOX') return null;
    if (node.tag === 'style') return createElement('style', { key }, text);
    if (['COUPLE', 'EVENTS'].includes(section) && text.startsWith('(Tức ngày') && (section === 'COUPLE' ? data.ceremonyDate : data.date).getTime() !== new Date(2026, 0, 3).getTime()) return null;
    if (section === 'COUPLE' && text.startsWith('LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH') && !data.ceremony) return null;
    const props: Record<string, unknown> = { key };
    for (const [name, value] of Object.entries(node.attrs)) {
      if (name === 'open' || name.startsWith('on') || name === 'value' || name === 'checked') continue;
      const prop = attributes[name] || name;
      props[prop] = prop === 'style' ? copySourceStyle(value) : booleanAttributes.has(prop) ? true : value;
    }
    if (section === 'cover' && node === layout.cover) props['data-cover-phase'] = coverPhase;
    if (section === 'cover' && node.attrs['data-cover-part'] === 'card' && coverPhase === 'away') props.style = { ...props.style as React.CSSProperties, animation: 'envelope-away 0.8s ease-in forwards' };
    if (section === 'cover' && node.attrs['data-cover-part'] === 'seal' && isOpening) {
      const style = { ...props.style as Record<string, string> };
      for (const property of Object.keys(style)) if (property.startsWith('animation')) delete style[property];
      props.style = { ...style, animation: 'seal-break 0.5s cubic-bezier(0.4,0,0.2,1) forwards' };
    }
    if (section === 'COUPLE' && cls.includes('font-semibold') && (node.attrs.style as React.CSSProperties)?.fontSize === '12px') props['data-fit-font'] = 'parent';
    if (section === 'COUPLE' && cls.includes('min-h-[80px]') && cls.includes('whitespace-nowrap')) props['data-fit-font'] = 'person';
    if (node.tag === 'span' && String((node.attrs.style as React.CSSProperties)?.transform).startsWith('translateY(')) props['data-original-parallax'] = cls.includes('-right-[16%]') ? '.12' : '.14';
    let children = node.children.map((child, index) => render(child, section, `${key}.${index}`, options));
    if (section === 'cover' && node === layout.cover && coverParticles.length) {
      const prototype = findNodes(layout.cover, item => item.tag === 'svg' && item.attrs.viewBox === '0 0 24 24')[0];
      children.push(<div key="opening-particles" aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>{coverParticles.map((style, index) => <div key={index} data-cover-particle className="absolute left-1/2 top-1/2" style={style as React.CSSProperties}>{render(prototype, 'particle', `particle.${index}`)}</div>)}</div>);
    }
    if (section === 'cover' && isOpening && node.children.some(child => typeof child !== 'string' && child.attrs['data-cover-part'] === 'seal')) {
      children.push(<div key="seal-ring" data-cover-part="ring" aria-hidden="true" className="absolute left-1/2 rounded-full pointer-events-none" style={{ top: 50, width: 56, height: 56, border: `3px solid ${schema.theme.primaryColor}`, zIndex: 29, animation: 'seal-ring 0.6s ease-out forwards' }} />);
      children.push(...layout.coverMotion.flyingDecorations.map((decoration, index) => render(decoration, 'cover-flight', `${key}.flight${index}`)));
    }
    if (section === 'cover' && isOpening && node.attrs['data-cover-part'] === 'panel') children.push(<div key="opening-glow" aria-hidden="true" className="absolute inset-0 pointer-events-none transition-opacity duration-300" style={copySourceStyle({ background: 'radial-gradient(ellipse at center top, rgba(81, 20, 25, 0.2) 0%, transparent 70%)' }) as React.CSSProperties} />);
    if (!options.literal && typeof node.attrs['data-text-binding'] === 'string') {
      let assigned = false;
      children = node.children.map((child, index) => {
        if (typeof child !== 'string') return render(child, section, `${key}.${index}`, options);
        if (assigned) return null;
        assigned = true;
        return data.boundText(node.attrs['data-text-binding'] as string);
      });
    }
    if (node.tag === 'img') {
      const src = String(props.src || '');
      const index = referenceImages.indexOf(src);
      if (index >= 0) props.src = data.gallery[index] || data.gallery[0];
      if (section === 'HERO' && !/flower|envelope|castle/.test(src)) props.src = data.hero?.coverImageUrl || props.src;
      if (options.image && /\/images\/[^/]+\.webp/.test(src) && !/flower|envelope|castle/.test(src)) props.src = options.image;
      if (section === 'photo' && cls.includes('max-w-full') && cls.includes('object-contain')) props.src = data.gallery[photo || 0];
      if (section === 'gift' && src.includes('qr-png')) props.src = account?.qrCodeUrl;
    }
    if (node.tag === 'iframe') {
      props.title = 'Bản đồ địa điểm tổ chức';
      props.src = `https://maps.google.com/maps?q=${encodeURIComponent(data.banquet?.groomEvents[0]?.address || '')}&output=embed`;
    }
    if (node.tag === 'a') {
      const href = String(props.href || '');
      if (href === '?open=1') {
        props.href = '#invitation'; props['aria-busy'] = isOpening; props['aria-disabled'] = isOpening;
        props.onClick = (event: React.MouseEvent) => { event.preventDefault(); open(); };
        props.onKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => { if (event.key === ' ') { event.preventDefault(); open(); } };
      }
      else if (href.includes('maps')) props.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.banquet?.groomEvents[0]?.address || '')}`;
      else if (href.includes('calendar')) props.href = calendarUrl(data.date, data.hero?.groomName || '', data.hero?.brideName || '', data.banquet?.groomEvents[0]?.address || '');
      if (section === 'gift' && text.includes('Lưu QR') && account) { props.href = account.qrCodeUrl; props.download = `${account.accountNumber}.png`; }
      if (section === 'credit') props.href = 'https://chungdoi.com';
    }
    if (cls.includes('grid-cols-7 gap-y')) {
      const cells = node.children.filter((child): child is Exclude<OriginalNode, string> => typeof child !== 'string');
      const empty = cells.find(child => !nodeText(child))!;
      const normal = cells.find(child => nodeText(child) === '1')!;
      const selected = cells.find(child => nodeText(child) === '3')!;
      const first = (new Date(data.date.getFullYear(), data.date.getMonth(), 1).getDay() + 6) % 7;
      const days = new Date(data.date.getFullYear(), data.date.getMonth() + 1, 0).getDate();
      children = Array.from({ length: first + days }, (_, index) => {
        const day = index - first + 1;
        const prototype = day < 1 ? empty : day === data.date.getDate() ? selected : normal;
        return render(day < 1 ? prototype : replaceNodeText(prototype, day === data.date.getDate() ? '3' : '1', String(day)), section, `${key}.day${index}`, { literal: true });
      });
    }
    if (section === 'GALLERY' && node.children.some(child => typeof child !== 'string' && String(child.attrs.class).startsWith('absolute h-[92%]'))) {
      const prototypes = node.children.filter((child): child is Exclude<OriginalNode, string> => typeof child !== 'string');
      children = data.gallery.map((image, index) => {
        const offset = (index - activePhoto + data.gallery.length) % data.gallery.length;
        const distance = offset <= data.gallery.length / 2 ? offset : offset - data.gallery.length;
        const position = distance >= 0 ? Math.min(distance, 3) : prototypes.length + Math.max(distance, -3);
        const prototype = prototypes[position];
        return render({ ...prototype, attrs: { ...prototype.attrs, 'data-gallery-index': index, role: 'button', tabindex: 0, 'aria-label': `Xem ảnh cưới ${index + 1}` } }, section, `${key}.photo${index}`, { image });
      });
    }
    const navigation = node.children.filter((child): child is Exclude<OriginalNode, string> => typeof child !== 'string' && child.tag === 'button');
    const isDots = navigation.length > 0 && navigation.every(child => String(child.attrs['aria-label']).startsWith('Go to photo'));
    const isThumbnails = navigation.length > 0 && navigation.every(child => String(child.attrs['aria-label']).startsWith('View image'));
    if (isDots || isThumbnails) {
      children = data.gallery.map((image, index) => {
        const selected = index === (isDots ? activePhoto : photo);
        const prototype = navigation[selected ? 0 : 1] || navigation[0];
        return render({ ...prototype, attrs: { ...prototype.attrs, 'aria-label': `${isDots ? 'Go to photo' : 'View image'} ${index + 1}`, 'aria-current': selected ? 'true' : 'false' } }, section, `${key}.navigation${index}`, { image });
      });
    }
    if (node.attrs['data-gallery-index'] !== undefined) {
      const index = Number(node.attrs['data-gallery-index']);
      props.onClick = () => { if (index === activePhoto) setPhoto(index); else setActivePhoto(index); };
      props.onKeyDown = (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActivePhoto(index); setPhoto(index); } };
    }
    const label = String(node.attrs['aria-label'] || '');
    if (node.tag === 'button') {
      props.type = 'button';
      if (section === 'GIFTBOX' && text.includes('Nhấn để mở')) props.onClick = () => setGiftOpen(true);
      if (label === 'Previous photo') props.onClick = () => data.gallery.length && setActivePhoto(current => (current - 1 + data.gallery.length) % data.gallery.length);
      if (label === 'Next photo') props.onClick = () => data.gallery.length && setActivePhoto(current => (current + 1) % data.gallery.length);
      if (label.startsWith('Go to photo')) props.onClick = () => setActivePhoto(Number(label.match(/\d+/)?.[0]) - 1);
      if (label === 'Previous image') props.onClick = () => shiftPhoto(-1);
      if (label === 'Next image') props.onClick = () => shiftPhoto(1);
      if (label === 'Close lightbox') props.onClick = () => setPhoto(null);
      if (section === 'photo' && text === 'close') props.onClick = () => setPhoto(null);
      if (text.trim().startsWith('XÁC NHẬN')) props.onClick = () => { setRsvpSelection(null); setRsvpOpen(true); };
      if (section === 'gift' && (!text || text === 'close')) props.onClick = () => setGiftOpen(false);
      if (section === 'rsvp' && !text) props.onClick = () => setRsvpOpen(false);
      if (section === 'WISHES' && text.includes('🪄')) { props.title = 'Điền lời chúc gợi ý'; props.onClick = () => guestbook.setMessage('Chúc hai bạn trăm năm hạnh phúc!'); }
      if (node.attrs.type === 'submit' || (section === 'WISHES' && text.includes('GỬI LỜI CHÚC'))) { props.type = 'submit'; props.disabled = guestbook.isSubmitting || (section === 'rsvp' && rsvpSelection === null); }
      if (section === 'gift' && text.includes('Lưu QR')) props.onClick = () => {
        if (!account?.qrCodeUrl) return;
        const link = document.createElement('a'); link.href = account.qrCodeUrl; link.download = `${account.accountNumber}.png`; link.click();
      };
    }
    if (node.tag === 'form') {
      if (node.attrs.method === 'dialog') props.onSubmit = (event: React.FormEvent) => { event.preventDefault(); section === 'photo' ? setPhoto(null) : setGiftOpen(false); };
      else props.onSubmit = (event: React.FormEvent) => {
        if (section === 'rsvp' && rsvpSelection === null) { event.preventDefault(); return; }
        return guestbook.handleSubmit(event);
      };
      if (section === 'WISHES' || section === 'rsvp') children.push(guestbook.errorMsg ? <p key="error" role="alert">{guestbook.errorMsg}</p> : guestbook.isSent ? <p key="success" role="status">Cảm ơn bạn! Phản hồi đã được gửi.</p> : null);
    }
    if (node.tag === 'input' && node.attrs.type !== 'radio') {
      props.value = guestbook.guestName; props.maxLength = 100; props['aria-label'] = 'Tên của bạn';
      props.onChange = (event: React.ChangeEvent<HTMLInputElement>) => guestbook.setGuestName(event.target.value);
    }
    if (node.tag === 'input' && node.attrs.type === 'radio') {
      if (node.attrs.value !== 'yes' && node.attrs.value !== 'no') throw new Error('Invalid RSVP radio value in Minimalism source.');
      const status = node.attrs.value === 'yes' ? 'ATTENDING' : 'DECLINED';
      props.value = node.attrs.value; props.checked = rsvpSelection === status; props.required = true;
      props.onChange = () => { setRsvpSelection(status); guestbook.handleAttendanceChange(status); };
    }
    if (node.tag === 'textarea') {
      props.value = guestbook.message; props.maxLength = 500; props['aria-label'] = 'Lời chúc';
      props.onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => guestbook.setMessage(event.target.value);
    }
    if (section === 'WISHES' && cls.startsWith('mt-8 w-full space-y-3')) {
      const prototype = node.children.find(child => typeof child !== 'string');
      const additions = slug ? guestbook.wishes : guestbook.wishes.filter(wish => wish.id > 0);
      if (slug) children = [];
      const entries: React.ReactNode[] = [];
      if (prototype) additions.forEach(wish => {
        let entry = replaceNodeText(prototype, 'Duy Khang', wish.guestName);
        entry = replaceNodeText(entry, 'Chúc mừng ngày vui của hai bạn, trăm năm hạnh phúc bền lâu!', wish.message || 'Đã gửi phản hồi tham dự.');
        entry = replaceNodeText(entry, '12:30:49 26/7/2026', new Date(wish.createdAt).toLocaleString('vi-VN'));
        entries.push(render(entry, 'wish-entry', `${key}.${wish.id}`, { literal: true }));
      });
      children = [...entries, ...children];
      if (slug && guestbook.isLoading) children = [<p key="loading" role="status">Đang tải lời chúc…</p>];
      if (slug && !guestbook.isLoading && !children.length) children = [<p key="empty">Chưa có lời chúc nào.</p>];
    }
    if (node.tag === 'dialog') {
      props.ref = section === 'photo' ? photoDialog : giftDialog;
      props.onCancel = () => section === 'photo' ? setPhoto(null) : setGiftOpen(false);
      if (section === 'photo') props.onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); shiftPhoto(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); shiftPhoto(1); }
      };
    }
    if (section === 'gift' && cls.includes('modal-box') && !data.gifts?.groomAccount && !data.gifts?.brideAccount) children.push(<p key="no-accounts" className="p-6 text-center">Thông tin mừng cưới chưa được thiết lập.</p>);
    if (section === 'photo' && text === '1 / 7') children = [`${(photo || 0) + 1} / ${data.gallery.length}`];
    if (section === 'photo' && label.startsWith('View image')) props.onClick = () => setPhoto(Number(label.match(/\d+/)?.[0]) - 1);
    const voidElement = ['img', 'input', 'br', 'hr', 'source', 'wbr', 'link'].includes(node.tag);
    return createElement(node.tag, props, voidElement ? undefined : children);
  };

  const sections: React.ReactNode[] = [];
  for (const block of schema.blocks.filter(item => !item.isHidden)) {
    if (block.type === 'GALLERY' && !data.gallery.length) continue;
    if (block.type === 'EVENTS' && !(block.props as { groomEvents?: { id?: string }[] }).groomEvents?.some(event => event.id === 'banquet')) continue;
    const nodes = layout.sections[block.type] || [];
    nodes.forEach((node, index) => sections.push(render(node, block.type === 'EVENTS' && index === 1 ? 'location' : block.type, `${block.id}.${index}`)));
  }
  const shell = typeof layout.shell === 'string' ? null : layout.shell;
  const card = shell?.children[0] as Exclude<OriginalNode, string>;
  const { class: shellClassName, ...shellAttributes } = shell?.attrs || {};
  const { class: cardClassName, ...cardAttributes } = card?.attrs || {};

  return (
    <div ref={host} data-template="minimalism-original-v2" data-invitation-open={opened} data-theme="halloween" className={containerClassName} style={{ width: '100%', minHeight: embedded ? 560 : '100dvh', visibility: ready ? 'visible' : 'hidden' }}>
      {/* Isolated original stylesheet and React-rendered source element tree */}
      {shadow && createPortal(<>
        <link rel="stylesheet" href="/template-designs/minimalism-dark-red/v2.css" onLoad={() => setReady(true)} onError={() => { setReady(true); setFeedback('Không thể tải giao diện thiệp. Vui lòng tải lại trang.'); }} />
        <style>{`:host{--template-primary:${schema.theme.primaryColor}}label:has(input[name="attending"]:checked){border-color:var(--template-primary);background:#fff}label:has(input[name="attending"]:checked)>div{background:var(--template-primary);color:#fff}label:has(input[name="attending"]:checked) svg{color:#fff}label:has(input[name="attending"]:focus-visible){outline:2px solid var(--template-primary);outline-offset:2px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`}</style>
        <style>{`
          :host(.invitation-demo) footer{padding-bottom:20px}
          .invitation-music{display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:var(--template-primary);color:#ece4d8;cursor:pointer;z-index:40;transition:transform .2s ease-out}
          .invitation-music:hover{transform:translateY(-2px)}
          .invitation-music:focus-visible{outline:2px solid var(--template-primary);outline-offset:4px}
          .music-wave{display:flex;align-items:center;justify-content:center;gap:3px;height:22px}
          .music-wave span{display:block;width:3px;border-radius:2px;background:currentColor;transform-origin:center}
          .invitation-music[data-playing="true"] .music-wave span{animation:invitation-music-wave .9s ease-in-out infinite}
          .invitation-music[data-playing="false"] .music-wave{opacity:.65}
          @keyframes invitation-music-wave{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
          @media(prefers-reduced-motion:reduce){.invitation-music:hover{transform:none}}
        `}</style>
        <main id="invitation" style={{ minHeight: '100dvh' }}>
          {opened && shell && createElement(shell.tag, { ...shellAttributes, className: shellClassName }, createElement(card.tag, { ...cardAttributes, className: cardClassName }, layout.decorations.map((node, index) => render(node, 'decoration', `decoration${index}`)), sections, render(layout.credit, 'credit', 'credit'), render(layout.photo, 'photo', 'photo')))}
          {!opened && render(layout.cover, 'cover', 'cover')}
          {opened && render(layout.gift, 'gift', 'gift')}
          {rsvpOpen && <dialog ref={rsvpDialog} aria-label="Xác nhận tham dự" onCancel={() => setRsvpOpen(false)} style={{ padding: 0, border: 0, width: '100%', maxWidth: 'none', height: '100%', maxHeight: 'none', background: 'transparent' }}>{render(layout.rsvp, 'rsvp', 'rsvp')}</dialog>}
          {/* Bottom-left music control */}
          {opened && schema.effects.musicUrl && <button type="button" className="invitation-music" data-playing={playing} aria-pressed={playing} title={playing ? 'Tắt nhạc' : 'Phát nhạc'} aria-label={playing ? 'Tắt nhạc' : 'Phát nhạc'} onClick={() => { if (playing) { audio.current?.pause(); setPlaying(false); } else audio.current?.play().then(() => setPlaying(true)).catch(() => setFeedback('Không thể phát nhạc.')); }} style={{ position: embedded ? 'sticky' : 'fixed', left: 'max(12px, env(safe-area-inset-left))', bottom: slug ? 'max(84px, calc(env(safe-area-inset-bottom) + 76px))' : 'max(12px, env(safe-area-inset-bottom))' }}>
            <span className="music-wave" aria-hidden="true">{[8, 14, 22, 14, 8].map((height, index) => <span key={index} style={{ height, animationDelay: `${index * -.16}s` }} />)}</span>
          </button>}
          <audio ref={audio} src={schema.effects.musicUrl} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          {feedback && <p role="status">{feedback}</p>}
        </main>
      </>, shadow)}
    </div>
  );
}

function findNodes(node: OriginalNode, predicate: (node: Exclude<OriginalNode, string>) => boolean): Exclude<OriginalNode, string>[] {
  if (typeof node === 'string') return [];
  return [...(predicate(node) ? [node] : []), ...node.children.flatMap(child => findNodes(child, predicate))];
}

function calendarUrl(date: Date, groom: string, bride: string, address: string) {
  const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('');
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const next = [end.getFullYear(), String(end.getMonth() + 1).padStart(2, '0'), String(end.getDate()).padStart(2, '0')].join('');
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: 'TEMPLATE', text: `${groom} & ${bride}`, dates: `${day}/${next}`, location: address })}`;
}
