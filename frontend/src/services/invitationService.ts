import api from './api';
import { PageSchema } from '@/types/schema';

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
};
