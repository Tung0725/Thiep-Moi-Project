'use client';

import React from 'react';
import { PageSchema, FallingEffectType } from '@/types/schema';

/**
 * GlobalSettingsTab Component
 * Purpose: Chỉnh sửa các thiết lập toàn cục của thiệp cưới bao gồm Theme màu sắc, Phông chữ và Hiệu ứng nền / bao thư.
 * Props:
 *   - schema: PageSchema hiện tại đang chỉnh sửa
 *   - onChange: Hàm callback nhận schema mới sau khi thay đổi
 * Key States:
 *   - Tự động đồng bộ với schema cha.
 */
interface GlobalSettingsTabProps {
  schema: PageSchema;
  onChange: (updated: PageSchema) => void;
}

const FALLING_TYPES: { id: FallingEffectType; label: string; icon: string }[] = [
  { id: 'NONE', label: 'Tắt hiệu ứng', icon: 'block' },
  { id: 'PETALS', label: 'Cánh hoa hồng rơi', icon: 'local_florist' },
  { id: 'SNOW', label: 'Hoa tuyết rơi', icon: 'ac_unit' },
  { id: 'HEARTS', label: 'Trái tim bay', icon: 'favorite' },
];

export default function GlobalSettingsTab({ schema, onChange }: GlobalSettingsTabProps) {
  const updateTheme = (field: keyof PageSchema['theme'], value: string) => {
    onChange({
      ...schema,
      theme: {
        ...schema.theme,
        [field]: value,
      },
    });
  };

  const updateEffects = (updates: Partial<PageSchema['effects']>) => {
    onChange({
      ...schema,
      effects: {
        ...schema.effects,
        ...updates,
      },
    });
  };

  const updateOpening = (updates: Partial<NonNullable<PageSchema['effects']['openingEffect']>>) => {
    onChange({
      ...schema,
      effects: {
        ...schema.effects,
        openingEffect: {
          enabled: true,
          delayMs: 1200,
          ...schema.effects.openingEffect,
          ...updates,
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 text-xs">
      {/* 1. Theme Color Settings */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
          <span className="material-symbols-outlined text-[16px] text-mh-primary">palette</span>
          <span>Màu Sắc &amp; Phong Cách</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-neutral-500 font-medium">Màu chủ đạo (Primary)</span>
            <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 bg-white dark:bg-neutral-800">
              <input
                type="color"
                value={schema.theme.primaryColor || '#A80606'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={schema.theme.primaryColor || '#A80606'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-full text-xs font-mono uppercase bg-transparent outline-none text-neutral-700 dark:text-neutral-200"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-neutral-500 font-medium">Màu nền thiệp (Background)</span>
            <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 bg-white dark:bg-neutral-800">
              <input
                type="color"
                value={schema.theme.backgroundColor || '#FFFFFF'}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={schema.theme.backgroundColor || '#FFFFFF'}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="w-full text-xs font-mono uppercase bg-transparent outline-none text-neutral-700 dark:text-neutral-200"
              />
            </div>
          </label>
        </div>
      </div>

      {/* 2. Typography Settings */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
          <span className="material-symbols-outlined text-[16px] text-mh-primary">text_fields</span>
          <span>Phông Chữ (Typography)</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-neutral-500 font-medium">Font tiêu đề (Heading)</span>
            <select
              value={schema.theme.headingFont || 'serif'}
              onChange={(e) => updateTheme('headingFont', e.target.value)}
              className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs outline-none focus:border-mh-primary"
            >
              <option value="serif">Serif cổ điển (Playfair/Merriweather)</option>
              <option value="sans-serif">Sans-serif hiện đại (Inter/Outfit)</option>
              <option value="cursive">Cursive lãng mạn (Great Vibes)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-neutral-500 font-medium">Font nội dung (Body)</span>
            <select
              value={schema.theme.bodyFont || 'sans-serif'}
              onChange={(e) => updateTheme('bodyFont', e.target.value)}
              className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs outline-none focus:border-mh-primary"
            >
              <option value="sans-serif">Sans-serif thanh thoát</option>
              <option value="serif">Serif trang trọng</option>
            </select>
          </label>
        </div>
      </div>

      {/* 3. Falling Particle Effects */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
          <span className="material-symbols-outlined text-[16px] text-mh-primary">grain</span>
          <span>Hiệu Ứng Rơi (Falling Animation)</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {FALLING_TYPES.map((type) => {
            const isSelected = schema.effects.fallingType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => updateEffects({ fallingType: type.id })}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'border-mh-primary bg-mh-pink-soft dark:bg-rose-950/40 text-mh-primary font-bold'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-mh-primary/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{type.icon}</span>
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Background Music */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
          <span className="material-symbols-outlined text-[16px] text-mh-primary">music_note</span>
          <span>Nhạc Nền Tự Động (Background Audio)</span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-neutral-500 font-medium">Đường dẫn tệp âm thanh MP3</span>
          <input
            type="text"
            placeholder="/templates/hb04/audio/wedding-melody.mp3"
            value={schema.effects.musicUrl || ''}
            onChange={(e) => updateEffects({ musicUrl: e.target.value })}
            className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs outline-none focus:border-mh-primary"
          />
        </label>
      </div>

      {/* 5. Envelope Opening Effect */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
            <span className="material-symbols-outlined text-[16px] text-mh-primary">mail</span>
            <span>Hiệu Ứng Mở Cánh Thiệp</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schema.effects.openingEffect?.enabled ?? false}
              onChange={(e) => updateOpening({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-mh-primary"></div>
          </label>
        </div>

        {schema.effects.openingEffect?.enabled && (
          <div className="flex flex-col gap-2.5 pl-2 border-l-2 border-mh-primary/30">
            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Ảnh cánh trái (Left Panel URL)</span>
              <input
                type="text"
                value={schema.effects.openingEffect?.leftImage || ''}
                onChange={(e) => updateOpening({ leftImage: e.target.value })}
                className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Ảnh cánh phải (Right Panel URL)</span>
              <input
                type="text"
                value={schema.effects.openingEffect?.rightImage || ''}
                onChange={(e) => updateOpening({ rightImage: e.target.value })}
                className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-neutral-500 font-medium">Độ trễ mở thiệp (Mili-giây)</span>
              <input
                type="number"
                min="300"
                step="100"
                value={schema.effects.openingEffect?.delayMs || 1200}
                onChange={(e) => updateOpening({ delayMs: parseInt(e.target.value, 10) || 1200 })}
                className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
