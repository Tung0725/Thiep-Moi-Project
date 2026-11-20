'use client';

import { useState, useEffect, useCallback } from 'react';
import { AttendanceStatus, WishItemResponse } from '@/types/api';
import { invitationService } from '@/services/invitationService';

const PAGE_SIZE = 10;
const DEFAULT_DEMO_WISHES: WishItemResponse[] = [
  {
    id: -1,
    guestName: 'Gia đình Bác Hùng',
    attendanceStatus: 'ATTENDING',
    guestCount: 2,
    message: 'Chúc hai cháu trăm năm hạnh phúc, sớm có quý tử và luôn ngập tràn tiếng cười!',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: -2,
    guestName: 'Hội Bạn Thân Đại Học',
    attendanceStatus: 'ATTENDING',
    guestCount: 4,
    message: 'Chúc đôi bạn trẻ viên mãn, cùng nhau bước qua mọi chặng đường tươi đẹp phía trước!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];


/** Shared guestbook persistence and form state; template packages own presentation. */
export function useGuestbook(slug?: string) {
  const [wishes, setWishes] = useState<WishItemResponse[]>([]);
  const [totalWishes, setTotalWishes] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSent, setIsSent] = useState<boolean>(false);

  const [guestName, setGuestName] = useState<string>('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('ATTENDING');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [message, setMessage] = useState<string>('');

  const fetchInitialWishes = useCallback(async () => {
    if (!slug) {
      setWishes(DEFAULT_DEMO_WISHES);
      setTotalWishes(DEFAULT_DEMO_WISHES.length);
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const pageData = await invitationService.getWishes(slug, 0, PAGE_SIZE);
      setWishes(pageData.content || []);
      setTotalWishes(pageData.totalElements ?? (pageData.content?.length || 0));
      setCurrentPage(0);
      setHasMore(!pageData.last);
      setIsDemoMode(false);
    } catch {
      setWishes([]);
      setTotalWishes(0);
      setHasMore(false);
      setIsDemoMode(false);
      setErrorMsg('Không thể tải lời chúc. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchInitialWishes();
  }, [fetchInitialWishes]);

  const handleLoadMore = async () => {
    if (!slug || isDemoMode || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const pageData = await invitationService.getWishes(slug, nextPage, PAGE_SIZE);
      setWishes((prev) => [...prev, ...(pageData.content || [])]);
      setCurrentPage(nextPage);
      setHasMore(!pageData.last);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể tải thêm lời chúc.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAttendanceChange = (status: AttendanceStatus) => {
    setAttendanceStatus(status);
    if (status === 'DECLINED') {
      setGuestCount(0);
    } else if (guestCount < 1) {
      setGuestCount(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = guestName.trim();
    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập tên của bạn.');
      return;
    }

    const effectiveCount = attendanceStatus === 'DECLINED' ? 0 : Math.max(1, guestCount);
    const trimmedMessage = message.trim();

    if (!slug || isDemoMode) {
      const demoItem: WishItemResponse = {
        id: Date.now(),
        guestName: trimmedName,
        attendanceStatus,
        guestCount: effectiveCount,
        message: trimmedMessage || null,
        createdAt: new Date().toISOString(),
      };
      setWishes((prev) => [demoItem, ...prev]);
      setTotalWishes((prev) => prev + 1);
      setGuestName('');
      setMessage('');
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3500);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await invitationService.submitWish(slug, {
        guestName: trimmedName,
        attendanceStatus,
        guestCount: effectiveCount,
        message: trimmedMessage || undefined,
      });

      setWishes((prev) => [created, ...prev]);
      setTotalWishes((prev) => prev + 1);
      setGuestName('');
      setMessage('');
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể gửi lời chúc, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { wishes, totalWishes, hasMore, isLoading, isLoadingMore, isSubmitting, errorMsg, isSent, guestName, attendanceStatus, guestCount, message, isDemoMode, setGuestName, setMessage, setGuestCount, handleAttendanceChange, handleSubmit, handleLoadMore };
}
