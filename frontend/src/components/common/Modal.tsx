'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal Component
 * Purpose: Reusable standard dialog with Framer Motion backdrop & content fade-in animations
 * Props:
 *   - isOpen: boolean flag to control display state
 *   - onClose: callback function invoked when backdrop or close button is clicked
 *   - title: optional modal header title
 *   - children: modal body content
 *   - maxWidth: optional Tailwind max-width class (default: 'max-w-md')
 * Key States:
 *   - isOpen controls AnimatePresence mount and unmount transitions
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Dialog Fade In + Scale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 w-full ${maxWidth} bg-surface-container-lowest dark:bg-[#161824] rounded-2xl p-6 shadow-2xl border border-outline-variant/20 dark:border-[#2d3142]`}
          >
            {/* Header Section */}
            {title && (
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20 dark:border-[#2d3142]">
                <h3 className="font-title-md text-title-md font-bold text-on-surface dark:text-slate-100">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  aria-label="Đóng"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
