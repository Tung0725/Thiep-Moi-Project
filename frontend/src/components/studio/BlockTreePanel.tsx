'use client';

import React, { useState } from 'react';
import { PageSchema, UIBlock, BlockType } from '@/types/schema';

/**
 * BlockTreePanel Component
 * Purpose: Hiển thị danh sách các khối giao diện theo thứ tự hiển thị của thiệp.
 *   - Cho phép thêm khối mới từ thư viện có sẵn (HERO, COUPLE, EVENTS, GALLERY, GIFTBOX, ...).
 *   - Sắp xếp vị trí các khối (Di chuyển Lên / Xuống).
 *   - Ẩn / Hiện khối hoặc Xóa khối khỏi thiệp.
 * Props:
 *   - schema: Cây PageSchema hiện tại
 *   - activeBlockId: ID khối đang được chọn để chỉnh sửa
 *   - onSelectBlock: Callback khi chọn khối
 *   - onChange: Callback khi thay đổi danh sách khối trong schema
 * Key States:
 *   - showAddMenu: Trạng thái hiển thị menu thêm khối mới
 */
interface BlockTreePanelProps {
  schema: PageSchema;
  activeBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onChange: (updated: PageSchema) => void;
}

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: string; defaultProps: Record<string, unknown> }[] = [
  {
    type: 'HERO',
    label: 'Khối Đầu Trang (Hero)',
    icon: 'star',
    defaultProps: {
      title: 'SAVE THE DATE',
      subtitle: 'Trân trọng kính mời quý khách đến dự lễ thành hôn của',
      groomName: 'Chú Rể',
      brideName: 'Cô Dâu',
      eventDate: '25 . 12 . 2026',
      coverImageUrl: '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
    },
  },
  {
    type: 'COUPLE',
    label: 'Khối Cô Dâu & Chú Rể',
    icon: 'favorite',
    defaultProps: {
      sectionTitle: 'Chú Rể & Cô Dâu',
      quote: 'Hôn nhân là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.',
      groom: {
        name: 'Chú Rể',
        role: 'GROOM',
        photoUrl: '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp',
        fatherName: 'Họ tên Bố Chú Rể',
        motherName: 'Họ tên Mẹ Chú Rể',
        address: 'Địa chỉ nhà trai',
      },
      bride: {
        name: 'Cô Dâu',
        role: 'BRIDE',
        photoUrl: '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp',
        fatherName: 'Họ tên Bố Cô Dâu',
        motherName: 'Họ tên Mẹ Cô Dâu',
        address: 'Địa chỉ nhà gái',
      },
    },
  },
  {
    type: 'COUNTDOWN',
    label: 'Khối Đếm Ngược Ngày Cưới',
    icon: 'timer',
    defaultProps: {
      title: 'Cùng Đếm Ngược Ngày Chung Đôi',
      description: 'Từng giây từng phút hướng về ngày hạnh phúc nhất của hai đứa mình',
      targetDate: '2026-12-25T16:00:00',
    },
  },
  {
    type: 'EVENTS',
    label: 'Khối Lịch Trình Sự Kiện',
    icon: 'calendar_month',
    defaultProps: {
      title: 'Sự Kiện Cưới',
      groomEvents: [
        {
          title: 'Tiệc Cưới Nhà Trai',
          timeText: '16:00 Thứ Bảy',
          dateText: 'Ngày 24/12/2026',
          locationName: 'Tư Gia Nhà Trai',
          address: 'Địa chỉ nhà trai',
        },
      ],
      brideEvents: [
        {
          title: 'Tiệc Cưới Nhà Gái',
          timeText: '16:00 Thứ Bảy',
          dateText: 'Ngày 24/12/2026',
          locationName: 'Tư Gia Nhà Gái',
          address: 'Địa chỉ nhà gái',
        },
      ],
    },
  },
  {
    type: 'GALLERY',
    label: 'Khối Album Ảnh Cưới',
    icon: 'photo_library',
    defaultProps: {
      title: 'Album Ảnh Cưới',
      subtitle: 'Khoảnh khắc ngọt ngào ghi dấu tình yêu đôi lứa',
      images: [
        '/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp',
        '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
        '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
      ],
    },
  },
  {
    type: 'GIFTBOX',
    label: 'Khối Hộp Mừng Cưới (QR)',
    icon: 'featured_seasonal_and_gifts',
    defaultProps: {
      title: 'Hộp Mừng Cưới',
      subtitle: 'Gửi món quà chúc phúc cho ngày vui của chúng mình',
      groomAccount: {
        ownerName: 'NGUYEN VAN A',
        bankName: 'MB Bank',
        accountNumber: '0988123456',
        qrCodeUrl: '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp',
        label: 'Mừng Cưới Chú Rể',
      },
    },
  },
  {
    type: 'THANKYOU',
    label: 'Khối Lời Cảm Ơn',
    icon: 'loyalty',
    defaultProps: {
      title: 'Thank You',
      message: 'Chân thành cảm ơn gia đình, bạn bè đã cùng tụi mình viết nên một ngày đáng nhớ.',
      imageUrl: '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
    },
  },
  {
    type: 'WISHES',
    label: 'Khối Sổ Lưu Bút & Chúc Phúc',
    icon: 'history_edu',
    defaultProps: {
      title: 'Sổ Lưu Bút & Lời Chúc',
      subtitle: 'Hãy gửi những lời chúc tốt đẹp nhất tới cô dâu & chú rể',
      allowRsvp: true,
    },
  },
];

