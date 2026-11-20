import api from './api';
import { PageSchema } from '@/types/schema';
import { PageResponse, SubmitWishPayload, WishItemResponse } from '@/types/api';

export interface CustomWeddingData {
  groomName: string;
  brideName: string;
  groomPhone: string;
  bridePhone: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  coverImageUrl: string;
}

export interface QuickCreatePayload {
  templateId?: string;
  groomName: string;
  brideName: string;
  phoneNumber?: string;
  eventDate: string;
  eventTime?: string;
  venueName: string;
  venueAddress?: string;
  coverImageUrl?: string;
  contentSchema: string;
}

export interface InvitationResult {
  id: number;
  slug: string;
  templateId: string;
  title: string;
  publicUrl: string;
}

export interface PublicCardResult {
  slug: string;
  title: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  venueName: string;
  contentSchema: string;
}

export const invitationService = {
  /**
   * Tạo nhanh thiệp cưới từ thông tin tùy biến của khách
   */
  async quickCreate(data: CustomWeddingData, schema: PageSchema, templateId?: string): Promise<InvitationResult> {
    const payload: QuickCreatePayload = {
      templateId,
      groomName: data.groomName,
      brideName: data.brideName,
      phoneNumber: data.groomPhone || data.bridePhone,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      coverImageUrl: data.coverImageUrl,
      contentSchema: JSON.stringify(schema),
    };

    const response = await api.post<InvitationResult>('/public/invitations/quick-create', payload);
    return response.data;
  },

  /**
   * Lấy dữ liệu schema thiệp mời công khai từ backend theo slug
   */
  async getPublicCard(slug: string): Promise<PublicCardResult> {
    const response = await api.get<PublicCardResult>(`/public/invitations/${slug}`);
    return response.data;
  },

  /**
   * Gửi phản hồi xác nhận tham dự tiệc cưới (RSVP) và lời chúc mới cho thiệp
   */
  async submitWish(slug: string, payload: SubmitWishPayload): Promise<WishItemResponse> {
    const response = await api.post<WishItemResponse>(
      `/public/invitations/${encodeURIComponent(slug)}/wishes`,
      payload
    );
    return response.data;
  },

  /**
   * Lấy danh sách lời chúc phân trang của thiệp cưới theo slug
   */
  async getWishes(slug: string, page = 0, size = 10): Promise<PageResponse<WishItemResponse>> {
    const response = await api.get<PageResponse<WishItemResponse>>(
      `/public/invitations/${encodeURIComponent(slug)}/wishes?page=${page}&size=${size}`
    );
    return response.data;
  },
};
