'use client';

import React, { useState } from 'react';
import { CoupleBlockProps } from '@/types/schema';
import { ScrollReveal } from '@/components/common/ScrollReveal';

/**
 * CoupleBlock Component
 * Purpose: Hiển thị 2 phân đoạn cốt lõi chuẩn 1:1 mẫu meHappy HB04 (#145):
 *   1. Phân đoạn "Save The Date" + Thông tin Song thân Phụ mẫu Nhà Trai & Nhà Gái (trên nền trắng tinh khôi, không đóng khung thẻ, ngăn cách bằng hoa văn dây tim đỏ).
 *   2. Phân đoạn "Chú Rể & Cô Dâu" bố cục tạp chí xếp dọc (Stacked Editorial): Ảnh lớn 380x402px -> Tên GreatVibes 31px + Hoa văn #CD6363 + Tâm thư tình yêu căn trái (Chú rể) và căn phải (Cô dâu).
 * Props: CoupleBlockProps
 * Key States:
 *   - lightboxSrc: Đường dẫn ảnh đang phóng to trong Lightbox.
 */
export default function CoupleBlock({
  groom,
  bride,
  quote = 'Hôn nhân không phải là nơi thuyền tình cập bến,mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.',
  sectionTitle = 'Chú Rể & Cô Dâu',
  weddingDateText = 'Ngày 25 Tháng 12 Năm 2026',
}: CoupleBlockProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const groomPhoto =
    groom.photoUrl || '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp';
  const bridePhoto =
    bride.photoUrl || '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp';

  const groomShortName = groom.displayName || groom.name.split(' ').slice(-2).join(' ');
  const brideShortName = bride.displayName || bride.name.split(' ').slice(-2).join(' ');

  return (
    <div id="save-the-date" className="w-full bg-white text-[#333333]">
      {/* ====================================================================
       * 1. Save The Date & Nhà Trai / Nhà Gái (Section 1: height ~713px)
       * ==================================================================== */}
      <section className="w-full pt-[23px] pb-[44px] px-4 text-center">
        <ScrollReveal effect="fadeInDown" duration={0.5}>
          <h2 className="font-greatvibes text-[50px] leading-[1.2] text-[#333333] font-normal">
            Save The Date
          </h2>
        </ScrollReveal>

        <ScrollReveal effect="fadeInUp" duration={0.6} className="mt-[4px]">
          <p className="font-sourcesans text-[16px] leading-[1.4] text-[#333333]">
            For The Wedding Of
          </p>
        </ScrollReveal>

        <ScrollReveal effect="fadeInUp" duration={0.8} className="mt-[4px]">
          <p className="font-sourcesans text-[20px] leading-[1.4] text-[#333333]">
            {weddingDateText}
          </p>
        </ScrollReveal>

        {/* Nhà Trai */}
        <div className="mt-[42px]">
          <ScrollReveal effect="bounceInDown" duration={0.9}>
            <h3 className="font-hoatay text-[36px] font-bold leading-[1.3] text-[#333333]">
              Nhà Trai
            </h3>
          </ScrollReveal>

          <ScrollReveal
            effect="bounceInUp"
            duration={1}
            className="mt-[8px] max-w-[245px] mx-auto font-sourcesans text-[16px] leading-[1.55] text-[#333333]"
          >
            <p>Chú Rể: {groom.name}</p>
            {groom.fatherName && <p>Ông: {groom.fatherName}</p>}
            {groom.motherName && <p>Bà: {groom.motherName}</p>}
            {groom.address && <p>Địa Chỉ: {groom.address}</p>}
          </ScrollReveal>
        </div>

        {/* Red Floral Heart Divider */}
        <ScrollReveal effect="bounce" duration={1} className="my-[38px] flex justify-center">
          <img
            src="/templates/hb04/ladi/thiet-ke-chua-co-ten-20250512080526-dsvvq.png"
            alt="Hoa văn trái tim"
            onClick={() =>
              setLightboxSrc('/templates/hb04/ladi/thiet-ke-chua-co-ten-20250512080526-dsvvq.png')
            }
            className="w-[160px] h-[34px] object-contain cursor-pointer"
          />
        </ScrollReveal>

        {/* Nhà Gái */}
        <div>
          <ScrollReveal effect="bounceInDown" duration={0.9}>
            <h3 className="font-hoatay text-[35px] font-bold leading-[1.3] text-[#333333]">
              Nhà Gái
            </h3>
          </ScrollReveal>

          <ScrollReveal
            effect="bounceInUp"
            duration={1}
            className="mt-[8px] max-w-[255px] mx-auto font-sourcesans text-[16px] leading-[1.55] text-[#333333]"
          >
            <p>Cô Dâu: {bride.name}</p>
            {bride.fatherName && <p>Ông: {bride.fatherName}</p>}
            {bride.motherName && <p>Bà: {bride.motherName}</p>}
            {bride.address && <p>Địa Chỉ: {bride.address}</p>}
          </ScrollReveal>
        </div>
      </section>

      {/* ====================================================================
       * 2. Chú Rể & Cô Dâu Stacked Editorial Layout (Section 2)
       * ==================================================================== */}
      <section className="w-full pt-[16px] pb-[36px] px-[10px]">
        {/* Section Title & Quote */}
        <div className="text-center px-[17px] mb-[24px]">
          <ScrollReveal effect="bounceInDown" duration={0.6}>
            <h3 className="font-greatvibes text-[40px] leading-[1.25] text-[#333333] font-normal">
              {sectionTitle}
            </h3>
          </ScrollReveal>

          <ScrollReveal effect="bounceInUp" duration={0.8} className="mt-[10px]">
            <p className="font-sourcesans text-[16px] leading-[1.45] text-[#333333] max-w-[345px] mx-auto">
              {quote}
            </p>
          </ScrollReveal>
        </div>

        {/* Groom Block: 380x402px Photo + Left-Aligned Signature & Story */}
        <div className="w-full">
          <ScrollReveal effect="fadeInLeft" duration={0.6}>
            <div
              onClick={() => setLightboxSrc(groomPhoto)}
              className="relative w-full h-[402px] overflow-hidden cursor-pointer bg-neutral-100"
            >
              <img
                src={groomPhoto}
                alt={groom.name}
                style={{
                  width: '100%',
                  height: '141.94%',
                  left: '0%',
                  top: '0%',
                }}
                className="absolute max-w-none object-cover"
              />
            </div>
          </ScrollReveal>

          <div className="relative flex items-center pt-[8px] px-[9px]">
            <ScrollReveal effect="bounceInLeft" duration={0.7} className="w-[177px]">
              <span className="font-greatvibes text-[31px] leading-[1.3] text-[#333333]">
                {groomShortName}
              </span>
            </ScrollReveal>
            <img
              src="/templates/hb04/ladi/couple-flourish.svg"
              alt=""
              className="w-[50px] h-[50px] ml-[17px] shrink-0"
            />
          </div>

          {groom.storyQuote && (
            <ScrollReveal effect="fadeInLeft" duration={0.9} className="px-[9px] mt-[4px]">
              <p className="font-sourcesans text-[16px] leading-[1.45] text-[#333333] text-left whitespace-pre-line">
                {groom.storyQuote}
              </p>
            </ScrollReveal>
          )}
        </div>

        {/* Bride Block: 380x402px Photo + Right-Aligned Signature & Story */}
        <div className="w-full mt-[34px]">
          <ScrollReveal effect="fadeInRight" duration={0.8}>
            <div
              onClick={() => setLightboxSrc(bridePhoto)}
              className="relative w-full h-[402px] overflow-hidden cursor-pointer bg-neutral-100"
            >
              <img
                src={bridePhoto}
                alt={bride.name}
                style={{
                  width: '100%',
                  height: '141.94%',
                  left: '0%',
                  top: '-17.34%',
                }}
                className="absolute max-w-none object-cover"
              />
            </div>
          </ScrollReveal>

          <div className="relative flex items-center justify-end pt-[8px] px-[10px]">
            <img
              src="/templates/hb04/ladi/couple-flourish.svg"
              alt=""
              className="w-[50px] h-[50px] mr-[26px] shrink-0"
            />
            <ScrollReveal effect="fadeInRight" duration={0.9} className="w-[177px] text-right">
              <span className="font-greatvibes text-[31px] leading-[1.3] text-[#333333]">
                {brideShortName}
              </span>
            </ScrollReveal>
          </div>

          {bride.storyQuote && (
            <ScrollReveal effect="fadeInRight" duration={1} className="px-[6px] mt-[4px]">
              <p className="font-sourcesans text-[16px] leading-[1.45] text-[#333333] text-right whitespace-pre-line">
                {bride.storyQuote}
              </p>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxSrc}
            alt="Ảnh phóng to"
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
