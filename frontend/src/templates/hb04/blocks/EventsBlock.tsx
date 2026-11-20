'use client';

import React, { useState } from 'react';
import { EventsBlockProps } from '@/types/schema';
import { ScrollReveal } from '@/components/common/ScrollReveal';

/**
 * EventsBlock Component
 * Purpose: Hiển thị lịch trình Sự Kiện Cưới chuẩn 1:1 mẫu meHappy HB04 (#145):
 *   - Tiêu đề "Sự Kiện Cưới" dùng font GreatVibes 45px màu đen than (#333333).
 *   - Nút chuyển đổi dạng viên thuốc ghép đôi (Split-Pill 240x40px, viền #5F6459): NHÀ TRAI | NHÀ GÁI.
 *   - Khung thẻ sự kiện dọc (357px, viền #ADADAD, bo góc 10px) đặt trên nền giấy mỹ thuật màu kem, có hoa văn, ảnh 319x300px bo góc 10px, vạch kẻ ngang + icon đồng hồ/ngôi nhà và nút đỏ "CHỈ ĐƯỜNG" kèm icon máy bay giấy.
 * Props: EventsBlockProps
 * Key States:
 *   - activeTab: Tab đang chọn ('GROOM' | 'BRIDE').
 *   - lightboxSrc: Đường dẫn ảnh đang phóng to.
 */
export default function EventsBlock({
  title = 'Sự Kiện Cưới',
  groomEvents = [],
  brideEvents = [],
}: EventsBlockProps) {
  const [activeTab, setActiveTab] = useState<'GROOM' | 'BRIDE'>('GROOM');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const currentEvents = activeTab === 'GROOM' ? groomEvents : brideEvents;

  return (
    <section id="su-kien-cuoi" className="w-full bg-white text-[#333333]">
      {/* 1. Header & Joined Split-Pill Toggle (Section 3: 169px height) */}
      <div className="w-full pt-[7px] pb-[28px] bg-white text-center">
        <h2 className="font-greatvibes text-[45px] leading-[1.3] text-[#333333] font-normal">
          {title}
        </h2>

        <ScrollReveal
          effect="fadeInUp"
          duration={1}
          className="mt-[26px] inline-flex items-center justify-center"
        >
          <button
            type="button"
            onClick={() => setActiveTab('GROOM')}
            className={`w-[120px] h-[40px] rounded-l-[20px] border border-[#5F6459] font-sourcesans text-[16px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'GROOM'
                ? 'bg-[#A80606] text-white'
                : 'bg-white text-[#333333] hover:bg-neutral-50'
            }`}
          >
            NHÀ TRAI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BRIDE')}
            className={`w-[120px] h-[40px] -ml-[1px] rounded-r-[20px] border border-[#5F6459] font-sourcesans text-[16px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'BRIDE'
                ? 'bg-[#A80606] text-white'
                : 'bg-white text-[#333333] hover:bg-neutral-50'
            }`}
          >
            NHÀ GÁI
          </button>
        </ScrollReveal>
      </div>

      {/* 2. Event Cards Container on Watercolor Beige Paper Background (Sections 4 & 5) */}
      <div
        style={{
          backgroundImage:
            "url('/templates/hb04/ladi/beige-minimalist-wedding-invitation-1-20250329070348-pqcdz.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
        className="w-full py-[21px] px-[21px] flex flex-col items-center gap-[19px]"
      >
        {currentEvents.map((event, index) => {
          const mapHref =
            event.mapUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${event.locationName} ${event.address}`
            )}`;
          const photoUrl =
            event.illustrationUrl ||
            '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp';

          return (
            <ScrollReveal
              key={`${activeTab}-${index}`}
              effect="bounceInUp"
              duration={1}
              className="w-full max-w-[357px] rounded-[10px] border border-[#ADADAD] pt-[13px] pb-[21px] px-[14px] flex flex-col items-center"
            >
              {/* Uppercase Bold Title */}
              <h3 className="font-sourcesans text-[20px] font-bold uppercase text-[#333333] text-center tracking-normal">
                {event.title}
              </h3>

              {/* Floral Ornament */}
              <img
                src="/templates/hb04/ladi/flower50664b3379a36e68-1-20250512084629-7_96h.png"
                alt=""
                onClick={() =>
                  setLightboxSrc(
                    '/templates/hb04/ladi/flower50664b3379a36e68-1-20250512084629-7_96h.png'
                  )
                }
                className="w-[73px] h-[34px] object-contain mt-[5px] mb-[17px] cursor-pointer"
              />

              {/* Event Photo (319x300px, rounded-10px) */}
              <div
                onClick={() => setLightboxSrc(photoUrl)}
                className="relative w-full max-w-[319px] h-[300px] rounded-[10px] overflow-hidden cursor-pointer bg-neutral-100"
              >
                <img
                  src={photoUrl}
                  alt={event.title}
                  style={{
                    width: '100%',
                    height: '159.57%',
                    left: '0%',
                    top: index % 2 === 0 ? '-14.1%' : '-4.87%',
                  }}
                  className="absolute max-w-none object-cover"
                />
              </div>

              {/* First Horizontal Line + Clock & Date/Time */}
              <div className="w-full border-t border-[#ADADAD] mt-[5px] pt-[14px] pb-[12px] px-[12px] flex items-center gap-[10px] text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#646262"
                  className="w-[35px] h-[35px] shrink-0"
                >
                  <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                </svg>
                <div className="font-sourcesans text-[16px] leading-[1.4] text-[#333333]">
                  <p>{event.timeText}</p>
                  <p>{event.dateText}</p>
                </div>
              </div>

              {/* Second Horizontal Line + House & Venue Address */}
              <div className="w-full border-t border-[#ADADAD] pt-[16px] pb-[22px] px-[12px] flex items-start gap-[12px] text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#646262"
                  className="w-[35px] h-[35px] shrink-0 mt-0.5"
                >
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                </svg>
                <div className="font-sourcesans text-[16px] leading-[1.42] text-[#333333]">
                  <p>Tại: {event.locationName}</p>
                  <p className="whitespace-pre-line">{event.address}</p>
                </div>
              </div>

              {/* Red CHỈ ĐƯỜNG Button with Paper-Plane Icon */}
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[145px] h-[38px] rounded-[5px] bg-[#A80606] hover:bg-[#8f0505] text-white font-sourcesans text-[14px] font-bold flex items-center justify-center gap-[7px] transition-colors no-underline shadow-sm"
              >
                <svg width="15" height="18" viewBox="0 0 1408 1896.0833" fill="#FFFFFF">
                  <path d="M1401 349L761 1629q-17 35-57 35-5 0-15-2-22-5-35.5-22.5T640 1600v-576H64q-22 0-39.5-13.5T2 975t4-42 29-30l1280-640q13-7 29-7 27 0 45 19 15 14 18.5 34.5T1401 349z" />
                </svg>
                <span>CHỈ ĐƯỜNG</span>
              </a>
            </ScrollReveal>
          );
        })}
      </div>

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
    </section>
  );
}
