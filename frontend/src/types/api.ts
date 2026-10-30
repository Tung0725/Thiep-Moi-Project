import { PageSchema } from './schema';

/**
 * Standard generic response wrapper from backend (com.wedding.common.dto.response.ApiResponse)
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface TemplateSummaryResponse {
  id: number;
  code: string;
  title: string;
  category: string;
  categoryLabel?: string;
  style?: string;
  badge?: string;
  imageUrl?: string;
  description?: string;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
}

export interface TemplateDetailResponse extends TemplateSummaryResponse {
  forkedFromId?: number;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  defaultData?: string;
  contentSchema: string; // JSON string of PageSchema
  updatedAt?: string;
}

export interface CreateTemplatePayload {
  code: string;
  title: string;
  category: string;
  categoryLabel?: string;
  style?: string;
  badge?: string;
  imageUrl?: string;
  description?: string;
  defaultData?: string;
  contentSchema: string;
}

export interface UpdateTemplatePayload {
  title?: string;
  category?: string;
  categoryLabel?: string;
  style?: string;
  badge?: string;
  imageUrl?: string;
  description?: string;
  defaultData?: string;
  contentSchema?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface CloneTemplatePayload {
  newCode: string;
  newTitle: string;
}

// Deprecated alias for backwards compatibility
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
