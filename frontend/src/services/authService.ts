import { ApiResponse } from '@/types/api';
import { LoginRequest, RegisterRequest, UserResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * authService
 * Purpose: Cung cấp các hàm tương tác API xác thực sử dụng HttpOnly Cookie (Credentials: include).
 * Không lưu trữ access token hoặc refresh token trực tiếp trong localStorage để chống tấn công XSS.
 */
export const authService = {
  async register(payload: RegisterRequest): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const result: ApiResponse<UserResponse> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Đăng ký tài khoản không thành công');
    }

    return result.data;
  },

  async verifyEmail(token: string): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      credentials: 'include',
    });

    const result: ApiResponse<UserResponse> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Mã kích hoạt không hợp lệ hoặc đã hết hạn');
    }

    return result.data;
  },

  async resendVerification(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      credentials: 'include',
    });

    const result: ApiResponse<void> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Không thể gửi lại email kích hoạt lúc này');
    }
  },

  async login(payload: LoginRequest): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const result: ApiResponse<UserResponse> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Đăng nhập không thành công');
    }

    return result.data;
  },

  async refreshToken(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const result: ApiResponse<UserResponse> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Phiên làm việc đã hết hạn');
    }

    return result.data;
  },

  async getMe(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    const result: ApiResponse<UserResponse> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Không thể tải thông tin tài khoản');
    }

    return result.data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Bỏ qua lỗi kết nối mạng khi logout để luôn xóa trạng thái client
    }
  },
};
