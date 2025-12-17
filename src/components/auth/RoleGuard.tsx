/**
 * Role Guard Component
 * Conditional rendering based on user roles
 */

'use client';

import { useUser } from '@/stores/auth.store';
import type { UserRole } from '@/types/user.types';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleGuard Component
 * Renders children only if user has one of the specified roles
 *
 * @param children - Content to render if user has required role
 * @param roles - Array of roles that can see this content
 * @param fallback - Optional content to show if user doesn't have permission
 *
 * @example
 * <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 */
export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const user = useUser();

  // If no user, don't render anything
  if (!user) {
    return <>{fallback}</>;
  }

  // Check if user's role is in the allowed roles
  const hasPermission = roles.includes(user.role);

  // Render children if user has permission, otherwise render fallback
  return <>{hasPermission ? children : fallback}</>;
}

/**
 * Hook to check if current user has specific role(s)
 */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
  const user = useUser();

  if (!user) {
    return false;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Hook to check if current user is Super Admin
 */
export function useIsSuperAdmin(): boolean {
  return useHasRole('SUPER_ADMIN');
}

/**
 * Hook to check if current user is Admin or Super Admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(['ADMIN', 'SUPER_ADMIN']);
}

/**
 * Hook to check if current user is Driver
 */
export function useIsDriver(): boolean {
  return useHasRole('DRIVER');
}
