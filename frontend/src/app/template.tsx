'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * RootTemplate Component
 * Purpose: Cung cấp hiệu ứng Fade-in mượt mà toàn dự án khi tải trang và chuyển trang (Page Transition).
 * Chú ý: Dùng thuần opacity (không kèm transform y) để đảm bảo không bị giật layout và thanh Header (position: fixed) cố định hoàn hảo.
 * Props:
 *   - children: React.ReactNode
 */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}
