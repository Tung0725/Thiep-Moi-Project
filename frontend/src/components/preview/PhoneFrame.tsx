import React, { ReactNode } from 'react';

/**
 * PhoneFrame Component
 * Purpose: Khung giả lập điện thoại di động (Phone Mockup) cho màn hình Live Preview
 * Props:
 *   - children: Nội dung hiển thị bên trong màn hình điện thoại
 * Key States: Không có (stateless layout shell)
 */
interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[750px] bg-neutral-900 rounded-[48px] p-3 shadow-2xl flex flex-col">
      {/* Device Notch Header */}
      <div className="w-32 h-5 bg-neutral-900 rounded-b-xl mx-auto z-20 shrink-0" />

      {/* Screen Viewport Container */}
      <div className="w-full flex-1 bg-white rounded-[36px] overflow-y-auto relative">
        {children}
      </div>

      {/* Bottom Bar */}
      <div className="w-28 h-1 bg-neutral-700 rounded-full mx-auto mt-2 shrink-0" />
    </div>
  );
}
