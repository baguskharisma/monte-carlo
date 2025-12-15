'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, getCurrentUser, register } from '@/services/auth.service';
import { clearAuth, tokenManager } from '@/lib/axios';
import { User } from '@/lib/api-types';

/**
 * Custom hook untuk authentication
 *
 * @example
 * const { user, isAuthenticated, login, logout, loading } = useAuth();
 *
 * const handleLogin = async () => {
 *   await login('081234567890', 'password');
 * };
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Use token manager to check authentication
      if (!tokenManager.hasTokens()) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Check if access token is valid
      if (!tokenManager.isAccessTokenValid()) {
        setIsAuthenticated(false);
        setUser(null);
        tokenManager.clearTokens();
        return;
      }

      // Get current user
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      // Token invalid or expired
      setIsAuthenticated(false);
      setUser(null);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = useCallback(
    async (phone: string, password: string) => {
      setLoading(true);

      try {
        const result = await login(phone, password);

        // Tokens are already stored by auth service using token manager
        // Set user
        setUser(result.user as unknown as User);
        setIsAuthenticated(true);

        return result;
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleRegister = useCallback(
    async (data: {
      name: string;
      phone: string;
      email?: string;
      password: string;
      address?: string;
      birthDate?: string;
      gender?: 'MALE' | 'FEMALE';
    }) => {
      setLoading(true);

      try {
        const result = await register(data);

        // Tokens are already stored by auth service using token manager
        // Set user
        setUser(result.user as unknown as User);
        setIsAuthenticated(true);

        return result;
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth regardless of API call success
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  return {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,
  };
}
