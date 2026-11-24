'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, ChevronUp, Music, Palette, Sparkles } from 'lucide-react';
import { FallingEffectType, PageSchema } from '@/types/schema';
import { resolveTemplate } from './registry';

const COLOR_PRESETS = [
  { label: 'Xanh ô liu', value: '#5F6459' },
  { label: 'Đỏ son', value: '#A80606' },
  { label: 'Đỏ rượu', value: '#511419' },
  { label: 'Xanh rêu cổ điển', value: '#1F3A25' },
  { label: 'Xanh rêu', value: '#2e5a44' },
  { label: 'Vàng kim', value: '#b8860b' },
  { label: 'Hồng phấn', value: '#ff2056' },
];

const PRESET_MUSIC_TRACKS = [
  { label: 'Bản nhạc mặc định HB04 (Lãng mạn)', url: '/templates/hb04/audio/4360425c-05a9-4611-8ba7-45da2c47ab1d.mp3' },
  { label: '50 Năm Về Sau (Minimalism)', url: '/templates/minimalism-do-dam/archive/audio/50-nam-ve-sau.mp3' },
  { label: 'Lễ Đường (Song Hỷ Xanh)', url: '/templates/song-hy-xanh/archive/audio/le-duong.mp3' },
  { label: 'Giai điệu DS03 (Sang trọng)', url: '/templates/ds03-sang-trong/runtime/v1/media/audio/ea9168ee-cdb4-4fbd-b7ad-4dcb48f47353.mp3' },
];

const FALLING_OPTIONS: { value: FallingEffectType; label: string }[] = [
  { value: 'NONE', label: 'Không có' },
  { value: 'HEARTS', label: 'Trái tim' },
  { value: 'PETALS', label: 'Cánh hoa' },
  { value: 'SNOW', label: 'Tuyết rơi' },
];

const BLOCK_LABELS: Record<string, string> = {
  HERO: 'Ảnh bìa & Tên Dâu Rể',
  COUPLE: 'Thông tin Gia đình & Cặp đôi',
  COUNTDOWN: 'Đếm ngược ngày cưới',
  EVENTS: 'Lịch trình & Sự kiện cưới',
  GALLERY: 'Album ảnh cưới',
  GIFTBOX: 'Hộp mừng cưới QR',
  THANKYOU: 'Lời cảm ơn cuối thiệp',
  WISHES: 'Sổ lưu bút & Xác nhận RSVP',
  LOCATION: 'Bản đồ địa điểm',
};

/**
 * Template-owned capabilities drive appearance, music, effect, and section ordering controls.
 * Props carry the schema and update callback with no duplicate local schema state.
 */
