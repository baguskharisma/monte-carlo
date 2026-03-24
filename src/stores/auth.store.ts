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
 * Cookie storage helper
 * Sync auth state to cookies for middleware access
 */
const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const value = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return value ? decodeURIComponent(value) : null;
  },
  setItem: (name: string, value: string, maxAge?: number): void => {
    if (typeof window === 'undefined') return;
    // Default to 30 days if not specified
    const age = maxAge ?? 2592000;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${age}; SameSite=Lax`;
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

/**
 * Sync auth state to cookie
 */
const syncToCookie = (state: Partial<AuthStore>, rememberMe: boolean = true) => {
  const cookieData = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  };
  // If remember me is false, cookie expires in 24 hours (86400 seconds)
  // If remember me is true, cookie expires in 30 days (2592000 seconds)
  const maxAge = rememberMe ? 2592000 : 86400;
  cookieStorage.setItem('monte-carlo-auth', JSON.stringify(cookieData), maxAge);
};

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
      login: async (phone: string, password: string, rememberMe: boolean = false) => {
        try {
          set({ isLoading: true });

          const response = await authService.login(phone, password);

          // Store tokens in localStorage
          tokenManager.setTokens(response.accessToken, response.refreshToken);

          // Update store state
          const newState = {
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };

          set(newState);

          // Sync to cookie for middleware with remember me setting
          syncToCookie(newState, rememberMe);
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

          // Clear cookie
          cookieStorage.removeItem('monte-carlo-auth');

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
        const newState = { user, isAuthenticated: true };
        set(newState);
        syncToCookie(newState);
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        tokenManager.setTokens(accessToken, refreshToken);
        const newState = {
          accessToken,
          refreshToken,
          isAuthenticated: true,
        };
        set(newState);
        syncToCookie(newState);
      },

      clearAuth: () => {
        tokenManager.clearTokens();
        cookieStorage.removeItem('monte-carlo-auth');
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

// Individual action selectors to avoid infinite loops
export const useLogin = () => useAuthStore((state) => state.login);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useSetUser = () => useAuthStore((state) => state.setUser);
export const useSetTokens = () => useAuthStore((state) => state.setTokens);
export const useClearAuth = () => useAuthStore((state) => state.clearAuth);
export const useHydrate = () => useAuthStore((state) => state.hydrate);
