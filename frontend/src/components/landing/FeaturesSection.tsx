'use client';

import React from 'react';

interface FeatureItem {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: 'timer',
    iconBg: 'bg-[#fff0f3] text-mh-primary dark:bg-rose-950/40 dark:text-rose-300',
    title: 'Tạo thiệp nhanh trong 3 phút',
    description:
      'Giao diện kéo thả trực quan và dễ thao tác ngay trên điện thoại. Tự do thay ảnh, đổi tên và thông điệp mà không cần kiến thức thiết kế đồ họa.',
  },
  {
    icon: 'qr_code_2',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    title: 'Mừng cưới qua mã QR tiện lợi',
    description:
      'Tích hợp mã VietQR tự động điền sẵn số tài khoản ngân hàng và nội dung chúc phúc, giúp khách mời ở xa gửi trao tình cảm thuận tiện và tinh tế.',
  },
  {
    icon: 'how_to_reg',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    title: 'Xác nhận tham dự RSVP tự động',
    description:
      'Khách mời gửi lời chúc và xác nhận số người tham dự. Mọi dữ liệu được cập nhật tự động vào bảng danh sách giúp bạn dự trù bàn tiệc chính xác.',
  },
  {
    icon: 'location_on',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    title: 'Bản đồ dẫn đường & Thêm vào Lịch',
    description:
      'Khách dễ dàng bấm mở chỉ đường qua Google Maps và lưu thời gian lễ cưới vào lịch điện thoại để không bao giờ bỏ lỡ khoảnh khắc trọng đại.',
  },
  {
    icon: 'music_note',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
    title: 'Nhạc nền & Hiệu ứng lãng mạn',
    description:
      'Tùy chọn những giai điệu tình ca du dương tự động phát khi mở thiệp, kèm theo các hiệu ứng cánh hoa bay và mở phong bì sáp nghệ thuật.',
  },
  {
    icon: 'share',
    iconBg: 'bg-rose-50 text-[#ff2056] dark:bg-rose-950/40 dark:text-rose-300',
    title: 'Gửi thiệp cá nhân hoá một chạm',
    description:
      'Gắn lời xưng hô riêng biệt cho từng người thân, bạn bè. Chia sẻ thiệp mời lập tức qua Zalo, Facebook Messenger và SMS chỉ với một liên kết.',
  },
];

/**
 * FeaturesSection Component
 * Purpose: Giới thiệu 6 tính năng đột phá của thiệp điện tử với icon pastel mềm mại, chuẩn tỷ lệ meHappy.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function FeaturesSection() {
  return (
    <section className="w-full py-14 md:py-20 bg-[#fafafa] dark:bg-[#0f1117] border-b border-[#eeeeee] dark:border-[#242838]" id="tien-ich">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2d2d2d] dark:text-white tracking-tight">
            Những điểm nổi bật của <span className="text-mh-primary">loiyeuthuong</span>
          </h2>
          <p className="text-[14px] md:text-base text-[#555555] dark:text-slate-400 max-w-xl">
            Mọi thứ bạn cần để tạo một chiếc thiệp mời điện tử hoàn hảo, tiết kiệm 90% chi phí in ấn và đem lại trải nghiệm trọn vẹn cho khách mời.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="p-6 md:p-7 rounded-2xl bg-white dark:bg-[#161824] border border-[#eeeeee] dark:border-[#2d3142] shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <span className="material-symbols-outlined text-[24px]">{feature.icon}</span>
              </div>
              <h3 className="text-[16px] md:text-[17px] font-bold text-[#2d2d2d] dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-[13px] md:text-[14px] text-[#555555] dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
