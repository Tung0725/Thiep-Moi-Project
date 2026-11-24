'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ImagePlus,
  Link2,
  MousePointerClick,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { PageSchema } from '@/types/schema';
import { compressImageFile, isValidImageSource } from '@/lib/imageUpload';
import {
  getTemplatePhotoSlots,
  MAX_DYNAMIC_ALBUM_PHOTOS,
  PhotoSlot,
  PhotoSlotGroup,
  supportsDynamicAlbum,
} from '@/lib/photoSlots';

interface PhotoSlotManagerProps {
  schema: PageSchema;
  formData: Record<string, string>;
  defaults: Record<string, string>;
  activeSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  onUpdateSlot: (slotId: string, nextUrl: string) => void;
  onFocusSlot: (slotId: string, url: string) => void;
  onAddAlbumPhotos: (urls: string[]) => void;
  onRemoveAlbumPhoto: (index: number) => void;
  onMoveAlbumPhoto: (index: number, delta: number) => void;
}

const GROUP_ORDER: PhotoSlotGroup[] = ['cover', 'couple', 'events', 'album', 'closing', 'qr'];

/**
 * Unified WYSIWYG photo slot manager for Tab 2 ("Hình ảnh").
 * Lists every editable photo position on the active template grouped by section,
 * with direct upload, URL paste, reset, album management, and two-way sync with the iPhone preview.
 */
