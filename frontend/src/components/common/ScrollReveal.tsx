'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export type ScrollRevealEffect =
  | 'bounceInLeft'
  | 'bounceInRight'
  | 'bounceInUp'
  | 'bounceInDown'
  | 'fadeInDown'
  | 'fadeInUp'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'bounce';

const EFFECT_CLASS_MAP: Record<ScrollRevealEffect, string> = {
  bounceInLeft: 'animate-bounce-in-left',
  bounceInRight: 'animate-bounce-in-right',
  bounceInUp: 'animate-bounce-in-up',
  bounceInDown: 'animate-bounce-in-down',
  fadeInDown: 'animate-fade-in-down',
  fadeInUp: 'animate-fade-in-up',
  fadeInLeft: 'animate-fade-in-left',
  fadeInRight: 'animate-fade-in-right',
  bounce: 'animate-hb04-bounce',
};

/**
 * ScrollReveal Component
 * Purpose: Wrapper component tạo hiệu ứng xuất hiện khi cuộn trang:
 *   - Khi truyền prop `effect`: Chạy đúng các hoạt họa CSS chuẩn displayAnimation của thiệp meHappy (bounceIn*, fadeIn*, bounce).
 *   - Khi không truyền `effect`: Giữ nguyên hiệu ứng cuộn mờ ảo (Dreamy Ethereal Scroll Reveal với Framer Motion) cho Landing Page.
 * Props:
 *   - children: Nội dung cần hiển thị hoạt họa
 *   - effect: Loại hiệu ứng thiệp cưới tùy chọn
 *   - className, style, delay, yOffset, duration, blur, scale: Các tham số tinh chỉnh chuyển động
 * Key States:
 *   - isVisible: Cờ kích hoạt CSS keyframe khi phần tử đi vào vùng nhìn thấy.
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  effect?: ScrollRevealEffect;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  yOffset?: number;
  duration?: number;
  blur?: number;
  scale?: number;
}

export function ScrollReveal({
  children,
  effect,
  className = '',
  style,
  delay = 0,
  yOffset = 36,
  duration = 0.8,
  blur = 10,
  scale = 0.96,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!effect) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [effect]);

  if (effect) {
    return (
      <div
        ref={containerRef}
        style={{
          ...style,
          animationDuration: isVisible ? `${duration}s` : undefined,
          animationDelay: isVisible && delay ? `${delay}s` : undefined,
        }}
        className={`${className} ${isVisible ? EFFECT_CLASS_MAP[effect] : 'opacity-0'}`}
      >
        {/* Invitation Block Animated Content */}
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: yOffset,
        scale,
        filter: `blur(${blur}px)`,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ willChange: 'opacity, transform, filter', ...style }}
      className={className}
    >
      {/* Landing Page Section Animated Content */}
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
