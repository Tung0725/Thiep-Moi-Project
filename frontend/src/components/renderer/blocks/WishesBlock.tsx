'use client';

import React, { useState } from 'react';
import { WishesBlockProps } from '@/types/schema';

interface WishMessage {
  id: string;
  sender: string;
  content: string;
  attendance: string;
  time: string;
}

const DEFAULT_WISHES: WishMessage[] = [
  {
    id: '1',
    sender: 'Gia đình Bác Hùng',
    content: 'Chúc hai cháu trăm năm hạnh phúc, sớm có quý tử và luôn ngập tràn tiếng cười!',
    attendance: 'Sẽ tham dự',
    time: 'Vừa xong',
  },
  {
    id: '2',
    sender: 'Hội Bạn Thân Đại Học',
    content: 'Chúc đôi bạn trẻ viên mãn, cùng nhau bước qua mọi chặng đường tươi đẹp phía trước!',
    attendance: 'Sẽ tham dự',
    time: '2 giờ trước',
  },
];

/**
 * WishesBlock Component
 * Purpose: Hiển thị sổ lưu bút điện tử, xác nhận tham dự tiệc cưới (RSVP) và các lời chúc ấm áp.
 * Props: WishesBlockProps
 * Key States:
 *   - wishes: Danh sách lời chúc hiện hành.
 *   - senderName: Tên khách gửi.
 *   - message: Nội dung lời chúc.
 *   - rsvp: Trạng thái phản hồi tham dự ('YES' | 'MAYBE' | 'NO').
 */
export default function WishesBlock({
  title = 'Sổ Lưu Bút & Lời Chúc',
  subtitle = 'Gửi gắm những lời chúc tốt đẹp nhất đến cặp đôi',
}: WishesBlockProps) {
  const [wishes, setWishes] = useState<WishMessage[]>(DEFAULT_WISHES);
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState<'Sẽ tham dự' | 'Không thể tham dự'>('Sẽ tham dự');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    const newWish: WishMessage = {
      id: String(Date.now()),
      sender: senderName.trim(),
      content: message.trim(),
      attendance,
      time: 'Vừa xong',
    };

    setWishes([newWish, ...wishes]);
    setSenderName('');
    setMessage('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 text-center">
      <div className="max-w-[340px] sm:max-w-[500px] md:max-w-[560px] mx-auto space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-current">{title}</h2>
          <p className="text-xs sm:text-sm opacity-80 mt-1">{subtitle}</p>
        </div>

        {/* Wishes Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-black/40 border border-current/15 shadow-md space-y-3.5 text-left">
          <div>
            <label className="block text-xs font-bold text-current/90 mb-1.5">
              Tên của bạn:
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="VD: Bạn Minh &amp; Hoa"
              className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-current/20 text-[#2d2d2d] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-current/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-current/90 mb-1.5">
              Lời chúc gửi tới dâu rể:
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chúc mừng hạnh phúc đôi bạn trẻ..."
              className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-current/20 text-[#2d2d2d] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-current/20 resize-none"
            />
          </div>

          {/* RSVP Selector */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-current/90 mb-1.5">Xác nhận tham dự:</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Sẽ tham dự', 'Không thể tham dự'] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setAttendance(choice)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    attendance === choice
                      ? 'bg-current text-white border-current shadow-sm'
                      : 'bg-transparent text-current/70 border-current/20'
                  }`}
                  style={attendance === choice ? { color: '#fff' } : {}}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-current text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition cursor-pointer mt-2"
            style={{ color: '#fff' }}
          >
            {isSent ? 'Đã Gửi Lời Chúc ✓' : 'Gửi Lời Chúc Mừng'}
          </button>
        </form>

        {/* Existing Wishes Feed */}
        <div className="space-y-3 text-left pt-2">
          {wishes.map((w) => (
            <div key={w.id} className="p-4 rounded-2xl bg-white/75 dark:bg-black/30 border border-current/10 text-xs sm:text-sm space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-current">{w.sender}</span>
                <span className="text-[11px] opacity-60">{w.time}</span>
              </div>
              <p className="text-current/90 leading-relaxed">{w.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
