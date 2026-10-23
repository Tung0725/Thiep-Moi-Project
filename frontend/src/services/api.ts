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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
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
