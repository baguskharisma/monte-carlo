<<<<<<< HEAD
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * Route Protection Middleware
 *
 * Protects routes based on authentication and role-based access control
 * Aligns with Mobile Travel App API v2.0.0 specifications
 *
 * Roles: SUPER_ADMIN | ADMIN | DRIVER | CUSTOMER
 */

// ==================== TYPES ====================

interface TokenPayload {
  sub: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DRIVER' | 'CUSTOMER';
  iat: number;
  exp: number;
}

// ==================== ROUTE PATTERNS ====================

/**
 * Public routes - accessible to everyone (authenticated or not)
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/otp',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

/**
 * Auth routes - only accessible when NOT authenticated
 * Authenticated users will be redirected to their dashboard
 */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/otp'];

/**
 * Role-based route access control
 * Aligns with API v2.0.0 role permissions
 */
const ROLE_ROUTE_MAP = {
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/driver': ['DRIVER'],
  '/customer': ['CUSTOMER'],
  '/profile': ['SUPER_ADMIN', 'ADMIN', 'DRIVER', 'CUSTOMER'], // All authenticated users
  '/settings': ['SUPER_ADMIN', 'ADMIN', 'DRIVER', 'CUSTOMER'],
};

/**
 * Dashboard routes for each role
 * Auto-redirect after login based on user role
 */
const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  DRIVER: '/driver/dashboard',
  CUSTOMER: '/customer/dashboard',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Check if route is an auth route (login, register, etc.)
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if user has access to route based on their role
 */
function hasRoleAccess(pathname: string, role: string): boolean {
  // Find matching route pattern
  for (const [routePattern, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname.startsWith(routePattern)) {
      return allowedRoles.includes(role);
    }
  }

  // No specific route protection found - allow by default
  // (will be caught by general authentication check)
  return true;
}

/**
 * Get token from cookies
 * NOTE: For this to work, tokens must be stored in cookies
 * The current implementation uses localStorage, so this is prepared for future enhancement
 */
function getAccessToken(request: NextRequest): string | null {
  // Try to get from cookie (recommended for SSR)
  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback: try to get from custom header (set by client)
  // Client can set this header when making navigation requests
  const headerToken = request.headers.get('x-access-token');
  if (headerToken) {
    return headerToken;
  }

  return null;
}

/**
 * Validate and decode JWT token
 */
function validateToken(token: string): TokenPayload | null {
  try {
    const decoded = jwtDecode<TokenPayload>(token);

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp <= now) {
      return null;
    }

    // Check required fields
    if (!decoded.sub || !decoded.role) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

/**
 * Get dashboard URL based on user role
 */
function getDashboardForRole(role: string): string {
  return ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS] || '/';
}

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // Public routes don't require auth
  if (isPublicRoute(pathname)) {
    return false;
  }

  // All other routes require authentication
  return true;
}

// ==================== MIDDLEWARE ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - Next.js internal routes (_next)
  // - API routes (handled by API itself)
  // - Static files (images, fonts, etc.)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files have extensions
  ) {
    return NextResponse.next();
  }

  // Get and validate token
  const token = getAccessToken(request);
  const tokenPayload = token ? validateToken(token) : null;
  const isAuthenticated = !!tokenPayload;

  // ==================== PUBLIC ROUTES ====================
  if (isPublicRoute(pathname)) {
    // If authenticated user tries to access auth routes (login/register)
    // Redirect them to their role-appropriate dashboard
    if (isAuthenticated && isAuthRoute(pathname)) {
      const dashboard = getDashboardForRole(tokenPayload.role);
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Allow access to public routes
    return NextResponse.next();
  }

  // ==================== PROTECTED ROUTES ====================
  // Check if route requires authentication
  if (requiresAuth(pathname) && !isAuthenticated) {
    // User not authenticated - redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ==================== ROLE-BASED ACCESS CONTROL ====================
  if (isAuthenticated && tokenPayload) {
    // Check if user has permission for this route
    if (!hasRoleAccess(pathname, tokenPayload.role)) {
      // User doesn't have access - redirect to their dashboard
      const dashboard = getDashboardForRole(tokenPayload.role);

      // Don't redirect if already on dashboard
      if (pathname !== dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    }

    // Add user info to headers for server components (optional)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', tokenPayload.sub);
    requestHeaders.set('x-user-role', tokenPayload.role);
    requestHeaders.set('x-user-phone', tokenPayload.phone);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Default: allow the request
  return NextResponse.next();
}

// ==================== MIDDLEWARE CONFIG ====================

/**
 * Configure which routes the middleware should run on
 *
 * Matcher patterns:
 * - Match all routes except static files, API routes, and Next.js internals
=======
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
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
 */
export const config = {
  matcher: [
    /*
<<<<<<< HEAD
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, fonts, etc. - have file extensions)
     * - api routes (handled by backend)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.|api).*)',
=======
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
  ],
};
