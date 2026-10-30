'use client';

import React from 'react';

interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
}

const STEPS: StepItem[] = [
  {
    step: 'Bước 1',
    title: 'Chọn mẫu yêu thích',
    description: 'Duyệt bộ sưu tập hàng trăm mẫu thiệp được thiết kế tỉ mỉ, phù hợp cho tiệc cưới, sinh nhật và mọi sự kiện ý nghĩa.',
    icon: 'palette',
    iconBg: 'bg-[#fff0f3] text-mh-primary dark:bg-rose-950/40 dark:text-rose-300',
  },
  {
    step: 'Bước 2',
    title: 'Điền thông tin & tải ảnh',
    description: 'Thay đổi tên cô dâu chú rể, tải ảnh cưới lung linh, cập nhật địa điểm tiệc và tùy chỉnh nhạc nền lãng mạn chỉ trong vài phút.',
    icon: 'edit_note',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
  },
  {
    step: 'Bước 3',
    title: 'Chia sẻ thiệp & Nhận RSVP',
    description: 'Gửi thiệp tức thì qua Zalo, Messenger, SMS bằng một đường link duy nhất. Khách mở xem mượt mà, không cần tải ứng dụng.',
    icon: 'send',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
];

/**
 * HowItWorksSection Component
 * Purpose: Giới thiệu quy trình 3 bước tạo thiệp đơn giản, trực quan lấy cảm hứng từ meHappy.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function HowItWorksSection() {
  return (
    <section className="w-full py-14 md:py-20 bg-white dark:bg-[#0b0d13] border-b border-[#eeeeee] dark:border-[#242838]" id="quy-trinh">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
            Tạo thiệp với <span className="text-mh-primary">3 bước đơn giản</span>
          </h2>
          <p className="text-[14px] md:text-base text-[#555555] dark:text-slate-400 max-w-xl">
            Nhanh chóng và dễ dàng, không cần kỹ năng đồ họa phức tạp — bất kỳ ai cũng có thể tự tạo tấm thiệp ưng ý.
          </p>
        </div>

        {/* 3 Steps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((item, index) => (
            <div
              key={index}
              className="relative p-7 rounded-2xl bg-[#fafafa] dark:bg-[#161824] border border-[#eeeeee] dark:border-[#2d3142] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              {/* Step Counter Badge */}
              <span className="rounded-full bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary text-xs font-bold px-3 py-1 mb-4">
                {item.step}
              </span>

              {/* Step Icon */}
              <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
              </div>

              {/* Step Title */}
              <h3 className="text-[17px] font-bold text-[#2d2d2d] dark:text-white mb-2">
                {item.title}
              </h3>

              {/* Step Description */}
              <p className="text-[13px] md:text-[14px] text-[#555555] dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
