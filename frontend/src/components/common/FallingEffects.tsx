'use client';

import React, { useMemo } from 'react';
import { FallingEffectType } from '@/types/schema';

interface ParticleSeed {
  id: number;
  sizePx: number;
  leftPct: number;
  fallDurationSec: number;
  fallDelaySec: number;
  wobbleDurationSec: number;
  wobbleDelaySec: number;
}

const PARTICLE_COUNT = 28;

/**
 * Deterministic pseudo-random generator to avoid SSR/Client hydration mismatch.
 */
function seededFraction(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface FallingEffectsProps {
  type: FallingEffectType;
  embedded?: boolean;
}

/**
 * FallingEffects Component
 * Purpose: Lớp phủ hiệu ứng hạt rơi lắc lư (wobble) trên toàn khung nhìn:
 *   - SNOW: Hạt ngọc tuyết trắng có đổ bóng feDropShadow chuẩn data.template.effects của meHappy HB04 (#145).
 *   - PETALS: Cánh hoa hồng rơi nhẹ.
 *   - HEARTS: Trái tim nhỏ bay lượn.
 * Props:
 *   - type: Loại hiệu ứng ('NONE' | 'SNOW' | 'PETALS' | 'HEARTS').
 *   - embedded: Cờ hiển thị giới hạn trong khung xem trước nhỏ.
 * Key States: Không có (dùng hạt giống tất định chống lệch Hydration).
 */
export function FallingEffects({ type, embedded = false }: FallingEffectsProps) {
  const particles = useMemo<ParticleSeed[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, idx) => {
      const r1 = seededFraction(idx + 1);
      const r2 = seededFraction(idx + 101);
      const r3 = seededFraction(idx + 201);
      const r4 = seededFraction(idx + 301);
      const r5 = seededFraction(idx + 401);

      return {
        id: idx,
        sizePx: Math.round((6 + r1 * 6) * 10) / 10,
        leftPct: Math.round((1 + r2 * 97) * 100) / 100,
        fallDurationSec: Math.round((7.5 + r3 * 6) * 100) / 100,
        fallDelaySec: -Math.round(r4 * 13 * 100) / 100,
        wobbleDurationSec: Math.round((2.2 + r5 * 2) * 100) / 100,
        wobbleDelaySec: -Math.round(r1 * 3 * 100) / 100,
      };
    });
  }, []);

  if (type === 'NONE') return null;

  const positionClass = embedded ? 'absolute inset-0 z-20' : 'fixed inset-0 z-30';

  const renderParticleGraphic = (id: number) => {
    if (type === 'HEARTS') {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full text-rose-400/80 fill-current drop-shadow-sm">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    }

    if (type === 'PETALS') {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-300/85 drop-shadow-sm">
          <path d="M12 2C8.5 5.5 6 9.5 6 13.5C6 17.5 8.7 21 12 22C15.3 21 18 17.5 18 13.5C18 9.5 15.5 5.5 12 2Z" />
        </svg>
      );
    }

    // Default 'SNOW': Exact white pearl circle + feDropShadow from meHappy HB04 (#145)
    const filterId = `hb04-pearl-shadow-${id}`;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>
        <circle cx="12" cy="12" r="5" fill="#ffffff" filter={`url(#${filterId})`} />
      </svg>
    );
  };

  return (
    <div aria-hidden="true" className={`pointer-events-none ${positionClass} overflow-hidden`}>
      {/* Falling Wobble Particles */}
      {particles.map((p) => {
        const displaySize = type === 'SNOW' ? p.sizePx : p.sizePx + 5;
        return (
          <div
            key={p.id}
            style={{
              width: `${displaySize}px`,
              height: `${displaySize}px`,
              left: `${p.leftPct}%`,
              top: '-24px',
              animation: `pearlFall ${p.fallDurationSec}s linear ${p.fallDelaySec}s infinite`,
            }}
            className="absolute will-change-transform"
          >
            <div
              style={{
                animation: `pearlWobble ${p.wobbleDurationSec}s ease-in-out ${p.wobbleDelaySec}s infinite alternate`,
              }}
              className="w-full h-full"
            >
              {renderParticleGraphic(p.id)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
