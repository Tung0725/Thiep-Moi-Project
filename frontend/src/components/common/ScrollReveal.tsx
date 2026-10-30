'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollReveal Component
 * Purpose: Wrapper component tạo hiệu ứng cuộn mờ ảo (Dreamy Ethereal Scroll Reveal) với Gaussian Blur, Depth Zoom và Smooth Lift
 * Props:
 *   - children: Nội dung cần hiển thị hoạt họa
 *   - className: Class CSS tùy chọn cho container
 *   - delay: Độ trễ bắt đầu tính bằng giây (mặc định: 0)
 *   - yOffset: Khoảng cách nâng lên theo trục Y (mặc định: 36px)
 *   - duration: Thời gian chuyển động (mặc định: 0.8s)
 *   - blur: Mức độ mờ ảo ban đầu tính bằng pixel (mặc định: 10px)
 *   - scale: Tỉ lệ chiều sâu ban đầu (mặc định: 0.96)
 * Key States:
 *   - Driven hoàn toàn qua Framer Motion whileInView kết hợp cubic-bezier luxury curve
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  duration?: number;
  blur?: number;
  scale?: number;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  yOffset = 36,
  duration = 0.8,
  blur = 10,
  scale = 0.96,
}: ScrollRevealProps) {
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
      style={{ willChange: 'opacity, transform, filter' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
