'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BackgroundMusicProps {
  musicUrl: string;
  embedded?: boolean;
}

/**
 * BackgroundMusic Component
 * Purpose: Phát nhạc nền đám cưới tự động kèm nút điều khiển tròn phát sáng ở góc trái dưới chuẩn meHappy HB04.
 *   - Tự động phát ngay khi trình duyệt cho phép hoặc ngay ở thao tác chạm đầu tiên của khách mời.
 * Props:
 *   - musicUrl: Đường dẫn file âm thanh mp3.
 *   - embedded: Cờ hiển thị gọn khi nhúng trong khung xem trước nhỏ.
 * Key States:
 *   - isPlaying: Trạng thái đang phát nhạc.
 */
export function BackgroundMusic({ musicUrl, embedded = false }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const manuallyPausedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attemptPlay = () => {
      if (manuallyPausedRef.current || !audio.paused) return;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    };

    attemptPlay();

    const handleFirstInteraction = () => {
      if (!manuallyPausedRef.current && audio.paused) {
        attemptPlay();
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [musicUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      manuallyPausedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      manuallyPausedRef.current = false;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const positionClass = embedded
    ? 'sticky bottom-3 left-3 ml-3 mb-3 z-30'
    : 'fixed bottom-20 sm:bottom-5 left-4 sm:left-5 z-40';

  return (
    <>
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />

      {/* Bottom-Left Glowing Circular Music Button */}
      <button
        type="button"
        onClick={togglePlay}
        style={{
          boxShadow: '0 0 18px 4px rgba(212, 95, 105, 0.55), 0 2px 8px rgba(0, 0, 0, 0.12)',
          animation: isPlaying ? 'audioPulseGlow 2.2s ease-in-out infinite' : undefined,
        }}
        className={`${positionClass} w-11 h-11 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer`}
        title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc cưới'}
        aria-label="Điều khiển nhạc nền"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 17.5C9 18.8807 7.88071 20 6.5 20C5.11929 20 4 18.8807 4 17.5C4 16.1193 5.11929 15 6.5 15C7.88071 15 9 16.1193 9 17.5Z"
            fill="#E14B65"
          />
          <path
            d="M19 15.5C19 16.8807 17.8807 18 16.5 18C15.1193 18 14 16.8807 14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5Z"
            fill="#5A67D8"
          />
          <path
            d="M9 17.5V6.2L19 4V15.5"
            stroke="#D54F7A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 9.8L19 7.6" stroke="#8E58B8" strokeWidth="1.8" />
        </svg>

        {!isPlaying && (
          <span className="absolute w-6 h-[2.2px] bg-[#d93848] -rotate-45 rounded-full" />
        )}
      </button>
    </>
  );
}
