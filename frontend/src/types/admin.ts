import { AttendanceStatus, InvitationStatus, PageResponse } from './api';
import { UserRole, UserStatus } from './auth';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AdminUserStatusUpdate = 'ACTIVE' | 'LOCKED';

export interface AdminUserStats {
  total: number;
  active: number;
  locked: number;
  pendingVerification: number;
  admins: number;
}

export interface AdminTemplateStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface AdminInvitationStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface AdminWishStats {
  total: number;
  attending: number;
  declined: number;
  maybe: number;
  totalExpectedGuests: number;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  invitationCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminTemplateResponse {
  id: number;
  code: string;
  title: string;
  category: string;
  categoryLabel?: string | null;
  style?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  version: number;
  status: TemplateStatus;
  viewsCount: number;
  likesCount: number;
  invitationCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminUpdateTemplateMetaPayload {
  title?: string;
  category?: string;
  categoryLabel?: string;
  style?: string;
  badge?: string;
  imageUrl?: string;
  description?: string;
  status?: TemplateStatus;
}

export interface AdminInvitationResponse {
  id: number;
  slug: string;
  publicUrl?: string | null;
  templateId: string;
  title?: string | null;
  groomName?: string | null;
  brideName?: string | null;
  phoneNumber?: string | null;
  eventDate?: string | null;
  venueName?: string | null;
  status: InvitationStatus;
  userId?: string | null;
  ownerEmail?: string | null;
  ownerFullName?: string | null;
  wishCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminWishResponse {
  id: number;
  invitationId: number;
  invitationSlug: string;
  invitationTitle?: string | null;
  guestName: string;
  attendanceStatus: AttendanceStatus;
  guestCount: number;
  message?: string | null;
  createdAt: string;
}

export interface AdminDashboardStatsResponse {
  users: AdminUserStats;
  templates: AdminTemplateStats;
  invitations: AdminInvitationStats;
  wishes: AdminWishStats;
  recentInvitations: AdminInvitationResponse[];
  recentUsers: AdminUserResponse[];
}

export interface AdminUsersQuery {
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  page?: number;
  size?: number;
}

export interface AdminTemplatesQuery {
  search?: string;
  status?: TemplateStatus | '';
  category?: string;
  page?: number;
  size?: number;
}

export interface AdminInvitationsQuery {
  search?: string;
  status?: InvitationStatus | '';
  templateId?: string;
  page?: number;
  size?: number;
}

export interface AdminWishesQuery {
  search?: string;
  attendanceStatus?: AttendanceStatus | '';
  invitationId?: number | string;
  page?: number;
  size?: number;
}

export type AdminPageResponse<T> = PageResponse<T>;
