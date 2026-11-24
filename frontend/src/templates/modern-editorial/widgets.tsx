'use client';

import React, { useEffect, useState } from 'react';
import { invitationService } from '@/services/invitationService';
import { AttendanceStatus } from '@/types/api';
import { AlbumImageItem, DemoWish, SceneNode } from './types';

function quoteFont(family?: string): string | undefined {
  if (!family || family === 'inherit') return family;
  return /["',]/.test(family) ? family : `'${family}'`;
}

function paddingCss(values?: number[], fallback = [12, 12, 12, 12]): string {
  const arr = values && values.length === 4 ? values : fallback;
  return `${arr[0]}px ${arr[1]}px ${arr[2]}px ${arr[3]}px`;
}

/**
 * Interactive RSVP form widget matching DS03's grid field layout and styling.
 * Submits directly to `invitationService.submitWish` on public cards, or simulates in preview mode.
 */
export function RsvpFormWidget({
  node,
  publicSlug,
  isMobile,
  onNotify,
  onWishCreated,
}: {
  node: SceneNode;
  publicSlug?: string;
  isMobile: boolean;
  onNotify: (msg: string, isError?: boolean) => void;
  onWishCreated?: (wish: DemoWish) => void;
}) {
  const p = node.props;
  const enabledFields = (p.allFields || []).filter((f) => f.enabled !== false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const formEl = event.currentTarget;
    const fd = new FormData(formEl);
    const fullName = String(fd.get('fullName') || '').trim();
    const willCome = String(fd.get('willCome') || '');
    const countRaw = Number(fd.get('numberOfPeople') ?? 1);
    if (!fullName) {
      onNotify('Vui lòng nhập họ và tên.', true);
      return;
    }

    const declined = /không/i.test(willCome);
    const attendanceStatus: AttendanceStatus = declined ? 'DECLINED' : 'ATTENDING';
    const guestCount = declined ? 0 : Math.max(1, Math.min(20, Number.isFinite(countRaw) ? Math.trunc(countRaw) : 1));

    setSubmitting(true);
    try {
      if (publicSlug) {
        const created = await invitationService.submitWish(publicSlug, {
          guestName: fullName,
          attendanceStatus,
          guestCount,
        });
        onWishCreated?.({
          id: created.id,
          guestName: created.guestName,
          message: created.message,
          createdAt: created.createdAt,
        });
      }
      onNotify('Đã gửi xác nhận tham dự thành công!');
      formEl.reset();
    } catch {
      onNotify('Không thể gửi xác nhận. Vui lòng thử lại.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: p.inputHeight || '44px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#1f2937',
    fontSize: '14px',
    fontFamily: quoteFont(p.inputFontFamily),
    padding: '10px 12px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <form
      data-node-id={node.id}
      onSubmit={handleSubmit}
      style={{
        position: 'absolute',
        top: p.top,
        left: p.left,
        width: p.width,
        display: 'flex',
        flexDirection: 'column',
        gap: `${p.formGap ?? 15}px`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: !isMobile && p.formLayout === 'grid' ? 'repeat(2, minmax(0, 1fr))' : '1fr',
          gap: `${p.formGap ?? 15}px`,
        }}
      >
        {enabledFields.map((field) => {
          const spanFull = !isMobile && p.formLayout === 'grid' && field.gridFullWidth;
          const options = (field.options || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

          return (
            <div key={field.fieldId} style={{ gridColumn: spanFull ? '1 / -1' : undefined }}>
              {field.showLabel && field.label && (
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: '14px',
                    fontFamily: quoteFont(p.inputFontFamily),
                    color: '#374151',
                  }}
                >
                  {field.label}
                  {field.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                </label>
              )}

              {field.fieldId === 'willCome' && options.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px 20px',
                    alignItems: 'center',
                    minHeight: p.inputHeight || '44px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontFamily: quoteFont(p.inputFontFamily),
                    fontSize: '14px',
                    color: '#1f2937',
                  }}
                >
                  {options.map((opt, idx) => (
                    <label key={opt} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={field.fieldId}
                        value={opt}
                        defaultChecked={field.defaultValue ? field.defaultValue === opt : idx === 0}
                        required={field.required}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : field.fieldId === 'numberOfPeople' ? (
                <input
                  type="number"
                  min={1}
                  max={20}
                  defaultValue="1"
                  name={field.fieldId}
                  placeholder={field.placeholder || field.label || 'Số người tham dự'}
                  required={field.required}
                  style={inputStyle}
                />
              ) : (
                <input
                  type={field.fieldId === 'email' ? 'email' : 'text'}
                  name={field.fieldId}
                  placeholder={
                    field.placeholder || `${field.label || field.fieldId}${field.required ? ' *' : ''}`
                  }
                  required={field.required}
                  style={inputStyle}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          backgroundColor: p.buttonBackground || '#5F6459',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: paddingCss(p.buttonPadding, [15, 24, 15, 24]),
          fontFamily: quoteFont(p.buttonFontFamily),
          fontSize: p.buttonFontSize || '16px',
          fontWeight: 600,
          cursor: submitting ? 'wait' : 'pointer',
        }}
      >
        {submitting ? 'Đang gửi...' : 'Gửi xác nhận'}
      </button>
    </form>
  );
}

/**
 * Interactive guestbook wish submission form matching DS03 layout.
 */
export function WishFormWidget({
  node,
  publicSlug,
  onWishCreated,
  onNotify,
}: {
  node: SceneNode;
  publicSlug?: string;
  onWishCreated: (wish: DemoWish) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}) {
  const p = node.props;
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const formEl = event.currentTarget;
    const fd = new FormData(formEl);
    const guestName = String(fd.get('guestName') || '').trim();
    const message = String(fd.get('message') || '').trim();

    if (!guestName || !message) {
      onNotify('Vui lòng nhập tên và lời chúc.', true);
      return;
    }

    setSubmitting(true);
    try {
      if (publicSlug) {
        const created = await invitationService.submitWish(publicSlug, {
          guestName,
          attendanceStatus: 'MAYBE',
          guestCount: 1,
          message,
        });
        onWishCreated({
          id: created.id,
          guestName: created.guestName,
          message: created.message,
          createdAt: created.createdAt,
        });
      } else {
        onWishCreated({
          id: String(Date.now()),
          guestName,
          message,
          isPublic: true,
          createdAt: new Date().toISOString(),
        });
      }
      onNotify('Đã gửi lời chúc thành công!');
      formEl.reset();
    } catch {
      onNotify('Không thể gửi lời chúc. Vui lòng thử lại.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const baseInput: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#1f2937',
    fontSize: p.inputFontSize || '16px',
    fontFamily: quoteFont(p.inputFontFamily || 'Montserrat, sans-serif'),
    padding: '10px 14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <form
      data-node-id={node.id}
      onSubmit={handleSubmit}
      style={{
        position: 'absolute',
        top: p.top,
        left: p.left,
        width: p.width,
        display: 'flex',
        flexDirection: 'column',
        gap: `${p.formGap ?? 10}px`,
        boxSizing: 'border-box',
      }}
    >
      <div>
        {p.showNameLabel && (
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#374151' }}>
            Tên của bạn
          </label>
        )}
        <input
          type="text"
          name="guestName"
          placeholder="Tên của bạn *"
          required
          style={{ ...baseInput, height: p.inputHeight || '50px' }}
        />
      </div>

      <div>
        {p.showWishLabel && (
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#374151' }}>
            Lời chúc
          </label>
        )}
        <textarea
          name="message"
          placeholder="Nhập lời chúc của bạn *"
          required
          style={{
            ...baseInput,
            height: p.textareaHeight || '220px',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          backgroundColor: p.buttonBackground || '#5F6459',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: paddingCss(p.buttonPadding, [15, 24, 15, 24]),
          fontFamily: quoteFont(p.buttonFontFamily),
          fontSize: p.buttonFontSize || '18px',
          fontWeight: 600,
          cursor: submitting ? 'wait' : 'pointer',
        }}
      >
        {submitting ? 'Đang gửi...' : 'Gửi lời chúc'}
      </button>
    </form>
  );
}

/**
 * Scrollable guestbook wish list preserving DS03 typography and colors.
 */
export function WishListWidget({
  node,
  wishes,
  loading,
}: {
  node: SceneNode;
  wishes: DemoWish[];
  loading: boolean;
}) {
  const p = node.props;
  return (
    <div
      data-node-id={node.id}
      style={{
        position: 'absolute',
        top: p.top,
        left: p.left,
        width: p.width,
        height: p.height || '400px',
        overflowY: 'auto',
        paddingRight: 6,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {loading && wishes.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', padding: '16px 0' }}>
          Đang tải lời chúc...
        </p>
      )}
      {!loading && wishes.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', padding: '16px 0' }}>
          Chưa có lời chúc nào
        </p>
      )}
      {wishes.map((wish) => (
        <div
          key={String(wish.id)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.86)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 8,
            padding: '12px 14px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div
            style={{
              fontFamily: quoteFont(p.wishNameFontFamily || 'Montserrat, sans-serif'),
              fontSize: p.wishNameFontSize || '16px',
              color: p.wishNameFontColor || '#5F6459',
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {wish.guestName}
          </div>
          {wish.message && (
            <div
              style={{
                fontFamily: quoteFont(p.wishContentFontFamily || 'Montserrat, sans-serif'),
                fontSize: p.wishContentFontSize || '14px',
                color: '#374151',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {wish.message}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Full-screen photo gallery modal triggered by DS03's `open-album-modal` action.
 */
export function AlbumModalOverlay({
  images,
  onClose,
}: {
  images: AlbumImageItem[];
  onClose: () => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedIdx !== null) setSelectedIdx(null);
        else onClose();
      } else if (selectedIdx !== null && e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev === null ? null : prev === 0 ? images.length - 1 : prev - 1));
      } else if (selectedIdx !== null && e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev === null ? null : prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, selectedIdx, images.length]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Album ảnh cưới"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 920,
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 20,
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            Album ảnh ({images.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng album"
            style={{
              width: 34,
              height: 34,
              borderRadius: '9999px',
              border: '1px solid #d1d5db',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {images.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              style={{
                border: 'none',
                padding: 0,
                borderRadius: 8,
                overflow: 'hidden',
                aspectRatio: '3 / 4',
                cursor: 'pointer',
                backgroundColor: '#f3f4f6',
              }}
            >
              <img
                src={item.url}
                alt={item.alt || `Ảnh ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      </div>

      {selectedIdx !== null && images[selectedIdx] && (
        <ImageLightboxOverlay
          imageUrl={images[selectedIdx].url}
          onClose={() => setSelectedIdx(null)}
          onPrev={() => setSelectedIdx(selectedIdx === 0 ? images.length - 1 : selectedIdx - 1)}
          onNext={() => setSelectedIdx(selectedIdx === images.length - 1 ? 0 : selectedIdx + 1)}
        />
      )}
    </div>
  );
}

/**
 * Full-screen lightbox overlay for `open-lightbox` image clicks.
 */
export function ImageLightboxOverlay({
  imageUrl,
  onClose,
  onPrev,
  onNext,
}: {
  imageUrl: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Ảnh trước"
          style={{
            position: 'fixed',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '9999px',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: '#111827',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          ‹
        </button>
      )}

      <img
        src={imageUrl}
        alt="Ảnh cưới"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 6 }}
      />

      {onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Ảnh tiếp theo"
          style={{
            position: 'fixed',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '9999px',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: '#111827',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          ›
        </button>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Đóng ảnh"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '9999px',
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.92)',
          color: '#111827',
          cursor: 'pointer',
          fontSize: 18,
        }}
      >
        ✕
      </button>
    </div>
  );
}