export default function BlockTreePanel({
  schema,
  activeBlockId,
  onSelectBlock,
  onChange,
}: BlockTreePanelProps) {
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  const moveBlock = (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= schema.blocks.length) return;

    const newBlocks = [...schema.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, moved);

    onChange({ ...schema, blocks: newBlocks });
  };

  const toggleHideBlock = (id: string) => {
    const newBlocks = schema.blocks.map((b) => (b.id === id ? { ...b, isHidden: !b.isHidden } : b));
    onChange({ ...schema, blocks: newBlocks });
  };

  const deleteBlock = (id: string) => {
    const newBlocks = schema.blocks.filter((b) => b.id !== id);
    onChange({ ...schema, blocks: newBlocks });
    if (activeBlockId === id && newBlocks.length > 0) {
      onSelectBlock(newBlocks[0].id);
    }
  };

  const addBlock = (item: (typeof AVAILABLE_BLOCKS)[number]) => {
    const newId = `${item.type.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newBlock: UIBlock = {
      id: newId,
      type: item.type,
      props: item.defaultProps,
    };
    const updatedBlocks = [...schema.blocks, newBlock];
    onChange({ ...schema, blocks: updatedBlocks });
    onSelectBlock(newId);
    setShowAddMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121420] border-r border-neutral-200 dark:border-[#242838] select-none">
      {/* 1. Header with Add Block Button */}
      <div className="p-3.5 border-b border-neutral-200 dark:border-[#242838] flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            Cây Cấu Trúc Khối ({schema.blocks.length})
          </h2>
          <p className="text-[10px] text-neutral-400">Kéo / chọn khối để tùy biến</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="px-2.5 py-1.5 rounded-lg bg-mh-primary text-white hover:bg-mh-primary-hover text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Thêm</span>
        </button>
      </div>

      {/* 2. Add Block Menu Dropdown Overlay */}
      {showAddMenu && (
        <div className="p-2 border-b border-neutral-200 dark:border-[#242838] bg-neutral-50 dark:bg-[#181a28] flex flex-col gap-1 max-h-56 overflow-y-auto no-scrollbar shadow-inner">
          <span className="text-[10px] font-bold text-neutral-500 uppercase px-2 py-0.5">
            Chọn loại khối muốn thêm
          </span>
          {AVAILABLE_BLOCKS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => addBlock(item)}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-800 text-left flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-200 transition cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
            >
              <span className="material-symbols-outlined text-[16px] text-mh-primary">{item.icon}</span>
              <span className="font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 3. Block List View */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 no-scrollbar">
        {schema.blocks.map((block, index) => {
          const isActive = block.id === activeBlockId;
          const isFirst = index === 0;
          const isLast = index === schema.blocks.length - 1;

          return (
            <div
              key={block.id}
              onClick={() => onSelectBlock(block.id)}
              className={`group rounded-xl border p-2 flex items-center justify-between gap-2 transition cursor-pointer ${
                isActive
                  ? 'border-mh-primary bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary shadow-sm'
                  : 'border-neutral-200 dark:border-[#242838] bg-white dark:bg-[#161824] hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
              } ${block.isHidden ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[16px] text-neutral-400 group-hover:text-mh-primary">
                  drag_indicator
                </span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate">{block.type}</span>
                    <span className="text-[10px] font-mono text-neutral-400">#{block.id}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Up, Down, Visibility, Delete */}
              <div
                className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => moveBlock(index, 'UP')}
                  className="w-6 h-6 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-20 flex items-center justify-center cursor-pointer"
                  title="Di chuyển lên"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => moveBlock(index, 'DOWN')}
                  className="w-6 h-6 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-20 flex items-center justify-center cursor-pointer"
                  title="Di chuyển xuống"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleHideBlock(block.id)}
                  className="w-6 h-6 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center cursor-pointer"
                  title={block.isHidden ? 'Hiện khối' : 'Ẩn khối'}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {block.isHidden ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  className="w-6 h-6 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 flex items-center justify-center cursor-pointer"
                  title="Xóa khối"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
