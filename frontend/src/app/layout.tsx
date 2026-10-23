import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hệ Thống Thiệp Mời Cưới Trực Tuyến',
  description: 'Nền tảng tạo và chia sẻ thiệp cưới hiện đại, tinh tế',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-neutral-50">
        {/* Main Application Body */}
        {children}
      </body>
    </html>
  );
}
