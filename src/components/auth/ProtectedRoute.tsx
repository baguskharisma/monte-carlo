/**
 * Protected Route Component
 * Client-side route protection wrapper
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/stores/auth.store';
import type { UserRole } from '@/types/user.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * Wraps content that requires authentication and/or specific roles
 *
 * @param children - Content to render if authorized
 * @param allowedRoles - Optional array of roles that can access this route
 * @param redirectTo - Optional redirect path (defaults to /login)
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If authenticated but role check fails, redirect to their dashboard
    if (!isLoading && isAuthenticated && user && allowedRoles) {
      const hasPermission = allowedRoles.includes(user.role);

      if (!hasPermission) {
        // Redirect to role-specific dashboard
        const dashboardMap: Record<UserRole, string> = {
          SUPER_ADMIN: '/super-admin/dashboard',
          ADMIN: '/admin/dashboard',
          DRIVER: '/driver/dashboard',
          CUSTOMER: '/login',
        };

        router.push(dashboardMap[user.role] || '/login');
      }
    }
  }, [isAuthenticated, user, allowedRoles, isLoading, router, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check required and user doesn't have permission, don't render
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}
