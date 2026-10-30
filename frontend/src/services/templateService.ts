import api from './api';
import {
  TemplateSummaryResponse,
  TemplateDetailResponse,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  CloneTemplatePayload,
} from '@/types/api';

/**
 * Service quản lý các yêu cầu API liên quan đến Mẫu thiệp (Templates)
 * Hỗ trợ các thao tác CRUD và Clone cho Template Studio.
 */
export const templateService = {
  /**
   * Lấy danh sách tóm tắt tất cả các mẫu thiệp có sẵn (hỗ trợ lọc theo category)
   */
  async getTemplates(category?: string): Promise<TemplateSummaryResponse[]> {
    const endpoint = category ? `/templates?category=${encodeURIComponent(category)}` : '/templates';
    const response = await api.get<TemplateSummaryResponse[]>(endpoint);
    return response.data;
  },

  /**
   * Lấy chi tiết mẫu thiệp (bao gồm toàn bộ JSON Schema và dữ liệu mặc định) theo code hoặc ID
   */
  async getTemplateByCodeOrId(codeOrId: string | number): Promise<TemplateDetailResponse> {
    const response = await api.get<TemplateDetailResponse>(`/templates/${codeOrId}`);
    return response.data;
  },

  /**
   * Tạo một mẫu thiệp mới từ Studio Editor
   */
  async createTemplate(payload: CreateTemplatePayload): Promise<TemplateDetailResponse> {
    const response = await api.post<TemplateDetailResponse>('/templates', payload);
    return response.data;
  },

  /**
   * Nhân bản (1-click clone) một mẫu thiết kế có sẵn thành mẫu mới
   */
  async cloneTemplate(sourceId: number, payload: CloneTemplatePayload): Promise<TemplateDetailResponse> {
    const response = await api.post<TemplateDetailResponse>(`/templates/${sourceId}/clone`, payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin hoặc cấu trúc JSON Schema của mẫu thiệp
   */
  async updateTemplate(id: number, payload: UpdateTemplatePayload): Promise<TemplateDetailResponse> {
    const response = await api.put<TemplateDetailResponse>(`/templates/${id}`, payload);
    return response.data;
  },
};

export default templateService;
