'use client';

import React, { useState } from 'react';
import { GiftBoxBlockProps, BankAccountInfo } from '@/types/schema';
import { ScrollReveal } from '@/components/common/ScrollReveal';

/**
 * GiftBoxBlock Component
 * Purpose: Hiển thị Hộp Mừng Cưới nền đỏ đô (#A80606) với bố cục bàn cờ 2x2 (Checkerboard 190x220px) chuẩn 1:1 mẫu meHappy HB04 (#145):
 *   - Hàng 1: Ảnh chân dung Chú Rể (trái) | Thẻ QR trắng MỪNG CƯỚI CHÚ RỂ kèm 2 nút xám "Tải ảnh QR" & "Copy STK" (phải).
 *   - Hàng 2: Thẻ QR trắng MỪNG CƯỚI CÔ DÂU (trái) | Ảnh chân dung Cô Dâu (phải).
 * Props: GiftBoxBlockProps
 * Key States:
 *   - toastText: Thông báo sao chép STK hoặc tải mã QR thành công.
 *   - lightboxSrc: Đường dẫn ảnh hoặc mã QR đang phóng to.
 */
export default function GiftBoxBlock({
  title = 'Hộp Mừng Cưới',
  groomAccount,
  brideAccount,
  groomPhotoUrl = '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp',
  bridePhotoUrl = '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp',
}: GiftBoxBlockProps) {
  const [toastText, setToastText] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2400);
  };

  const handleCopyAccount = (accountNumber: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
    }
    showToast(`Đã sao chép STK: ${accountNumber}`);
  };

  const handleDownloadQr = (qrUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đang tải ảnh mã QR...');
  };

  const renderQrCard = (acc: BankAccountInfo | undefined, defaultLabel: string, fileSlug: string) => {
    const qrSrc =
      acc?.qrCodeUrl || '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp';
    const stk = acc?.accountNumber || '0988123456';
    const heading = (acc?.label || defaultLabel).toUpperCase();

    return (
      <div className="w-full h-[220px] rounded-[6px] bg-white pt-[8px] pb-[9px] px-[8px] flex flex-col items-center justify-between text-[#333333]">
        <p className="font-sourcesans text-[15px] leading-[1.3] text-[#333333] text-center">
          {heading}
        </p>

        {/* QR Code Image (145x140px) */}
        <img
          src={qrSrc}
          alt={heading}
          data-photo-slot={fileSlug === 'qr-chu-re' ? 'qr-groom' : 'qr-bride'}
          onClick={() => setLightboxSrc(qrSrc)}
          className="w-[145px] h-[140px] rounded-[6px] border border-[#D6D6D6] object-cover cursor-pointer"
          loading="lazy"
        />

        {/* Dual Action Buttons: Tải ảnh QR & Copy STK */}
        <div className="w-full flex items-center justify-between gap-[6px]">
          <button
            type="button"
            onClick={() => handleDownloadQr(qrSrc, `${fileSlug}.webp`)}
            className="flex-1 h-[24px] rounded-[6px] border border-[#D6D6D6] bg-[#DBDBDB] hover:bg-[#cfcfcf] font-quicksand text-[12px] text-[#333333] flex items-center justify-center transition-colors cursor-pointer"
          >
            Tải ảnh QR
          </button>
          <button
            type="button"
            onClick={() => handleCopyAccount(stk)}
            className="flex-1 h-[24px] rounded-[6px] border border-[#D6D6D6] bg-[#DBDBDB] hover:bg-[#cfcfcf] font-quicksand text-[12px] text-[#333333] flex items-center justify-center transition-colors cursor-pointer"
          >
            Copy STK
          </button>
        </div>
      </div>
    );
  };

  return (
    <section
      id="mung-cuoi"
      className="relative w-full bg-[#A80606] pt-[26px] pb-[20px] px-[7px] text-white"
    >
      {/* 1. Section Heading */}
      <ScrollReveal effect="fadeInDown" duration={0.6} className="text-center mb-[26px]">
        <h2 className="font-greatvibes text-[45px] leading-[1.3] text-white font-normal">
          {title}
        </h2>
      </ScrollReveal>

      {/* 2. 2x2 Checkerboard Grid (190x220px cells) */}
      <div className="w-full grid grid-cols-2 gap-x-[5px] gap-y-[7px]">
        {/* Row 1 Left: Groom Portrait */}
        <ScrollReveal effect="bounceInLeft" duration={0.8}>
          <div
            onClick={() => setLightboxSrc(groomPhotoUrl)}
            className="relative w-full h-[220px] rounded-[6px] overflow-hidden cursor-pointer bg-neutral-200"
          >
            <img
              src={groomPhotoUrl}
              alt="Chú Rể"
              data-photo-slot="couple-groom"
              style={{
                width: '100%',
                height: '128.31%',
                left: '0%',
                top: '-1.36%',
              }}
              className="absolute max-w-none object-cover"
              loading="lazy"
            />
          </div>
        </ScrollReveal>

        {/* Row 1 Right: Groom QR Card */}
        <ScrollReveal effect="bounceInRight" duration={0.8}>
          {renderQrCard(groomAccount, 'MỪNG CƯỚI CHÚ RỂ', 'qr-chu-re')}
        </ScrollReveal>

        {/* Row 2 Left: Bride QR Card */}
        <ScrollReveal effect="bounceInLeft" duration={1}>
          {renderQrCard(brideAccount, 'MỪNG CƯỚI CÔ DÂU', 'qr-co-dau')}
        </ScrollReveal>

        {/* Row 2 Right: Bride Portrait */}
        <ScrollReveal effect="bounceInRight" duration={1}>
          <div
            onClick={() => setLightboxSrc(bridePhotoUrl)}
            className="relative w-full h-[220px] rounded-[6px] overflow-hidden cursor-pointer bg-neutral-200"
          >
            <img
              src={bridePhotoUrl}
              alt="Cô Dâu"
              data-photo-slot="couple-bride"
              style={{
                width: '100%',
                height: '128.31%',
                left: '0%',
                top: '-1.36%',
              }}
              className="absolute max-w-none object-cover"
              loading="lazy"
            />
          </div>
        </ScrollReveal>
      </div>

      {/* 3. Copy / Download Toast Banner */}
      {toastText && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900/95 text-white font-quicksand text-xs font-semibold shadow-lg">
          {toastText}
        </div>
      )}

      {/* 4. Lightbox Modal */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxSrc}
            alt="Xem phóng to"
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-md shadow-2xl bg-white p-1"
          />
        </div>
      )}
    </section>
  );
}
