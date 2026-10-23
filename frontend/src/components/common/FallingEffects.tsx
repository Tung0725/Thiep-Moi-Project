import React from 'react';
import { FallingEffectType } from '@/types/schema';

/**
 * FallingEffects Component
 * Purpose: Khung hiệu ứng hoạt họa phủ màn hình (cánh hoa, hoa tuyết, trái tim)
 * Props:
 *   - type: FallingEffectType ('NONE' | 'PETALS' | 'SNOW' | 'HEARTS')
 * Key States: Không có (skeleton)
 */
interface FallingEffectsProps {
  type: FallingEffectType;
}

export function FallingEffects({ type }: FallingEffectsProps) {
  if (type === 'NONE') return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {/* Falling Particle Overlay Skeleton */}
    </div>
  );
}
