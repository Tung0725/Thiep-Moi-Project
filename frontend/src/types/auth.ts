export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'LOCKED';
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}
