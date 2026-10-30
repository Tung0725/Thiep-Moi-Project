'use client';

import React, { useState } from 'react';
import { GiftBoxBlockProps, BankAccountInfo } from '@/types/schema';

/**
 * GiftBoxBlock Component
 * Purpose: Hiển thị Hộp Mừng Cưới với thông tin tài khoản ngân hàng và mã QR chuyển khoản chuẩn thiết kế meHappy HB04:
 *   - Tiêu đề "Hộp Mừng Cưới" dùng font thư pháp GreatVibes màu đỏ thắm (#A80606).
 *   - Tên người nhận dùng font thư pháp UVNHoaTay1.
 *   - Mã QR khổ chuẩn kèm nút sao chép số tài khoản nhanh.
 * Props: GiftBoxBlockProps
 * Key States:
 *   - copiedAccount: Số tài khoản vừa được copy vào clipboard.
 */
export default function GiftBoxBlock({
  title = 'Hộp Mừng Cưới',
  subtitle = 'Gửi món quà chúc phúc cho ngày vui của chúng mình',
  groomAccount,
  brideAccount,
}: GiftBoxBlockProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const renderAccountCard = (acc: BankAccountInfo, defaultLabel: string) => (
    <div className="bg-white dark:bg-[#161824] text-neutral-800 dark:text-neutral-100 rounded-3xl p-6 sm:p-7 shadow-sm border border-rose-100 dark:border-rose-950 flex flex-col items-center text-center justify-between">
      <span className="font-hoatay text-2xl sm:text-3xl text-[#A80606] dark:text-rose-400 mb-2">
        {acc.label || defaultLabel}
      </span>

      {/* QR Code Frame */}
      <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden p-2 bg-white border border-rose-100 dark:border-rose-950 shadow-inner mb-4">
        <img
          src={acc.qrCodeUrl || '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp'}
          alt={`Mã QR ${acc.ownerName}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Bank Account Details */}
      <div className="space-y-1 mb-5">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          {acc.bankName}
        </p>
        <p className="text-lg sm:text-xl font-bold tracking-wider font-mono text-[#A80606] dark:text-rose-400">
          {acc.accountNumber}
        </p>
        <p className="text-xs sm:text-sm font-bold uppercase text-neutral-700 dark:text-neutral-300">
          {acc.ownerName}
        </p>
      </div>

      {/* Copy Action */}
      <div className="w-full pt-1">
        <button
          type="button"
          onClick={() => handleCopy(acc.accountNumber)}
          className="w-full py-2.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#A80606] dark:text-rose-300 hover:bg-[#A80606] hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copiedAccount === acc.accountNumber ? 'check' : 'content_copy'}
          </span>
          <span>{copiedAccount === acc.accountNumber ? 'Đã sao chép' : 'Sao chép số tài khoản'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <section id="mung-cuoi" className="w-full py-10 sm:py-16 px-4 sm:px-6">
      {/* 1. Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="font-greatvibes text-4xl sm:text-6xl text-[#A80606] dark:text-rose-400 tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto px-4">
            {subtitle}
          </p>
        )}
        <div className="w-16 h-0.5 bg-[#A80606]/30 mx-auto mt-2" />
      </div>

      {/* 2. QR Cards Grid */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {groomAccount && renderAccountCard(groomAccount, 'Mừng Cưới Chú Rể')}
        {brideAccount && renderAccountCard(brideAccount, 'Mừng Cưới Cô Dâu')}
      </div>
    </section>
  );
}
