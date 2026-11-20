'use client';

import React, { useState, useEffect } from 'react';
import { CountdownBlockProps } from '@/types/schema';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * CountdownBlock Component
 * Purpose: Đếm ngược thời gian thực (ngày, giờ, phút, giây) đến ngày cưới chuẩn thiết kế meHappy HB04:
 *   - Tiêu đề dùng font chữ nghệ thuật GreatVibes.
 *   - 4 ô đếm số ngày, giờ, phút, giây bo góc mềm mại, hiển thị màu số đỏ thắm (#A80606).
 * Props: CountdownBlockProps
 * Key States:
 *   - timeLeft: Thời gian còn lại tính toán theo giây thực tế.
 */
export default function CountdownBlock({
  targetDate = '2026-12-25T16:00:00',
  title = 'Cùng Đếm Ngược Ngày Chung Đôi',
  description = 'Từng giây từng phút hướng về ngày hạnh phúc nhất của hai đứa mình',
}: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds },
  ];

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 text-center">
      {/* Header Title */}
      <h2 className="font-greatvibes text-3xl sm:text-5xl text-[#A80606] dark:text-rose-400 mb-1">
        {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto px-4">
          {description}
        </p>
      )}

      {/* Countdown Digits Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-sm sm:max-w-md mx-auto mt-6">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#161824] border border-rose-100 dark:border-rose-950 shadow-sm"
          >
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#A80606] dark:text-rose-400 tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
