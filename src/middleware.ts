/**
 * Next.js Middleware for Route Protection
 * Handles authentication and role-based access control
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected route configurations
 * Maps route patterns to allowed roles
 */
const protectedRoutes: Record<string, string[]> = {
  '/super-admin': ['SUPER_ADMIN'],
  '/admin': ['ADMIN', 'SUPER_ADMIN'], // Super admin can access admin routes
  '/driver': ['DRIVER'],
};

/**
 * Public routes that don't require authentication
 */
const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

/**
 * Role-based dashboard redirects
 */
const dashboardRoutes: Record<string, string> = {
  SUPER_ADMIN: '/super-admin/dashboard',
  ADMIN: '/admin/dashboard',
  DRIVER: '/driver/dashboard',
  CUSTOMER: '/login', // Customers should not access admin panel
};

/**
 * Middleware function to protect routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth data from localStorage (via cookie fallback)
  // Note: In Next.js middleware, we can't access localStorage directly
  // We'll check for the presence of auth cookie or token in headers
  const authCookie = request.cookies.get('monte-carlo-auth');

  // Parse auth data
  let authData: { user: { role: string } | null; isAuthenticated: boolean } | null = null;

  try {
    if (authCookie?.value) {
      authData = JSON.parse(authCookie.value);
    }
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
  }

  const isAuthenticated = authData?.isAuthenticated || false;
  const userRole = authData?.user?.role;

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    const dashboardUrl = userRole ? dashboardRoutes[userRole] : '/login';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Check if current path requires authentication
  const requiresAuth = Object.keys(protectedRoutes).some((route) =>
    pathname.startsWith(route)
  );

  // If route requires auth but user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  if (requiresAuth && isAuthenticated && userRole) {
    const matchedRoute = Object.keys(protectedRoutes).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const allowedRoles = protectedRoutes[matchedRoute];

      // If user's role is not in allowed roles, redirect to their dashboard
      if (!allowedRoles.includes(userRole)) {
        const dashboardUrl = dashboardRoutes[userRole] || '/login';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    }
  }

  // Redirect root path to appropriate dashboard or login
  if (pathname === '/') {
    if (isAuthenticated && userRole) {
      const dashboardUrl = dashboardRoutes[userRole];
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
