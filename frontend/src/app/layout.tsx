import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'loiyeuthuong.vn - Lời Yêu Thương | Nền tảng tạo thiệp cưới điện tử tinh tế',
  description: 'loiyeuthuong.vn: Tạo thiệp cưới và thiệp mời online tinh tế, chuẩn di động, tích hợp quản lý RSVP, bản đồ chỉ đường và mừng cưới QR tự động.',
};

/**
 * RootLayout Component
 * Purpose: Cung cấp layout gốc toàn hệ thống, nạp Google Fonts và Google Material Symbols Icons.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Google Fonts Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Plus Jakarta Sans & Inter Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Google Material Symbols Outlined Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body-md bg-surface text-on-surface selection:bg-primary selection:text-white min-h-screen">
        {/* Main Application Content */}
        {children}
      </body>
    </html>
  );
}
