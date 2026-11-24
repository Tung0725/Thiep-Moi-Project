'use client';

import React from 'react';
import { WishesBlockProps } from '@/types/schema';
import { AttendanceStatus, WishItemResponse } from '@/types/api';
import { useGuestbook } from '@/templates/useGuestbook';

const GUEST_COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;


function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return 'Vừa xong';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatAttendanceBadge(status: AttendanceStatus, guestCount: number): string {
  if (status === 'DECLINED') {
    return 'Báo bận';
  }
  if (status === 'MAYBE') {
    return 'Chưa chắc chắn';
  }
  return guestCount > 1 ? `Tham dự (${guestCount} người)` : 'Sẽ tham dự';
}

/**
 * WishesBlock Component
 * Purpose: Hiển thị sổ lưu bút điện tử, xác nhận tham dự tiệc cưới (RSVP + số lượng khách đi cùng) và gửi lời chúc thực tế tới PostgreSQL.
 * Props:
 *   - title: Tiêu đề khối sổ lưu bút
 *   - subtitle: Mô tả phụ
 *   - slug: Định danh công khai của thiệp mời để gọi API lời chúc
 * Key States:
 *   - wishes: Danh sách lời chúc hiển thị trên giao diện
 *   - guestName, attendanceStatus, guestCount, message: Trạng thái form nhập liệu
 *   - isLoading, isLoadingMore, isSubmitting, errorMsg, isSent: Trạng thái UX tương tác API
 */
export default function WishesBlock({
  title = 'Sổ Lưu Bút & Lời Chúc',
  subtitle = 'Gửi gắm những lời chúc tốt đẹp nhất và xác nhận tham dự cùng cặp đôi',
  slug,
}: WishesBlockProps) {
  const { wishes, totalWishes, hasMore, isLoading, isLoadingMore, isSubmitting, errorMsg, isSent, guestName, attendanceStatus, guestCount, message, isDemoMode, setGuestCount, setGuestName, setMessage, handleAttendanceChange, handleSubmit, handleLoadMore } = useGuestbook(slug);

  return (
    <section className="w-full bg-white text-[#333333] py-10 px-4 text-center">
      <div className="max-w-[368px] mx-auto space-y-5">
        {/* Header Section */}
        <div>
          <h2 className="font-greatvibes text-[42px] leading-[1.25] font-normal text-[#333333]">
            {title}
          </h2>
          <p className="font-sourcesans text-[15px] text-neutral-600 mt-1">{subtitle}</p>
        </div>

        {/* Wishes & RSVP Form Container */}
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-[10px] bg-white border border-[#ADADAD] space-y-4 text-left"
        >
          {/* Guest Name Input */}
          <div>
            <label className="block font-sourcesans text-xs font-bold text-[#333333] mb-1.5">
              Tên của bạn <span className="text-[#A80606]">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="VD: Gia đình Bạn Minh & Hoa"
              className="w-full px-3.5 py-2.5 rounded-[6px] text-sm bg-white border border-[#ADADAD] text-[#333333] placeholder:text-neutral-400 focus:outline-none focus:border-[#A80606]"
            />
          </div>

          {/* RSVP Attendance Status Selector */}
          <div>
            <label className="block font-sourcesans text-xs font-bold text-[#333333] mb-1.5">
              Xác nhận tham dự tiệc cưới:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'ATTENDING', label: 'Sẽ tham dự' },
                  { value: 'DECLINED', label: 'Không thể tham dự' },
                ] as const
              ).map((option) => {
                const isSelected = attendanceStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAttendanceChange(option.value)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--template-primary, #A80606)',
                            borderColor: 'var(--template-primary, #A80606)',
                            color: '#FFFFFF',
                          }
                        : undefined
                    }
                    className={`py-2 px-3 rounded-[6px] font-sourcesans text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'shadow-sm'
                        : 'bg-white text-[#333333] border-[#ADADAD] hover:bg-neutral-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Count Selector (Visible only when ATTENDING) */}
          {attendanceStatus === 'ATTENDING' && (
            <div>
              <label className="block font-sourcesans text-xs font-bold text-[#333333] mb-1.5">
                Số lượng người tham dự (bao gồm bạn):
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {GUEST_COUNT_OPTIONS.map((count) => {
                  const isActive = guestCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGuestCount(count)}
                      style={
                        isActive
                          ? {
                              backgroundColor: 'var(--template-primary, #A80606)',
                              borderColor: 'var(--template-primary, #A80606)',
                              color: '#FFFFFF',
                            }
                          : undefined
                      }
                      className={`py-1.5 rounded-[6px] font-sourcesans text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'shadow-sm'
                          : 'bg-white text-[#333333] border-[#ADADAD] hover:bg-neutral-50'
                      }`}
                    >
                      {count} người
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wish Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-sourcesans text-xs font-bold text-[#333333]">
                Lời chúc gửi tới dâu rể:
              </label>
              <span className="text-[11px] text-neutral-500">{message.length}/500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chúc mừng hạnh phúc đôi bạn trẻ (không bắt buộc nếu chỉ xác nhận tham dự)..."
              className="w-full px-3.5 py-2.5 rounded-[6px] text-sm bg-white border border-[#ADADAD] text-[#333333] placeholder:text-neutral-400 focus:outline-none focus:border-[#A80606] resize-none"
            />
          </div>

          {/* Error & Success Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isSent && (
            <div className="p-3 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              Cảm ơn bạn! Phản hồi và lời chúc đã được gửi tới cô dâu chú rể.
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--template-primary, #A80606)',
              color: '#FFFFFF',
            }}
            className="w-full h-[40px] rounded-[5px] font-sourcesans text-sm font-bold shadow-sm hover:opacity-90 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-1 uppercase"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang gửi phản hồi...</span>
              </>
            ) : isSent ? (
              <span>Đã Gửi Lời Chúc ✓</span>
            ) : (
              <span>Gửi Lời Chúc &amp; Xác Nhận</span>
            )}
          </button>
        </form>

        {/* Wishes Feed Section */}
        <div className="space-y-3 text-left pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-sourcesans text-xs font-bold text-[#333333]">
              Lời chúc từ khách mời ({totalWishes})
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-20 w-full rounded-[10px] bg-neutral-100 animate-pulse border border-[#E5E5E5]"
                />
              ))}
            </div>
          ) : wishes.length === 0 ? (
            <div className="p-6 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-center text-xs text-neutral-600">
              Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc phúc tới cặp đôi nhé!
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 rounded-[10px] bg-white border border-[#D6D6D6] text-xs sm:text-sm space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-sourcesans font-bold text-[#333333]">{w.guestName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          w.attendanceStatus === 'DECLINED'
                            ? 'bg-neutral-200 text-neutral-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {formatAttendanceBadge(w.attendanceStatus, w.guestCount)}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500">{formatRelativeTime(w.createdAt)}</span>
                  </div>

                  {w.message ? (
                    <p className="font-sourcesans text-[#333333] leading-relaxed whitespace-pre-line">
                      {w.message}
                    </p>
                  ) : (
                    <p className="font-sourcesans text-neutral-500 italic text-xs">
                      {w.attendanceStatus === 'DECLINED'
                        ? 'Đã gửi thông báo cáo lỗi không thể tham dự.'
                        : 'Đã xác nhận tham dự tiệc cưới.'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Load More Pagination Button */}
          {hasMore && !isDemoMode && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-5 py-2 rounded-full border border-[#ADADAD] text-xs font-bold text-[#333333] hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? 'Đang tải thêm...' : 'Xem thêm lời chúc'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
