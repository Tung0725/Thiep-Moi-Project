import { PageSchema } from './schema';

/**
 * Standard generic response wrapper from backend (com.wedding.common.dto.response.ApiResponse)
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface TemplateResponse {
  id: string;
  name: string;
  thumbnailUrl: string;
  category: string;
  defaultSchema: PageSchema;
  createdAt: string;
}

export type InvitationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface InvitationResponse {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  slug?: string;
  status: InvitationStatus;
  contentSchema: PageSchema;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCardResponse {
  id: string;
  title: string;
  slug: string;
  contentSchema: PageSchema;
  viewCount: number;
}

export type AttendanceStatus = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';

export interface WishResponse {
  id: string;
  senderName: string;
  attendance: AttendanceStatus;
  message: string;
  createdAt: string;
}

export interface SubmitWishRequest {
  senderName: string;
  attendance: AttendanceStatus;
  message: string;
}

export interface CreateInvitationRequest {
  templateId: string;
  title?: string;
}

export interface UpdateSchemaRequest {
  contentSchema: PageSchema;
}
