import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  setUser: (user: User | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      tokens: { accessToken: null, refreshToken: null },

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      setTokens: (tokens) => {
        set({ tokens });
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, tokens: { accessToken: null, refreshToken: null } });
      },

      hasPermission: (module, action) => {
        const { user } = get();
        if (!user) return false;
        if (user.role.name === 'SUPER_ADMIN') return true;
        return user.permissions.some(p => p.module === module && p.action === action);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ tokens: state.tokens }),
    }
  )
);
