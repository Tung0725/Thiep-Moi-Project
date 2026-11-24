import type { Metadata } from 'next';
import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống | loiyeuthuong.vn',
  description: 'Bảng điều khiển quản trị tập trung người dùng, mẫu thiệp, thiệp mời và lời chúc RSVP.',
};

/**
 * AdminLayout Component
 * Purpose: Nested layout cho toàn bộ nhánh /admin/**, kết hợp bảo vệ quyền ROLE_ADMIN (AdminGuard) và khung điều hướng (AdminShell).
 * Props:
 *  - children: Trang con thuộc phân hệ quản trị.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      {/* Shared Admin Workspace Frame */}
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
