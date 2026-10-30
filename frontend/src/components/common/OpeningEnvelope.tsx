'use client';

import React, { useState, useEffect } from 'react';
import { OpeningEffectConfig } from '@/types/schema';

interface OpeningEnvelopeProps {
  config?: OpeningEffectConfig;
}

/**
 * OpeningEnvelope Component
 * Purpose: Hiệu ứng cánh thiệp mở đôi (split-panels) chuẩn meHappy trượt sang 2 bên khi quan khách mở thiệp.
 * Props:
 *   - config: Cấu hình OpeningEffectConfig (ảnh cánh trái, cánh phải, thời gian trễ).
 * Key States:
 *   - isOpen: Trạng thái đã mở hay còn đóng.
 *   - isHidden: Trạng thái gỡ bỏ hoàn toàn khỏi DOM sau khi animation kết thúc.
 */
export function OpeningEnvelope({ config }: OpeningEnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const leftImage = config?.leftImage || '/templates/hb04/opening/left-thiep.webp';
  const rightImage = config?.rightImage || '/templates/hb04/opening/right-thiep.webp';
  const delayMs = config?.delayMs ?? 1000;

  useEffect(() => {
    // Auto open after specified delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  useEffect(() => {
    if (isOpen) {
      const hideTimer = setTimeout(() => {
        setIsHidden(true);
      }, 1200);
      return () => clearTimeout(hideTimer);
    }
  }, [isOpen]);

  if (isHidden || !config?.enabled) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setIsOpen(true)}
      className="fixed inset-0 z-50 overflow-hidden pointer-events-auto cursor-pointer"
    >
      {/* Left Panel */}
      <div
        style={{
          backgroundImage: `url(${leftImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          transform: isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="absolute top-0 bottom-0 left-0 w-1/2 shadow-2xl z-10"
      />

      {/* Right Panel */}
      <div
        style={{
          backgroundImage: `url(${rightImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          transform: isOpen ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="absolute top-0 bottom-0 right-0 w-1/2 shadow-2xl z-10"
      />

      {/* Center Wax Seal / Open Button */}
      {!isOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <div className="w-16 h-16 rounded-full bg-rose-600 text-white shadow-2xl flex items-center justify-center border-4 border-white pointer-events-auto">
              <span className="material-symbols-outlined text-[32px]">mail</span>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-white/95 text-rose-600 text-xs font-bold shadow-md uppercase tracking-wider">
              Chạm để mở thiệp
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
