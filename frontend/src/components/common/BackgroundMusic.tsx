'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BackgroundMusicProps {
  musicUrl: string;
}

/**
 * BackgroundMusic Component
 * Purpose: Phát nhạc nền đám cưới du dương với nút điều khiển nổi hình đĩa nhạc quay sinh động.
 * Props:
 *   - musicUrl: Đường dẫn file âm thanh mp3.
 * Key States:
 *   - isPlaying: Trạng thái phát nhạc.
 */
export function BackgroundMusic({ musicUrl }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Browser audio autoplay policy: attempt autoplay, fallback silently
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [musicUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />

      {/* Floating Vinyl Music Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`fixed top-20 right-4 z-40 w-11 h-11 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
          isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
        }`}
        title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc cưới'}
        aria-label="Điều khiển nhạc nền"
      >
        <span className="material-symbols-outlined text-[20px] text-rose-600">
          {isPlaying ? 'music_note' : 'music_off'}
        </span>
      </button>
    </>
  );
}
