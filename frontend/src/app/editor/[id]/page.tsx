import React from 'react';
import { EditorForm } from '@/components/editor/EditorForm';
import { PhoneFrame } from '@/components/preview/PhoneFrame';

/**
 * EditorPage Component
 * Purpose: Màn hình biên tập hai cột (Cột trái: Form nhập liệu & theme, Cột phải: Live Preview trên khung điện thoại)
 */
interface EditorPageProps {
  params: {
    id: string;
  };
}

export default function EditorPage({ params }: EditorPageProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-neutral-100">
      {/* Left Column: Form Controls */}
      <section className="w-full md:w-[450px] h-full shrink-0">
        <EditorForm invitationId={params.id} />
      </section>

      {/* Right Column: Phone Canvas Live Preview */}
      <section className="flex-1 h-full flex items-center justify-center p-6 overflow-auto">
        <PhoneFrame>
          <div className="p-4 text-center text-xs text-neutral-400">
            Khung hiển thị thiệp mời trực tiếp
          </div>
        </PhoneFrame>
      </section>
    </div>
  );
}
