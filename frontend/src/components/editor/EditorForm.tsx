import React from 'react';
import { ThemeEditor } from './ThemeEditor';
import { BlockEditorList } from './BlockEditorList';

/**
 * EditorForm Component
 * Purpose: Khung panel bên trái của màn hình Editor chứa tabs nội dung và giao diện
 * Props:
 *   - invitationId: Mã định danh thiệp đang chỉnh sửa
 * Key States: activeTab ('BLOCKS' | 'THEME')
 */
interface EditorFormProps {
  invitationId: string;
}

export function EditorForm({ invitationId }: EditorFormProps) {
  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-neutral-200">
      {/* Editor Action Header */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-800">Biên Tập Thiệp #{invitationId}</h2>
      </div>

      {/* Editor Form Content Area */}
      <div className="flex-1 overflow-y-auto">
        <BlockEditorList />
        <ThemeEditor />
      </div>
    </aside>
  );
}
