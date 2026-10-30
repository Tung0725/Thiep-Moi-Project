'use client';

import React from 'react';
import BrandLogo from '@/components/common/BrandLogo';

/**
 * FooterSection Component
 * Purpose: Chân trang hệ thống theo bố cục 4 cột tinh tế meHappy với thông tin sản phẩm, hỗ trợ và bản quyền.
 * Props: Không yêu cầu props.
 * Key States: Không có state cục bộ (stateless presentation component).
 */
export default function FooterSection() {
  return (
    <footer className="w-full bg-[#fcf9f9] dark:bg-[#0b0d13] border-t border-[#eeeeee] dark:border-[#242838] pt-14 pb-10 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <BrandLogo size="md" showTagline={true} />
            <p className="text-[13px] text-[#555555] dark:text-slate-400 leading-relaxed max-w-sm mt-1">
              Nền tảng tạo thiệp cưới điện tử và thiệp mời online tinh tế số 1 Việt Nam. Đồng hành cùng hàng triệu cặp đôi gửi trao lời yêu thương trọn vẹn trong ngày hạnh phúc.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#181a26] border border-[#eeeeee] dark:border-[#2d3142] text-mh-primary flex items-center justify-center shadow-sm hover:border-mh-primary transition"
                aria-label="Facebook"
              >
                <span className="material-symbols-outlined text-[16px]">favorite</span>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#181a26] border border-[#eeeeee] dark:border-[#2d3142] text-mh-primary flex items-center justify-center shadow-sm hover:border-mh-primary transition"
                aria-label="Zalo"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </a>
              <a
                href="mailto:support@loiyeuthuong.vn"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#181a26] border border-[#eeeeee] dark:border-[#2d3142] text-mh-primary flex items-center justify-center shadow-sm hover:border-mh-primary transition"
                aria-label="Email"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
              </a>
            </div>
          </div>

          {/* Invitation Categories */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <h3 className="text-[13px] font-bold text-[#2d2d2d] dark:text-white uppercase tracking-wider">
              Danh mục thiệp
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-[#555555] dark:text-slate-400">
              <li>
                <a href="#kho-thiep" className="hover:text-mh-primary transition-colors">
                  Thiệp cưới sang trọng
                </a>
              </li>
              <li>
                <a href="#kho-thiep" className="hover:text-mh-primary transition-colors">
                  Thiệp sinh nhật &amp; Thôi nôi
                </a>
              </li>
              <li>
                <a href="#kho-thiep" className="hover:text-mh-primary transition-colors">
                  Thiệp tân gia ấm cúng
                </a>
              </li>
              <li>
                <a href="#kho-thiep" className="hover:text-mh-primary transition-colors">
                  Thiệp mời sự kiện &amp; Khai trương
                </a>
              </li>
            </ul>
          </div>

          {/* Core Features */}
          <div className="lg:col-span-2 flex flex-col gap-2.5">
            <h3 className="text-[13px] font-bold text-[#2d2d2d] dark:text-white uppercase tracking-wider">
              Tiện ích
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-[#555555] dark:text-slate-400">
              <li>
                <a href="#tien-ich" className="hover:text-mh-primary transition-colors">
                  Xác nhận RSVP online
                </a>
              </li>
              <li>
                <a href="#tien-ich" className="hover:text-mh-primary transition-colors">
                  Mừng cưới qua mã QR
                </a>
              </li>
              <li>
                <a href="#tien-ich" className="hover:text-mh-primary transition-colors">
                  Bản đồ Google Maps
                </a>
              </li>
              <li>
                <a href="#tien-ich" className="hover:text-mh-primary transition-colors">
                  Nhạc nền &amp; Hiệu ứng
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <h3 className="text-[13px] font-bold text-[#2d2d2d] dark:text-white uppercase tracking-wider">
              Hỗ trợ khách hàng
            </h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#555555] dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-mh-primary">support_agent</span>
                <span>Hotline: 1900 8888</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-mh-primary">chat</span>
                <span>Zalo hỗ trợ: 0988 888 xxx</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-mh-primary">alternate_email</span>
                <span>Email: support@loiyeuthuong.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 border-t border-[#eeeeee] dark:border-[#242838] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#999999] dark:text-slate-500">
          <p>© 2026 loiyeuthuong.vn. Nền tảng tạo thiệp cưới điện tử số 1 Việt Nam.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-mh-primary transition-colors">
              Điều khoản sử dụng
            </a>
            <span>•</span>
            <a href="#" className="hover:text-mh-primary transition-colors">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
