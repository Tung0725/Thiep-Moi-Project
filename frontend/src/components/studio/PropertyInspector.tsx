'use client';

import React from 'react';
import { PageSchema, UIBlock } from '@/types/schema';

/**
 * PropertyInspector Component
 * Purpose: Bảng điều khiển thanh tra và chỉnh sửa thuộc tính của khối đang được chọn (Active Block).
 *   Hỗ trợ biểu mẫu động theo từng loại khối: HERO, COUPLE, COUNTDOWN, EVENTS, GALLERY, GIFTBOX, THANKYOU, WISHES.
 * Props:
 *   - schema: Cây PageSchema hiện tại
 *   - activeBlockId: ID khối đang chọn
 *   - onChange: Callback khi giá trị props của khối thay đổi
 * Key States:
 *   - Đồng bộ tức thì với state cha để phản hồi trực tiếp trên Canvas.
 */
interface PropertyInspectorProps {
  schema: PageSchema;
  activeBlockId: string | null;
  onChange: (updated: PageSchema) => void;
}

export default function PropertyInspector({
  schema,
  activeBlockId,
  onChange,
}: PropertyInspectorProps) {
  const activeBlock = schema.blocks.find((b) => b.id === activeBlockId);

  if (!activeBlock) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-neutral-400">
        <span className="material-symbols-outlined text-[36px] mb-2 opacity-50">touch_app</span>
        <p className="text-xs font-semibold">Chọn một khối ở cây cấu trúc bên trái để bắt đầu chỉnh sửa</p>
      </div>
    );
  }

  const updateProp = (field: string, value: unknown) => {
    const updatedBlocks = schema.blocks.map((b) => {
      if (b.id !== activeBlock.id) return b;
      return {
        ...b,
        props: {
          ...(b.props as Record<string, unknown>),
          [field]: value,
        },
      };
    });
    onChange({ ...schema, blocks: updatedBlocks as UIBlock[] });
  };

  const updateNestedProp = (parent: string, field: string, value: unknown) => {
    const currentParent = ((activeBlock.props as Record<string, unknown>)[parent] as Record<string, unknown>) || {};
    updateProp(parent, {
      ...currentParent,
      [field]: value,
    });
  };

  const props = (activeBlock.props as Record<string, unknown>) || {};

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-5 text-xs text-neutral-700 dark:text-neutral-200 no-scrollbar">
      {/* 1. Header with Block Info */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-[10px] font-bold text-mh-primary uppercase tracking-wider">
            Thuộc tính khối
          </span>
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
            {activeBlock.type} <span className="font-mono text-xs font-normal text-neutral-400">#{activeBlock.id}</span>
          </h3>
        </div>
      </div>

      {/* 2. Dynamic Form based on Block Type */}
      {activeBlock.type === 'HERO' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tiêu đề phụ trên cùng</span>
            <input
              type="text"
              value={(props.title as string) || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Lời dẫn (Subtitle)</span>
            <input
              type="text"
              value={(props.subtitle as string) || ''}
              onChange={(e) => updateProp('subtitle', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Tên Chú Rể</span>
              <input
                type="text"
                value={(props.groomName as string) || ''}
                onChange={(e) => updateProp('groomName', e.target.value)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary font-bold"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Tên Cô Dâu</span>
              <input
                type="text"
                value={(props.brideName as string) || ''}
                onChange={(e) => updateProp('brideName', e.target.value)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary font-bold"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Ngày cưới hiển thị</span>
            <input
              type="text"
              value={(props.eventDate as string) || ''}
              onChange={(e) => updateProp('eventDate', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Ảnh bìa (Cover Image URL)</span>
            <input
              type="text"
              value={(props.coverImageUrl as string) || ''}
              onChange={(e) => updateProp('coverImageUrl', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-mh-primary"
            />
          </label>
        </div>
      )}

      {activeBlock.type === 'COUPLE' && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tiêu đề mục</span>
            <input
              type="text"
              value={(props.sectionTitle as string) || ''}
              onChange={(e) => updateProp('sectionTitle', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Câu danh ngôn (Quote)</span>
            <textarea
              value={(props.quote as string) || ''}
              onChange={(e) => updateProp('quote', e.target.value)}
              rows={2}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
            />
          </label>

          {/* Groom Details */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-col gap-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-blue-500">male</span>
              Thông tin Chú Rể
            </span>
            <input
              type="text"
              placeholder="Họ tên chú rể"
              value={((props.groom as Record<string, unknown>)?.name as string) || ''}
              onChange={(e) => updateNestedProp('groom', 'name', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <input
              type="text"
              placeholder="URL ảnh chân dung chú rể"
              value={((props.groom as Record<string, unknown>)?.photoUrl as string) || ''}
              onChange={(e) => updateNestedProp('groom', 'photoUrl', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <input
              type="text"
              placeholder="Họ tên Thân Phụ"
              value={((props.groom as Record<string, unknown>)?.fatherName as string) || ''}
              onChange={(e) => updateNestedProp('groom', 'fatherName', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <input
              type="text"
              placeholder="Họ tên Thân Mẫu"
              value={((props.groom as Record<string, unknown>)?.motherName as string) || ''}
              onChange={(e) => updateNestedProp('groom', 'motherName', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <textarea
              placeholder="Lời ngỏ của chú rể"
              value={((props.groom as Record<string, unknown>)?.storyQuote as string) || ''}
              onChange={(e) => updateNestedProp('groom', 'storyQuote', e.target.value)}
              rows={2}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </div>

          {/* Bride Details */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-col gap-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-pink-500">female</span>
              Thông tin Cô Dâu
            </span>
            <input
              type="text"
              placeholder="Họ tên cô dâu"
              value={((props.bride as Record<string, unknown>)?.name as string) || ''}
              onChange={(e) => updateNestedProp('bride', 'name', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <input
              type="text"
              placeholder="URL ảnh chân dung cô dâu"
              value={((props.bride as Record<string, unknown>)?.photoUrl as string) || ''}
              onChange={(e) => updateNestedProp('bride', 'photoUrl', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <input
              type="text"
              placeholder="Họ tên Thân Phụ"
              value={((props.bride as Record<string, unknown>)?.fatherName as string) || ''}
              onChange={(e) => updateNestedProp('bride', 'fatherName', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <input
              type="text"
              placeholder="Họ tên Thân Mẫu"
              value={((props.bride as Record<string, unknown>)?.motherName as string) || ''}
              onChange={(e) => updateNestedProp('bride', 'motherName', e.target.value)}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
            <textarea
              placeholder="Lời ngỏ của cô dâu"
              value={((props.bride as Record<string, unknown>)?.storyQuote as string) || ''}
              onChange={(e) => updateNestedProp('bride', 'storyQuote', e.target.value)}
              rows={2}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </div>
        </div>
      )}

      {activeBlock.type === 'COUNTDOWN' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tiêu đề</span>
            <input
              type="text"
              value={(props.title as string) || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Mô tả</span>
            <input
              type="text"
              value={(props.description as string) || ''}
              onChange={(e) => updateProp('description', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Thời điểm đích (ISO Date)</span>
            <input
              type="text"
              placeholder="2026-12-25T16:00:00"
              value={(props.targetDate as string) || ''}
              onChange={(e) => updateProp('targetDate', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono"
            />
          </label>
        </div>
      )}

      {activeBlock.type === 'GALLERY' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tiêu đề album</span>
            <input
              type="text"
              value={(props.title as string) || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Mô tả album</span>
            <input
              type="text"
              value={(props.subtitle as string) || ''}
              onChange={(e) => updateProp('subtitle', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Danh sách URL ảnh (mỗi ảnh 1 dòng)</span>
            <textarea
              value={((props.images as string[]) || []).join('\n')}
              onChange={(e) =>
                updateProp(
                  'images',
                  e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                )
              }
              rows={5}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-[11px]"
            />
          </label>
        </div>
      )}

      {activeBlock.type === 'THANKYOU' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tiêu đề cảm ơn</span>
            <input
              type="text"
              value={(props.title as string) || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Lời cảm ơn</span>
            <textarea
              value={(props.message as string) || ''}
              onChange={(e) => updateProp('message', e.target.value)}
              rows={3}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Ảnh kỷ niệm</span>
            <input
              type="text"
              value={(props.imageUrl as string) || ''}
              onChange={(e) => updateProp('imageUrl', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
        </div>
      )}

      {activeBlock.type === 'WISHES' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Tiêu đề sổ lưu bút</span>
            <input
              type="text"
              value={(props.title as string) || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500 font-medium">Mô tả</span>
            <input
              type="text"
              value={(props.subtitle as string) || ''}
              onChange={(e) => updateProp('subtitle', e.target.value)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={(props.allowRsvp as boolean) ?? true}
              onChange={(e) => updateProp('allowRsvp', e.target.checked)}
              className="rounded text-mh-primary"
            />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Cho phép khách xác nhận tham dự (RSVP)</span>
          </label>
        </div>
      )}
    </div>
  );
}
