import React from 'react';
import type { Metadata } from 'next';

/**
 * PublicInvitationPage Component
 * Purpose: Trang hiển thị thiệp mời công khai cho khách mời truy cập qua slug rút gọn (/t/[slug])
 */
interface PublicInvitationPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicInvitationPageProps): Promise<Metadata> {
  return {
    title: `Thiệp Mời Cưới | ${params.slug}`,
    description: 'Trân trọng kính mời quý khách tới tham dự lễ thành hôn',
  };
}

export default function PublicInvitationPage({ params }: PublicInvitationPageProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Public View Container Skeleton */}
      <div className="w-full max-w-md mx-auto text-center py-12">
        <h1 className="text-xl font-bold text-neutral-800">Thiệp Mời #{params.slug}</h1>
        <p className="text-xs text-neutral-500 mt-2">Nội dung thiệp công khai sẽ được render động tại đây</p>
      </div>
    </div>
  );
}
