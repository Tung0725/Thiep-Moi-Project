import React from 'react';

/**
 * ThemeEditor Component
 * Purpose: Khung chỉnh sửa cấu hình theme (màu sắc, font chữ, hiệu ứng hoạt họa)
 * Props: Không có (kết nối trực tiếp với useEditorStore khi triển khai logic)
 * Key States: theme, effects
 */
export function ThemeEditor() {
  return (
    <div className="p-4 space-y-4">
      {/* Theme Section Header */}
      <h3 className="text-sm font-semibold text-neutral-800">Cấu hình Giao diện & Màu sắc</h3>

      {/* Primary Color Control Skeleton */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-500 font-medium">Màu sắc chủ đạo</label>
        <div className="h-9 w-full bg-neutral-100 rounded-lg border border-neutral-200" />
      </div>

      {/* Effects Control Skeleton */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-500 font-medium">Hiệu ứng rơi</label>
        <div className="h-9 w-full bg-neutral-100 rounded-lg border border-neutral-200" />
      </div>
    </div>
  );
}
