'use client';

import { RefObject, useEffect, useState } from 'react';

/**
 * Measures the visible stage height inside embedded scroll hosts (Studio canvas or preview iframe)
 * so opening envelopes and particle overlays fit the visible frame without stretching or overflowing.
 */
export function useEmbeddedStageHeight(
  hostRef: RefObject<HTMLElement | null>,
  enabled: boolean
): number | undefined {
  const [stageHeight, setStageHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !hostRef.current) {
      setStageHeight(undefined);
      return;
    }

    let scrollHost: HTMLElement | null = hostRef.current.parentElement;
    while (scrollHost && scrollHost !== document.body) {
      const overflowY = getComputedStyle(scrollHost).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') break;
      scrollHost = scrollHost.parentElement;
    }

    const measure = () => {
      if (scrollHost && scrollHost !== document.body) {
        const styles = getComputedStyle(scrollHost);
        const verticalPadding =
          (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
        const innerHeight = Math.floor(scrollHost.clientHeight - verticalPadding);
        const clamped = Math.min(scrollHost.clientHeight, Math.max(420, innerHeight));
        if (clamped > 0) setStageHeight(clamped);
        return;
      }

      if (window.innerHeight > 0) {
        setStageHeight(window.innerHeight);
      }
    };

    measure();
    const observer = scrollHost && scrollHost !== document.body ? new ResizeObserver(measure) : null;
    if (scrollHost && observer) observer.observe(scrollHost);
    window.addEventListener('resize', measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [hostRef, enabled]);

  return stageHeight;
}
