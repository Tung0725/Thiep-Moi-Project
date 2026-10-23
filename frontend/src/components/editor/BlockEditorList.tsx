import React from 'react';

/**
 * BlockEditorList Component
 * Purpose: Khung quản lý danh sách các khối (sắp xếp thứ tự, ẩn/hiện, mở rộng thuộc tính)
 * Props: Không có
 * Key States: selectedBlockId, blocks
 */
export function BlockEditorList() {
  return (
    <div className="p-4 space-y-4">
      {/* Block List Header */}
      <h3 className="text-sm font-semibold text-neutral-800">Danh sách Khối Hiển Thị</h3>

      {/* Block Items Container Skeleton */}
      <div className="space-y-2">
        <div className="h-12 w-full bg-neutral-50 rounded-xl border border-neutral-200" />
        <div className="h-12 w-full bg-neutral-50 rounded-xl border border-neutral-200" />
        <div className="h-12 w-full bg-neutral-50 rounded-xl border border-neutral-200" />
      </div>
    </div>
  );
}
