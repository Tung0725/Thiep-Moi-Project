'use client';

import React, { useState, useEffect } from 'react';
import { PageSchema } from '@/types/schema';

/**
 * RawJsonTab Component
 * Purpose: Cho phép người tạo mẫu xem trực tiếp cấu trúc JSON Schema, sao chép hoặc dán JSON để cập nhật tức thì.
 * Props:
 *   - schema: Cây PageSchema hiện tại
 *   - onChange: Hàm callback cập nhật schema khi người dùng sửa trực tiếp JSON
 * Key States:
 *   - jsonText: Nội dung text JSON trong textarea
 *   - error: Thông báo lỗi nếu cú pháp JSON không hợp lệ
 *   - copied: Trạng thái hiển thị đã sao chép
 */
interface RawJsonTabProps {
  schema: PageSchema;
  onChange: (updated: PageSchema) => void;
}

export default function RawJsonTab({ schema, onChange }: RawJsonTabProps) {
  const [jsonText, setJsonText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setJsonText(JSON.stringify(schema, null, 2));
    setError(null);
  }, [schema]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
        throw new Error("JSON Schema hợp lệ phải có mảng 'blocks'.");
      }
      setError(null);
      onChange(parsed as PageSchema);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'JSON không đúng định dạng');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua lỗi sao chép trình duyệt
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3 text-xs">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-neutral-700 dark:text-neutral-300">Biên dịch JSON Schema</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition"
          >
            <span className="material-symbols-outlined text-[14px]">{copied ? 'done' : 'content_copy'}</span>
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1 rounded bg-mh-primary text-white font-semibold hover:bg-mh-primary-hover flex items-center gap-1 cursor-pointer transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">save</span>
            <span>Áp dụng JSON</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-600 font-mono text-[11px]">
          {error}
        </div>
      )}

      {/* JSON Code Textarea */}
      <div className="flex-1 min-h-[350px]">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
          className="w-full h-full min-h-[350px] p-3 font-mono text-[11px] leading-relaxed bg-neutral-900 text-emerald-400 rounded-xl border border-neutral-700 outline-none resize-none shadow-inner"
        />
      </div>
    </div>
  );
}
