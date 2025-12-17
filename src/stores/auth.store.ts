/**
 * Authentication State Management Store
 * Uses Zustand with persist middleware for auth state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import { tokenManager } from '@/lib/api';
import type { AuthStore } from '@/types/auth.types';
import type { User } from '@/types/user.types';

/**
 * Create Auth Store with Zustand
 * Persists user and tokens to localStorage
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (phone: string, password: string) => {
        try {
          set({ isLoading: true });

          const response = await authService.login(phone, password);

          // Store tokens in localStorage
          tokenManager.setTokens(response.accessToken, response.refreshToken);

          // Update store state
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          // Clear tokens
          tokenManager.clearTokens();

          // Reset store state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        tokenManager.setTokens(accessToken, refreshToken);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        tokenManager.clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      hydrate: () => {
        // Check if tokens exist in localStorage
        const accessToken = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();

        if (accessToken && refreshToken) {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'monte-carlo-auth', // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user and tokens, not loading state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Selector hooks for better performance
 */
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
    setTokens: state.setTokens,
    clearAuth: state.clearAuth,
    hydrate: state.hydrate,
  }));
