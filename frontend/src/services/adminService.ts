import api from './api';
import { InvitationStatus, PageResponse } from '@/types/api';
import { UserRole } from '@/types/auth';
import {
  AdminDashboardStatsResponse,
  AdminInvitationResponse,
  AdminInvitationsQuery,
  AdminTemplateResponse,
  AdminTemplatesQuery,
  AdminUpdateTemplateMetaPayload,
  AdminUserResponse,
  AdminUsersQuery,
  AdminUserStatusUpdate,
  AdminWishResponse,
  AdminWishesQuery,
  TemplateStatus,
} from '@/types/admin';

function buildQueryString(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value).trim());
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * adminService
 * Purpose: Tập trung toàn bộ 12 lời gọi HTTP quản trị (/admin/**) khớp hợp đồng ADM-01..ADM-12.
 * Mọi component UI trong phân hệ /admin đều đi qua service này thay vì gọi fetch trực tiếp.
 */
export const adminService = {
  /** ADM-01: Lấy tổng hợp KPI hệ thống và danh sách hoạt động gần đây */
  async getDashboardStats(): Promise<AdminDashboardStatsResponse> {
    const res = await api.get<AdminDashboardStatsResponse>('/admin/dashboard/stats');
    return res.data;
  },

  /** ADM-02: Lấy danh sách người dùng có lọc và phân trang */
  async getUsers(params?: AdminUsersQuery): Promise<PageResponse<AdminUserResponse>> {
    const query = buildQueryString(params as Record<string, string | number | undefined>);
    const res = await api.get<PageResponse<AdminUserResponse>>(`/admin/users${query}`);
    return res.data;
  },

  /** ADM-03: Khóa hoặc mở khóa tài khoản người dùng */
  async updateUserStatus(id: string, status: AdminUserStatusUpdate): Promise<AdminUserResponse> {
    const res = await api.patch<AdminUserResponse>(`/admin/users/${encodeURIComponent(id)}/status`, {
      status,
    });
    return res.data;
  },

  /** ADM-04: Cập nhật vai trò người dùng (ROLE_USER <-> ROLE_ADMIN) */
  async updateUserRole(id: string, role: UserRole): Promise<AdminUserResponse> {
    const res = await api.patch<AdminUserResponse>(`/admin/users/${encodeURIComponent(id)}/role`, {
      role,
    });
    return res.data;
  },

  /** ADM-05: Lấy danh sách mẫu thiệp ở mọi trạng thái có lọc và phân trang */
  async getTemplates(params?: AdminTemplatesQuery): Promise<PageResponse<AdminTemplateResponse>> {
    const query = buildQueryString(params as Record<string, string | number | undefined>);
    const res = await api.get<PageResponse<AdminTemplateResponse>>(`/admin/templates${query}`);
    return res.data;
  },

  /** ADM-06: Đổi nhanh trạng thái hiển thị của mẫu thiệp */
  async updateTemplateStatus(id: number, status: TemplateStatus): Promise<AdminTemplateResponse> {
    const res = await api.patch<AdminTemplateResponse>(`/admin/templates/${id}/status`, {
      status,
    });
    return res.data;
  },

  /** ADM-07: Cập nhật metadata quản trị của mẫu thiệp */
  async updateTemplateMeta(
    id: number,
    payload: AdminUpdateTemplateMetaPayload,
  ): Promise<AdminTemplateResponse> {
    const res = await api.put<AdminTemplateResponse>(`/admin/templates/${id}`, payload);
    return res.data;
  },

  /** ADM-08: Lấy danh sách thiệp mời toàn hệ thống có lọc và phân trang */
  async getInvitations(params?: AdminInvitationsQuery): Promise<PageResponse<AdminInvitationResponse>> {
    const query = buildQueryString(params as Record<string, string | number | undefined>);
    const res = await api.get<PageResponse<AdminInvitationResponse>>(`/admin/invitations${query}`);
    return res.data;
  },

  /** ADM-09: Đổi trạng thái hiển thị của thiệp mời */
  async updateInvitationStatus(
    id: number,
    status: InvitationStatus,
  ): Promise<AdminInvitationResponse> {
    const res = await api.patch<AdminInvitationResponse>(`/admin/invitations/${id}/status`, {
      status,
    });
    return res.data;
  },

  /** ADM-10: Xóa vĩnh viễn thiệp mời cùng toàn bộ lời chúc liên quan */
  async deleteInvitation(id: number): Promise<void> {
    await api.delete<void>(`/admin/invitations/${id}`);
  },

  /** ADM-11: Lấy danh sách lời chúc & RSVP toàn hệ thống có lọc và phân trang */
  async getWishes(params?: AdminWishesQuery): Promise<PageResponse<AdminWishResponse>> {
    const query = buildQueryString(params as Record<string, string | number | undefined>);
    const res = await api.get<PageResponse<AdminWishResponse>>(`/admin/wishes${query}`);
    return res.data;
  },

  /** ADM-12: Xóa vĩnh viễn một lời chúc spam theo ID */
  async deleteWish(id: number): Promise<void> {
    await api.delete<void>(`/admin/wishes/${id}`);
  },
};
