'use client';

import React from 'react';
import { WishesBlockProps } from '@/types/schema';
import { useGuestbook } from '@/hooks/useGuestbook';
import styles from './styles.module.css';

/** Minimalism guestbook presentation; props supply title and slug, the shared hook owns persistence and form state. */
export default function Wishes({ title = 'Sổ lưu bút', slug }: WishesBlockProps) {
  const state = useGuestbook(slug);
  return (
    <section className={styles.guestbook}>
      {/* Guestbook and RSVP form */}
      <h2>{title}</h2>
      <form onSubmit={state.handleSubmit}>
        <label>Tên của bạn<input required maxLength={100} value={state.guestName} onChange={event => state.setGuestName(event.target.value)} placeholder="Tên của bạn" /></label>
        <label>Lời chúc<textarea maxLength={500} rows={3} value={state.message} onChange={event => state.setMessage(event.target.value)} placeholder="Gửi lời chúc đến cô dâu, chú rể" /></label>
        <label>Xác nhận tham dự<select value={state.attendanceStatus} onChange={event => state.handleAttendanceChange(event.target.value as 'ATTENDING' | 'DECLINED' | 'MAYBE')}><option value="ATTENDING">Sẽ tham dự</option><option value="DECLINED">Không thể tham dự</option><option value="MAYBE">Chưa chắc chắn</option></select></label>
        {state.attendanceStatus === 'ATTENDING' && <label>Số người tham dự<select value={state.guestCount} onChange={event => state.setGuestCount(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(count => <option key={count} value={count}>{count} người</option>)}</select></label>}
        {state.errorMsg && <p role="alert">{state.errorMsg}</p>}
        {state.isSent && <p role="status">Cảm ơn bạn! Lời chúc và phản hồi đã được gửi.</p>}
        <button className={styles.button} disabled={state.isSubmitting || state.isLoading}>{state.isSubmitting ? 'Đang gửi…' : 'GỬI LỜI CHÚC'}</button>
      </form>
      {/* Persisted wishes */}
      {state.isLoading ? <p role="status">Đang tải lời chúc…</p> : state.wishes.length === 0 ? <p>Hãy gửi lời chúc đầu tiên đến cặp đôi.</p> : <div className={styles.wishFeed}>{state.wishes.map(wish => <article key={wish.id}><strong>{wish.guestName}</strong><p>{wish.message || 'Đã gửi phản hồi tham dự.'}</p></article>)}</div>}
      {state.hasMore && <button className={styles.button} disabled={state.isLoadingMore} onClick={state.handleLoadMore}>{state.isLoadingMore ? 'Đang tải…' : 'Xem thêm lời chúc'}</button>}
    </section>
  );
}
