'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, getCurrentUser, register } from '@/services/auth.service';
import { clearAuth, tokenManager } from '@/lib/axios';
import { User, UserRole } from '@/lib/api-types';

/**
 * Custom hook untuk authentication dengan role detection
 *
 * Features:
 * - User authentication state management
 * - Login, register, logout functionality
 * - Role detection (Super Admin, Admin, Driver, Customer)
 * - Role-based navigation and access control
 * - Token management integration
 *
 * @example
 * // Basic usage
 * const { user, isAuthenticated, login, logout, loading } = useAuth();
 *
 * const handleLogin = async () => {
 *   await login('081234567890', 'password');
 * };
 *
 * @example
 * // Role detection
 * const { isSuperAdmin, isAdmin, isDriver, isCustomer, role } = useAuth();
 *
 * if (isSuperAdmin) {
 *   console.log('Super Admin access granted');
 * }
 *
 * @example
 * // Role-based access control
 * const { hasRole, hasAnyRole, requireRole } = useAuth();
 *
 * if (hasRole(UserRole.ADMIN)) {
 *   // Show admin features
 * }
 *
 * if (hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])) {
 *   // Show admin panel
 * }
 *
 * // Redirect if not admin
 * useEffect(() => {
 *   requireRole(UserRole.ADMIN);
 * }, []);
 *
 * @example
 * // Navigation helpers
 * const { redirectToDashboard, requireAuth } = useAuth();
 *
 * // Redirect to role-appropriate dashboard
 * redirectToDashboard();
 *
 * // Require authentication
 * useEffect(() => {
 *   requireAuth();
 * }, []);
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

  // ==================== ROLE DETECTION ====================

  /**
   * Get current user role from token manager (faster than user state)
   */
  const role = useMemo(() => {
    return tokenManager.getUserRole() as UserRole | null;
  }, [user]);

  /**
   * Check if user is Super Admin
   */
  const isSuperAdmin = useMemo(() => {
    return user?.role === UserRole.SUPER_ADMIN || role === UserRole.SUPER_ADMIN;
  }, [user, role]);

  /**
   * Check if user is Admin (includes Super Admin)
   */
  const isAdmin = useMemo(() => {
    return (
      user?.role === UserRole.ADMIN ||
      user?.role === UserRole.SUPER_ADMIN ||
      role === UserRole.ADMIN ||
      role === UserRole.SUPER_ADMIN
    );
  }, [user, role]);

  /**
   * Check if user is Driver
   */
  const isDriver = useMemo(() => {
    return user?.role === UserRole.DRIVER || role === UserRole.DRIVER;
  }, [user, role]);

  /**
   * Check if user is Customer
   */
  const isCustomer = useMemo(() => {
    return user?.role === UserRole.CUSTOMER || role === UserRole.CUSTOMER;
  }, [user, role]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (targetRole: UserRole): boolean => {
      return user?.role === targetRole || role === targetRole;
    },
    [user, role]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      const currentRole = user?.role || role;
      return currentRole ? roles.includes(currentRole) : false;
    },
    [user, role]
  );

  /**
   * Check if user has all of the specified roles (useful for complex permissions)
   */
  const hasAllRoles = useCallback(
    (roles: UserRole[]): boolean => {
      const currentRole = user?.role || role;
      if (!currentRole) return false;
      // For single role system, user can only have one role
      // So this checks if user's role is in the list
      return roles.includes(currentRole);
    },
    [user, role]
  );

  /**
   * Redirect to appropriate dashboard based on role
   */
  const redirectToDashboard = useCallback(() => {
    if (isSuperAdmin || isAdmin) {
      router.push('/admin/dashboard');
    } else if (isDriver) {
      router.push('/driver/dashboard');
    } else if (isCustomer) {
      router.push('/customer/dashboard');
    } else {
      router.push('/');
    }
  }, [isSuperAdmin, isAdmin, isDriver, isCustomer, router]);

  /**
   * Require authentication - redirect to login if not authenticated
   */
  const requireAuth = useCallback(
    (redirectTo: string = '/login') => {
      if (!loading && !isAuthenticated) {
        router.push(redirectTo);
      }
    },
    [loading, isAuthenticated, router]
  );

  /**
   * Require specific role - redirect if user doesn't have role
   */
  const requireRole = useCallback(
    (requiredRole: UserRole, redirectTo: string = '/unauthorized') => {
      if (!loading && !hasRole(requiredRole)) {
        router.push(redirectTo);
      }
    },
    [loading, hasRole, router]
  );

  /**
   * Require any of the specified roles
   */
  const requireAnyRole = useCallback(
    (roles: UserRole[], redirectTo: string = '/unauthorized') => {
      if (!loading && !hasAnyRole(roles)) {
        router.push(redirectTo);
      }
    },
    [loading, hasAnyRole, router]
  );

  return {
    // User & Auth State
    user,
    isAuthenticated,
    loading,

    // Auth Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,

    // Role Detection
    role,
    isSuperAdmin,
    isAdmin,
    isDriver,
    isCustomer,
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Navigation Helpers
    redirectToDashboard,
    requireAuth,
    requireRole,
    requireAnyRole,
  };
}
