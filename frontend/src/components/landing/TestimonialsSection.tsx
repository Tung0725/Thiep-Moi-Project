'use client';

import React from 'react';

interface TestimonialItem {
  names: string;
  location: string;
  quote: string;
  avatarUrl: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    names: 'Minh Trí & Thảo Vy',
    location: 'Lễ cưới tại White Palace, TP.HCM',
    quote:
      '"Khách mời ai cũng khen vì thiệp mở phong bì quá đẹp và hiện đại! Bạn bè ở xa hay nước ngoài đều mừng cưới qua mã VietQR cực nhanh. Tiết kiệm cho tụi mình gần 6 triệu tiền in ấn thiệp giấy!"',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    names: 'Đình Văn & Thuỳ Hoài',
    location: 'Lễ cưới tại JW Marriott Hà Nội',
    quote:
      '"Tính năng RSVP tự động giúp hai vợ chồng mình chốt danh sách bàn tiệc cực kỳ chuẩn xác, không bị dư thừa bàn nào. Bản đồ dẫn đường Google Maps 1 chạm rất tiện lợi cho khách lớn tuổi."',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    names: 'Elena & Hoàng Nam',
    location: 'Lễ cưới bãi biển tại Đà Nẵng',
    quote:
      '"Mình dùng mẫu song ngữ Việt - Anh vì chú rể là người nước ngoài. Bạn bè quốc tế rất ấn tượng vì giao diện chuyển đổi mượt mà và bài hát nền ballad lãng mạn. Rất đáng giá!"',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
];

/**
 * TestimonialsSection Component
 * Purpose: Hiển thị nhận xét, đánh giá thực tế từ các cặp đôi đã trải nghiệm thiệp cưới điện tử.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function TestimonialsSection() {
  return (
    <section className="w-full py-14 md:py-20 bg-[#fafafa] dark:bg-[#0f1117] border-b border-[#eeeeee] dark:border-[#242838]" id="cau-chuyen">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
            Cảm nhận từ <span className="text-mh-primary">các cặp đôi</span>
          </h2>
          <p className="text-[14px] md:text-base text-[#555555] dark:text-slate-400 max-w-xl">
            Cùng lắng nghe những chia sẻ hạnh phúc từ hơn 65.000 cô dâu chú rể đã tin tưởng gửi gắm ngày trọng đại.
          </p>
        </div>

        {/* Testimonials 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((story, index) => (
            <div
              key={index}
              className="p-6 md:p-7 rounded-2xl bg-white dark:bg-[#161824] border border-[#eeeeee] dark:border-[#2d3142] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[17px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                {/* Quote Text */}
                <p className="text-[13px] md:text-[14px] text-[#2d2d2d] dark:text-slate-200 italic leading-relaxed">
                  {story.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-mh-border dark:ring-neutral-700"
                  alt={story.names}
                  src={story.avatarUrl}
                />
                <div>
                  <h3 className="text-[14px] font-bold text-[#2d2d2d] dark:text-white">
                    {story.names}
                  </h3>
                  <span className="text-[11px] text-[#71717a] dark:text-slate-400 block">
                    {story.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