export default function TemplateControls({
  schema,
  onChange,
}: {
  schema: PageSchema;
  onChange: (schema: PageSchema) => void;
}) {
  const template = resolveTemplate(schema);
  const headingFontId = useId();
  const musicSelectId = useId();
  const customMusicId = useId();
  const [showCustomMusic, setShowCustomMusic] = useState(false);

  if (!template) return null;

  const musicUrl = schema.effects.musicUrl || '';
  const isMusicEnabled = Boolean(musicUrl);
  const isPresetTrack = PRESET_MUSIC_TRACKS.some((track) => track.url === musicUrl);

  const move = (index: number, offset: number) => {
    const blocks = [...schema.blocks];
    [blocks[index], blocks[index + offset]] = [blocks[index + offset], blocks[index]];
    onChange({ ...schema, blocks });
  };

  return (
    <div className="space-y-6">
      {/* Colors & Typography */}
      {!template.fixedDesign && (
        <fieldset className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
          <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white inline-flex items-center gap-1.5">
            <Palette size={15} className="text-mh-primary" aria-hidden="true" />
            <span>Màu sắc &amp; Phông chữ</span>
          </legend>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              Màu chủ đạo
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((preset) => {
                const selected = schema.theme.primaryColor.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      onChange({ ...schema, theme: { ...schema.theme, primaryColor: preset.value } })
                    }
                    title={preset.label}
                    aria-label={`Chọn màu ${preset.label}`}
                    aria-pressed={selected}
                    style={{ backgroundColor: preset.value }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                      selected
                        ? 'border-neutral-900 dark:border-white scale-110 ring-2 ring-mh-primary/30'
                        : 'border-white dark:border-neutral-800 shadow-sm hover:scale-105'
                    }`}
                  />
                );
              })}

              <label className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151724] text-xs font-mono text-neutral-700 dark:text-neutral-200 cursor-pointer">
                <input
                  aria-label="Chọn màu chủ đạo tùy ý"
                  type="color"
                  value={schema.theme.primaryColor}
                  onChange={(event) =>
                    onChange({
                      ...schema,
                      theme: { ...schema.theme, primaryColor: event.target.value },
                    })
                  }
                  className="w-5 h-5 rounded-full border-0 p-0 bg-transparent cursor-pointer"
                />
                <span>{schema.theme.primaryColor.toUpperCase()}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
              <span>Màu nền thiệp</span>
              <div className="flex items-center gap-2 min-h-[44px] rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151724] px-3 py-2">
                <input
                  aria-label="Màu nền"
                  type="color"
                  value={schema.theme.backgroundColor}
                  onChange={(event) =>
                    onChange({
                      ...schema,
                      theme: { ...schema.theme, backgroundColor: event.target.value },
                    })
                  }
                  className="w-6 h-6 rounded border-0 p-0 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs text-neutral-700 dark:text-neutral-200">
                  {schema.theme.backgroundColor.toUpperCase()}
                </span>
              </div>
            </label>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={headingFontId}
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-200"
              >
                Phông chữ tiêu đề
              </label>
              <select
                id={headingFontId}
                className="min-h-[44px] w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151724] px-3 py-2 text-base sm:text-sm text-neutral-900 dark:text-white focus:border-mh-primary focus:outline-none"
                value={schema.theme.headingFont}
                onChange={(event) =>
                  onChange({
                    ...schema,
                    theme: { ...schema.theme, headingFont: event.target.value },
                  })
                }
              >
                {template.fonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      {/* Background Music Controls */}
      <fieldset className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
        <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white inline-flex items-center gap-1.5">
          <Music size={15} className="text-mh-primary" aria-hidden="true" />
          <span>Nhạc nền thiệp cưới</span>
        </legend>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#151724] px-3.5 py-2.5 cursor-pointer">
          <div>
            <span className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Phát nhạc nền khi khách mở thiệp
            </span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              {isMusicEnabled ? 'Đang bật nhạc nền' : 'Đã tắt nhạc nền'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={isMusicEnabled}
            onChange={(event) =>
              onChange({
                ...schema,
                effects: {
                  ...schema.effects,
                  musicUrl: event.target.checked ? PRESET_MUSIC_TRACKS[0].url : '',
                },
              })
            }
            className="w-5 h-5 accent-mh-primary rounded cursor-pointer"
          />
        </label>

        {isMusicEnabled && (
          <div className="space-y-2.5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={musicSelectId}
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-200"
              >
                Chọn bản nhạc có sẵn
              </label>
              <select
                id={musicSelectId}
                value={isPresetTrack ? musicUrl : '__custom__'}
                onChange={(event) => {
                  const val = event.target.value;
                  if (val === '__custom__') {
                    setShowCustomMusic(true);
                    return;
                  }
                  setShowCustomMusic(false);
                  onChange({
                    ...schema,
                    effects: { ...schema.effects, musicUrl: val },
                  });
                }}
                className="min-h-[44px] w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151724] px-3 py-2 text-base sm:text-sm text-neutral-900 dark:text-white focus:border-mh-primary focus:outline-none"
              >
                {PRESET_MUSIC_TRACKS.map((track) => (
                  <option key={track.url} value={track.url}>
                    {track.label}
                  </option>
                ))}
                <option value="__custom__">Nhập đường dẫn nhạc MP3 riêng…</option>
              </select>
            </div>

            {(showCustomMusic || !isPresetTrack) && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={customMusicId}
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-200"
                >
                  Đường dẫn tệp âm thanh (.mp3)
                </label>
                <input
                  id={customMusicId}
                  type="url"
                  value={musicUrl}
                  placeholder="https://example.com/wedding-song.mp3"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(event) =>
                    onChange({
                      ...schema,
                      effects: { ...schema.effects, musicUrl: event.target.value },
                    })
                  }
                  className="min-h-[44px] w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151724] px-3 py-2 text-base sm:text-sm text-neutral-900 dark:text-white focus:border-mh-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Falling Particle Effect (Radio Options) */}
      {!template.fixedDesign && (
        <fieldset className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
          <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white inline-flex items-center gap-1.5">
            <Sparkles size={15} className="text-mh-primary" aria-hidden="true" />
            <span>Hiệu ứng rơi trên thiệp</span>
          </legend>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FALLING_OPTIONS.map((option) => {
              const checked = schema.effects.fallingType === option.value;
              return (
                <label
                  key={option.value}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                    checked
                      ? 'border-mh-primary bg-rose-50/80 dark:bg-rose-950/30 text-mh-primary'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151724] text-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="fallingType"
                    value={option.value}
                    checked={checked}
                    onChange={() =>
                      onChange({
                        ...schema,
                        effects: { ...schema.effects, fallingType: option.value },
                      })
                    }
                    className="accent-mh-primary"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Section Visibility & Ordering */}
      {!template.fixedDesign && schema.blocks.length > 1 && (
        <fieldset className="space-y-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4">
          <legend className="px-1 text-sm font-bold text-neutral-900 dark:text-white">
            Bố cục &amp; Thứ tự các mục
          </legend>

          <div className="space-y-2">
            {schema.blocks.map((block, index) => {
              const label =
                BLOCK_LABELS[block.type] ||
                String(block.props.sectionTitle || block.props.title || block.type);

              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#151724] px-3 py-2"
                >
                  <label className="flex flex-1 items-center gap-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer min-h-[36px]">
                    <input
                      type="checkbox"
                      checked={!block.isHidden}
                      onChange={(event) =>
                        onChange({
                          ...schema,
                          blocks: schema.blocks.map((item) =>
                            item.id === block.id ? { ...item, isHidden: !event.target.checked } : item
                          ),
                        })
                      }
                      className="w-4 h-4 accent-mh-primary rounded cursor-pointer"
                    />
                    <span className={block.isHidden ? 'line-through opacity-50' : ''}>{label}</span>
                  </label>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={`Đưa ${label} lên`}
                      className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:border-mh-primary hover:text-mh-primary disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={index === schema.blocks.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={`Đưa ${label} xuống`}
                      className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:border-mh-primary hover:text-mh-primary disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
