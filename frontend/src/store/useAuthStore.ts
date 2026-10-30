import { create } from 'zustand';
import { UserResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<UserResponse>;
  register: (payload: RegisterRequest) => Promise<UserResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: UserResponse | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,

  setUser: (user: UserResponse | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  login: async (payload: LoginRequest) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(payload);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const user = await authService.register(payload);
      set({ isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    if (get().isInitialized && get().isAuthenticated) {
      return;
    }

    try {
      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch {
      try {
        const refreshedUser = await authService.refreshToken();
        set({
          user: refreshedUser,
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch {
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