export default function PhotoSlotManager({
  schema,
  formData,
  defaults,
  activeSlotId,
  onSelectSlot,
  onUpdateSlot,
  onFocusSlot,
  onAddAlbumPhotos,
  onRemoveAlbumPhoto,
  onMoveAlbumPhoto,
}: PhotoSlotManagerProps) {
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const albumAddInputRef = useRef<HTMLInputElement>(null);

  const [pendingSlot, setPendingSlot] = useState<PhotoSlot | null>(null);
  const [urlEditorSlotId, setUrlEditorSlotId] = useState<string | null>(null);
  const [draftUrl, setDraftUrl] = useState('');
  const [processingSlotId, setProcessingSlotId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const slots = useMemo(
    () => getTemplatePhotoSlots(schema, formData, defaults),
    [schema, formData, defaults]
  );
  const dynamicAlbum = supportsDynamicAlbum(schema);

  const groupedSlots = useMemo(() => {
    const map = new Map<PhotoSlotGroup, { label: string; items: PhotoSlot[] }>();
    for (const slot of slots) {
      const existing = map.get(slot.group);
      if (existing) {
        existing.items.push(slot);
      } else {
        map.set(slot.group, { label: slot.groupLabel, items: [slot] });
      }
    }
    return GROUP_ORDER.filter((group) => map.has(group)).map((group) => ({
      group,
      label: map.get(group)!.label,
      items: map.get(group)!.items,
    }));
  }, [slots]);

  const albumCount = useMemo(
    () => slots.filter((slot) => slot.group === 'album').length,
    [slots]
  );

  // Scroll the selected slot card into view when the user taps a photo on the iPhone preview.
  useEffect(() => {
    if (!activeSlotId) return;
    const card = document.getElementById(`photo-slot-card-${activeSlotId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSlotId]);

  const triggerSingleUpload = (slot: PhotoSlot) => {
    setErrorMsg('');
    setPendingSlot(slot);
    onSelectSlot(slot.id);
    singleFileInputRef.current?.click();
  };

  const handleSingleFileSelected = async (file: File | undefined) => {
    if (!file || !pendingSlot) return;
    const targetSlot = pendingSlot;
    setErrorMsg('');
    setProcessingSlotId(targetSlot.id);
    try {
      const maxDimension =
        targetSlot.group === 'cover' || targetSlot.group === 'closing' ? 1280 : 960;
      const dataUrl = await compressImageFile(file, { maxDimension, quality: 0.82 });
      onUpdateSlot(targetSlot.id, dataUrl);
      onFocusSlot(targetSlot.id, dataUrl);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Không thể xử lý tệp ảnh.');
    } finally {
      setProcessingSlotId(null);
      setPendingSlot(null);
      if (singleFileInputRef.current) singleFileInputRef.current.value = '';
    }
  };

  const handleAddAlbumFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg('');
    const remaining = MAX_DYNAMIC_ALBUM_PHOTOS - albumCount;
    if (remaining <= 0) {
      setErrorMsg(`Album tối đa ${MAX_DYNAMIC_ALBUM_PHOTOS} ảnh. Vui lòng xóa bớt trước khi thêm.`);
      return;
    }

    setProcessingSlotId('__album_add__');
    try {
      const selected = Array.from(files).slice(0, remaining);
      const uploaded = await Promise.all(
        selected.map((file) => compressImageFile(file, { maxDimension: 960, quality: 0.78 }))
      );
      onAddAlbumPhotos(uploaded);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Không thể thêm ảnh vào album.');
    } finally {
      setProcessingSlotId(null);
      if (albumAddInputRef.current) albumAddInputRef.current.value = '';
    }
  };

  const handleApplyUrl = (slot: PhotoSlot) => {
    const trimmed = draftUrl.trim();
    if (!isValidImageSource(trimmed)) {
      setErrorMsg('Đường dẫn ảnh không hợp lệ. Vui lòng nhập URL https:// hợp lệ.');
      return;
    }
    setErrorMsg('');
    onUpdateSlot(slot.id, trimmed);
    onFocusSlot(slot.id, trimmed);
    setUrlEditorSlotId(null);
    setDraftUrl('');
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleSingleFileSelected(event.target.files?.[0])}
        className="sr-only"
        aria-label="Chọn ảnh thay thế"
      />
      <input
        ref={albumAddInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleAddAlbumFiles(event.target.files)}
        className="sr-only"
        aria-label="Thêm nhiều ảnh vào album"
      />

      {/* Interactive Photo Guidance Callout */}
      <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 px-4 py-3 flex items-start gap-2.5">
        <MousePointerClick
          size={18}
          className="text-mh-primary shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-200">
          <strong className="font-bold text-neutral-900 dark:text-white">
            Mẹo sửa nhanh:
          </strong>{' '}
          Bấm trực tiếp vào bất kỳ ảnh nào trên màn hình iPhone bên phải để chọn đúng vị trí cần đổi,
          hoặc bấm <strong className="font-semibold">Xem vị trí</strong> ở từng thẻ bên dưới.
        </p>
      </div>

      {errorMsg && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300"
        >
          {errorMsg}
        </p>
      )}

      {/* Grouped Photo Slots */}
      {groupedSlots.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#191c2b] p-6 text-center">
          <ImagePlus size={24} className="mx-auto mb-2 text-neutral-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Mẫu thiệp này chưa có ô ảnh tùy biến.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSlots.map(({ group, label, items }) => (
            <section
              key={group}
              className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#191c2b] p-4"
            >
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold tabular-nums text-neutral-600 dark:text-neutral-300">
                    {group === 'album' && dynamicAlbum
                      ? `${items.length} / ${MAX_DYNAMIC_ALBUM_PHOTOS} ảnh`
                      : `${items.length} vị trí`}
                  </span>
                </div>

                {group === 'album' && dynamicAlbum && items.length < MAX_DYNAMIC_ALBUM_PHOTOS && (
                  <button
                    type="button"
                    disabled={processingSlotId === '__album_add__'}
                    onClick={() => albumAddInputRef.current?.click()}
                    className="inline-flex min-h-[36px] items-center gap-1.5 px-3 py-1.5 rounded-full bg-mh-primary hover:bg-mh-primary-hover text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>
                      {processingSlotId === '__album_add__' ? 'Đang tải…' : 'Thêm ảnh album'}
                    </span>
                  </button>
                )}
              </div>

              {/* Slot Cards */}
              <div className="space-y-2.5">
                {items.map((slot) => {
                  const isActive = activeSlotId === slot.id;
                  const isBusy = processingSlotId === slot.id;
                  const isCustom =
                    slot.url.startsWith('data:image/') ||
                    Boolean(slot.defaultUrl && slot.url !== slot.defaultUrl);
                  const isUrlOpen = urlEditorSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      id={`photo-slot-card-${slot.id}`}
                      className={`rounded-xl border p-2.5 transition-all bg-white dark:bg-[#151724] ${
                        isActive
                          ? 'border-mh-primary ring-2 ring-mh-primary/20'
                          : 'border-neutral-200 dark:border-neutral-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSlot(slot.id);
                            onFocusSlot(slot.id, slot.url);
                          }}
                          title="Nhấn để xem vị trí ảnh này trên iPhone"
                          className="relative w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0 cursor-pointer group"
                        >
                          {slot.url ? (
                            <img
                              src={slot.url}
                              alt={slot.label}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ImagePlus size={18} aria-hidden="true" />
                            </span>
                          )}
                          {isBusy && (
                            <span className="absolute inset-0 bg-black/55 flex items-center justify-center">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </span>
                          )}
                        </button>

                        {/* Slot Info & Controls */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                {slot.label}
                              </p>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                                {slot.locationHint}
                              </p>
                            </div>
                            {isCustom && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                Đã thay
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => triggerSingleUpload(slot)}
                              className="inline-flex min-h-[34px] items-center gap-1 px-2.5 py-1 rounded-lg bg-mh-primary hover:bg-mh-primary-hover text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60"
                            >
                              <Upload size={12} aria-hidden="true" />
                              <span>Đổi ảnh</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectSlot(slot.id);
                                onFocusSlot(slot.id, slot.url);
                              }}
                              className="inline-flex min-h-[34px] items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:border-mh-primary hover:text-mh-primary text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <Eye size={12} aria-hidden="true" />
                              <span>Xem vị trí</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isUrlOpen) {
                                  setUrlEditorSlotId(null);
                                } else {
                                  setUrlEditorSlotId(slot.id);
                                  setDraftUrl(slot.url.startsWith('data:') ? '' : slot.url);
                                }
                              }}
                              aria-expanded={isUrlOpen}
                              className="inline-flex min-h-[34px] items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white text-[11px] font-semibold cursor-pointer"
                            >
                              <Link2 size={12} aria-hidden="true" />
                              <span>Link</span>
                            </button>

                            {slot.defaultUrl && slot.url !== slot.defaultUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateSlot(slot.id, slot.defaultUrl!);
                                  onFocusSlot(slot.id, slot.defaultUrl!);
                                }}
                                title="Khôi phục ảnh mặc định"
                                className="inline-flex min-h-[34px] items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white text-[11px] font-semibold cursor-pointer"
                              >
                                <RotateCcw size={12} aria-hidden="true" />
                                <span>Gốc</span>
                              </button>
                            )}

                            {slot.removable && typeof slot.albumIndex === 'number' && (
                              <div className="flex items-center gap-0.5 ml-auto">
                                <button
                                  type="button"
                                  disabled={slot.albumIndex === 0}
                                  onClick={() => onMoveAlbumPhoto(slot.albumIndex!, -1)}
                                  aria-label={`Đưa ${slot.label} lên trước`}
                                  className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
                                >
                                  <ChevronLeft size={14} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  disabled={slot.albumIndex === items.length - 1}
                                  onClick={() => onMoveAlbumPhoto(slot.albumIndex!, 1)}
                                  aria-label={`Đưa ${slot.label} ra sau`}
                                  className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
                                >
                                  <ChevronRight size={14} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  disabled={items.length <= 1}
                                  onClick={() => onRemoveAlbumPhoto(slot.albumIndex!)}
                                  aria-label={`Xóa ${slot.label}`}
                                  title={
                                    items.length <= 1
                                      ? 'Cần giữ ít nhất 1 ảnh trong album'
                                      : 'Xóa ảnh này'
                                  }
                                  className="w-8 h-8 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Optional Inline URL Editor */}
                      {isUrlOpen && (
                        <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            value={draftUrl}
                            onChange={(event) => setDraftUrl(event.target.value)}
                            placeholder="https://example.com/anh-cuoi.jpg"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-label={`Đường dẫn ảnh cho ${slot.label}`}
                            className="flex-1 min-h-[40px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191c2b] px-3 py-1.5 text-base sm:text-xs text-neutral-900 dark:text-white focus:border-mh-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyUrl(slot)}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold cursor-pointer shrink-0"
                          >
                            Áp dụng
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
