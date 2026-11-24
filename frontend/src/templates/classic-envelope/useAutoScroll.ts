'use client';

import { useEffect } from 'react';

const START_DELAY_MS = 2000;
const DEFAULT_SPEED = 50;
const WHEEL_PAUSE_DISTANCE = 50;
const AFTER_EDIT_GUARD_MS = 400;
const LAYOUT_SETTLE_MS = 1200;
const NO_CONTENT_TIMEOUT_MS = 30000;
const EDITABLE = 'input, textarea, select, [contenteditable="true"]';
const INTERACTIVE = 'img, button, a, input, textarea, select, video, audio, dialog, [role="menu"], [role="menuitem"], [role="listbox"], [role="option"], [role="dialog"], [role="alertdialog"], .modal, .dropdown-menu, [data-dropdown], [data-modal]';

/** Keeps Minimalism's source scroll behavior local to its runtime, including Shadow DOM form interactions. */
export function useInvitationAutoScroll(enabled: boolean, root: ShadowRoot | null) {
  useEffect(() => {
    if (!enabled || !root) return;
    const host = root.host as HTMLElement;
    const query = new URLSearchParams(window.location.search);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
    if (reducedMotion.matches || query.get('screenshot') === 'true' || query.get('videoCapture') === '1') {
      host.dataset.autoScroll = 'disabled';
      return;
    }
    const requestedSpeed = Number.parseInt(query.get('scroll') || '', 10);
    const speed = Number.isFinite(requestedSpeed) && requestedSpeed > 0 ? requestedSpeed : DEFAULT_SPEED;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    let frame = 0;
    let started = false;
    let finished = false;
    let paused = false;
    let editing = false;
    let position = 0;
    let lastTime = 0;
    let lastHeight = 0;
    let lastGrowth = 0;
    let startTime = 0;
    let wheelDistance = 0;
    let lastEdit = -Infinity;
    let blurTimer = 0;
    host.dataset.autoScroll = 'waiting';

    const cancelFrame = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
    const pause = () => {
      if (finished) return;
      paused = true; cancelFrame(); host.dataset.autoScroll = 'paused';
    };
    const tick = (now: number) => {
      frame = 0;
      if (finished || paused || document.hidden) return;
      if (root.querySelector('dialog[open]')) { pause(); return; }
      const elapsed = lastTime ? Math.min(now - lastTime, 100) : 0;
      lastTime = now;
      const height = document.documentElement.scrollHeight;
      const maximum = Math.max(0, height - window.innerHeight);
      if (Math.abs(height - lastHeight) > 1) { lastHeight = height; lastGrowth = now; }
      if (maximum > 10) {
        position = Math.min(position + elapsed / 1000 * speed, maximum);
        window.scrollTo({ top: position, behavior: 'instant' });
      }
      if ((maximum <= 10 && now - startTime > NO_CONTENT_TIMEOUT_MS) || (maximum > 10 && position >= maximum - .5 && now - lastGrowth > LAYOUT_SETTLE_MS)) {
        finished = true; host.dataset.autoScroll = 'finished'; return;
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (finished || editing || root.querySelector('dialog[open]')) return;
      paused = false; wheelDistance = 0; position = window.scrollY; lastTime = 0;
      host.dataset.autoScroll = started ? 'running' : 'waiting';
      if (started && !frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const targetOf = (event: Event) => event.composedPath().find(target => target instanceof Element) as Element | undefined;
    const onWheel = (event: WheelEvent) => {
      if (paused || editing) return;
      wheelDistance += Math.abs(event.deltaY);
      if (wheelDistance >= WHEEL_PAUSE_DISTANCE) pause();
    };
    const onTouch = () => { if (!paused && !editing) pause(); };
    const onFocus = (event: Event) => {
      if (!targetOf(event)?.closest(EDITABLE)) return;
      editing = true; pause();
    };
    const onBlur = () => {
      clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        const active = root.activeElement || document.activeElement;
        if (active?.matches(EDITABLE)) return;
        if (editing) { editing = false; lastEdit = performance.now(); }
      }, 0);
    };
    const onClick = (event: Event) => {
      const target = targetOf(event);
      if (!target) return;
      if (target.closest(EDITABLE)) { editing = true; pause(); return; }
      if (target.closest(INTERACTIVE)) { pause(); return; }
      if (editing || performance.now() - lastEdit < AFTER_EDIT_GUARD_MS) return;
      if (paused) resume(); else pause();
    };
    const onVisibility = () => {
      cancelFrame();
      if (!document.hidden && started && !paused && !finished) resume();
    };
    const onMotionPreference = () => {
      if (!reducedMotion.matches) return;
      finished = true; cancelFrame(); clearTimeout(startTimer); host.dataset.autoScroll = 'disabled';
    };
    const startTimer = window.setTimeout(() => {
      if (finished) return;
      started = true; startTime = performance.now(); lastGrowth = startTime;
      if (!paused) resume();
    }, START_DELAY_MS);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('focusin', onFocus);
    window.addEventListener('mousedown', onFocus);
    window.addEventListener('focusout', onBlur);
    root.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onMotionPreference);
    return () => {
      finished = true; cancelFrame(); clearTimeout(startTimer); clearTimeout(blurTimer);
      window.removeEventListener('wheel', onWheel); window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('focusin', onFocus); window.removeEventListener('mousedown', onFocus); window.removeEventListener('focusout', onBlur);
      root.removeEventListener('click', onClick); document.removeEventListener('visibilitychange', onVisibility); reducedMotion.removeEventListener('change', onMotionPreference);
      history.scrollRestoration = previousRestoration;
      delete host.dataset.autoScroll;
    };
  }, [enabled, root]);
}
