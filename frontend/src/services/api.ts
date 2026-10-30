import {
  ApiResponse,
  TemplateResponse,
  InvitationResponse,
  PublicCardResponse,
  WishResponse,
  CreateInvitationRequest,
  UpdateSchemaRequest,
  SubmitWishRequest,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
      }
    } catch {
      // Bỏ qua lỗi làm mới ngầm nếu mạng bị gián đoạn
    }
  }

  if (!response.ok) {
    try {
      const errorResult: ApiResponse<unknown> = await response.json();
      throw new Error(errorResult.message || `Lỗi API: ${response.statusText}`);
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.startsWith('Lỗi API')) {
        throw err;
      }
      throw new Error(`Lỗi kết nối máy chủ: ${response.statusText}`);
    }
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

export const templateService = {
  getTemplates: (): Promise<TemplateResponse[]> => fetchApi<TemplateResponse[]>('/templates'),
  getTemplateById: (id: string): Promise<TemplateResponse> => fetchApi<TemplateResponse>(`/templates/${id}`),
};

export const invitationService = {
  createInvitation: (payload: CreateInvitationRequest): Promise<InvitationResponse> =>
    fetchApi<InvitationResponse>('/invitations', { method: 'POST', body: JSON.stringify(payload) }),
  getInvitationById: (id: string): Promise<InvitationResponse> => fetchApi<InvitationResponse>(`/invitations/${id}`),
  updateSchema: (id: string, payload: UpdateSchemaRequest): Promise<InvitationResponse> =>
    fetchApi<InvitationResponse>(`/invitations/${id}/schema`, { method: 'PUT', body: JSON.stringify(payload) }),
  publishInvitation: (id: string): Promise<InvitationResponse> =>
    fetchApi<InvitationResponse>(`/invitations/${id}/publish`, { method: 'POST' }),
};

export const publicCardService = {
  getCardBySlug: (slug: string): Promise<PublicCardResponse> => fetchApi<PublicCardResponse>(`/public/cards/${slug}`),
  getWishes: (slug: string): Promise<WishResponse[]> => fetchApi<WishResponse[]>(`/public/cards/${slug}/wishes`),
  submitWish: (slug: string, payload: SubmitWishRequest): Promise<WishResponse> =>
    fetchApi<WishResponse>(`/public/cards/${slug}/wishes`, { method: 'POST', body: JSON.stringify(payload) }),
};

const api = {
  get: async <T>(endpoint: string) => ({ data: await fetchApi<T>(endpoint) }),
  post: async <T>(endpoint: string, body?: unknown) => ({
    data: await fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  }),
  put: async <T>(endpoint: string, body?: unknown) => ({
    data: await fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  }),
  delete: async <T>(endpoint: string) => ({
    data: await fetchApi<T>(endpoint, { method: 'DELETE' }),
  }),
};

export default api;

