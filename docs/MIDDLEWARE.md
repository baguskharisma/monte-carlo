# Route Protection Middleware Documentation

## 📚 Overview

Comprehensive route protection middleware for the Mobile Travel App frontend. Implements role-based access control (RBAC) aligned with the Mobile Travel App API v2.0.0 specifications.

## 🎯 Features

- ✅ **Authentication Protection** - Automatic redirects for unauthenticated users
- ✅ **Role-Based Access Control** - Routes protected by user roles
- ✅ **Auto-Dashboard Redirect** - Redirects logged-in users trying to access auth pages
- ✅ **Return URL Support** - Remembers intended destination after login
- ✅ **Token Validation** - JWT validation with expiry checking
- ✅ **Cookie Sync** - Automatic token sync between localStorage and cookies
- ✅ **SSR Compatible** - Works with Next.js server-side rendering

## 🔐 User Roles

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // Full system access
  ADMIN = 'ADMIN',              // Admin panel access
  DRIVER = 'DRIVER',            // Driver-specific features
  CUSTOMER = 'CUSTOMER'         // Customer booking features
}
```

## 🛣️ Route Protection Rules

### Public Routes (No Authentication Required)
```typescript
const PUBLIC_ROUTES = [
  '/',               // Home page
  '/login',          // Login page
  '/register',       // Registration
  '/forgot-password', // Password reset request
  '/reset-password',  // Password reset with OTP
  '/otp',            // OTP verification
  '/about',          // About page
  '/contact',        // Contact page
  '/terms',          // Terms of service
  '/privacy',        // Privacy policy
];
```

### Auth Routes (Only for Non-Authenticated Users)
```typescript
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/otp',
];
```
**Behavior**: Logged-in users accessing these routes will be redirected to their role-appropriate dashboard.

### Role-Based Protected Routes
```typescript
const ROLE_ROUTE_MAP = {
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/driver': ['DRIVER'],
  '/customer': ['CUSTOMER'],
  '/profile': ['SUPER_ADMIN', 'ADMIN', 'DRIVER', 'CUSTOMER'],
  '/settings': ['SUPER_ADMIN', 'ADMIN', 'DRIVER', 'CUSTOMER'],
};
```

### Role Dashboards
```typescript
const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  DRIVER: '/driver/dashboard',
  CUSTOMER: '/customer/dashboard',
};
```

## 📋 Protection Flow

```
┌─────────────────┐
│ User Requests   │
│ Route           │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Is Static/API/_next Route?      │
│ → Allow immediately             │
└────────┬────────────────────────┘
         │ No
         ▼
┌─────────────────────────────────┐
│ Is Public Route?                │
└────────┬────────────────────────┘
         │
    ┌────┴─────┐
   YES         NO
    │           │
    ▼           ▼
┌───────────┐ ┌──────────────────────┐
│ Is Auth   │ │ Is Authenticated?    │
│ Route +   │ └────────┬─────────────┘
│ Logged In?│          │
└─────┬─────┘     ┌────┴─────┐
      │          YES         NO
      │           │           │
     YES          ▼           ▼
      │     ┌──────────┐ ┌────────────────┐
      │     │ Has Role │ │ Redirect to    │
      │     │ Access?  │ │ /login?        │
      │     └────┬─────┘ │ returnUrl=...  │
      │          │       └────────────────┘
      │     ┌────┴─────┐
      │    YES         NO
      │     │           │
      │     ▼           ▼
      │ ┌────────┐ ┌─────────────┐
      │ │ Allow  │ │ Redirect to │
      │ │ Access │ │ Dashboard   │
      │ └────────┘ └─────────────┘
      │
      ▼
┌───────────────────┐
│ Redirect to       │
│ Role Dashboard    │
└───────────────────┘
```

## 🔄 Token Synchronization

The middleware requires tokens to be accessible on the server side. We automatically sync tokens between localStorage and cookies:

### How It Works

1. **On Login**: Tokens are stored in both localStorage (for client-side use) and cookies (for middleware)
2. **On Logout**: Tokens are cleared from both localStorage and cookies
3. **On Refresh**: New tokens update both storages

### Implementation

```typescript
// In auth.service.ts (login function)
const response = await apiClient.post('/auth/login', { phone, password });
const { accessToken, refreshToken } = response.data;

// Token manager automatically syncs to cookies
tokenManager.setTokens({ accessToken, refreshToken });
```

```typescript
// In auth-cookies.ts
export function setAuthCookies(accessToken: string, refreshToken: string) {
  document.cookie = `access_token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000; SameSite=Lax`;
}
```

## 🚀 Usage Examples

### Example 1: Accessing Protected Admin Route

**Scenario**: Unauthenticated user tries to access `/admin/schedules`

```
User → /admin/schedules
  ↓
Middleware checks authentication
  ↓
Not authenticated
  ↓
Redirect → /login?returnUrl=/admin/schedules
  ↓
User logs in as ADMIN
  ↓
Redirect → /admin/schedules ✅
```

### Example 2: Wrong Role Access

**Scenario**: Customer tries to access admin panel

```
Customer → /admin/dashboard
  ↓
Middleware checks role
  ↓
Role: CUSTOMER (not allowed for /admin)
  ↓
Redirect → /customer/dashboard
```

### Example 3: Logged-in User on Login Page

**Scenario**: Admin user tries to access `/login`

```
Admin → /login
  ↓
Already authenticated
  ↓
Redirect → /admin/dashboard
```

### Example 4: Return URL After Login

**Scenario**: User clicks a shared link while logged out

```
User → /admin/schedules/schedule-123
  ↓
Not authenticated
  ↓
Redirect → /login?returnUrl=/admin/schedules/schedule-123
  ↓
User logs in
  ↓
Redirect → /admin/schedules/schedule-123 ✅
```

## 🔧 Configuration

### Adding New Protected Routes

Edit `src/middleware.ts`:

```typescript
const ROLE_ROUTE_MAP = {
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/driver': ['DRIVER'],
  '/customer': ['CUSTOMER'],
  '/reports': ['SUPER_ADMIN', 'ADMIN'], // ← Add new route
};
```

### Adding Public Routes

```typescript
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/help', // ← Add new public route
];
```

### Changing Dashboard URLs

```typescript
const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/overview', // ← Change dashboard URL
  DRIVER: '/driver/dashboard',
  CUSTOMER: '/customer/dashboard',
};
```

## 🛠️ Integration with useAuth Hook

The middleware works seamlessly with the `useAuth` hook:

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { UserRole } from '@/lib/api-types';

export function AdminPage() {
  const { requireAnyRole } = useAuth();

  // Client-side verification (in addition to middleware)
  useEffect(() => {
    requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }, [requireAnyRole]);

  return <div>Admin Content</div>;
}
```

## 📊 Middleware Matcher Configuration

The middleware runs on these routes:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.|api).*)',
  ],
};
```

**Excluded Patterns**:
- `_next/static` - Next.js static files
- `_next/image` - Image optimization
- `favicon.ico` - Favicon
- `.*\\.` - Any file with extension (images, fonts, etc.)
- `api` - API routes (handled by backend)

## 🔍 Debugging

### Enable Debug Logging

Add console logs in middleware for debugging:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Processing:', pathname);
  console.log('[Middleware] Token:', !!token);
  console.log('[Middleware] Authenticated:', isAuthenticated);
  console.log('[Middleware] Role:', tokenPayload?.role);

  // ... rest of middleware
}
```

### Check Cookies in Browser

```javascript
// Open browser console
document.cookie; // View all cookies
```

### Test Token Validation

```typescript
import { validateToken } from '@/middleware';

// In browser console or test file
const token = 'your-jwt-token';
const payload = validateToken(token);
console.log(payload);
```

## ⚠️ Important Notes

1. **Cookie Security**
   - Cookies are set with `SameSite=Lax` for CSRF protection
   - Consider using `HttpOnly` cookies set from API routes for production
   - Current implementation sets cookies from client-side

2. **Token Expiry**
   - Middleware validates token expiry automatically
   - Expired tokens are treated as unauthenticated
   - Auto-refresh is handled by axios interceptors

3. **SSR Considerations**
   - Middleware runs on server-side
   - Can't access localStorage directly
   - Uses cookies for server-side token access

4. **Performance**
   - Middleware runs on every route change
   - Token validation is fast (JWT decode)
   - No database calls in middleware

## 🔗 Related Files

| File | Purpose |
|------|---------|
| [src/middleware.ts](../src/middleware.ts) | Main middleware implementation |
| [src/lib/auth-cookies.ts](../src/lib/auth-cookies.ts) | Cookie sync helpers |
| [src/lib/token-manager.ts](../src/lib/token-manager.ts) | Token management with cookie sync |
| [src/hooks/use-auth.ts](../src/hooks/use-auth.ts) | Client-side auth hook with role detection |
| [src/services/auth.service.ts](../src/services/auth.service.ts) | Authentication API calls |

## 📚 API Alignment

This middleware is fully aligned with:
- **Mobile Travel App API v2.0.0**
- **User Roles**: SUPER_ADMIN, ADMIN, DRIVER, CUSTOMER
- **JWT Token Structure**: `{ sub, phone, role, iat, exp }`
- **Authentication Endpoints**: `/auth/login`, `/auth/register`, `/otp/*`

## 🎯 Best Practices

1. **Always use `useAuth` hook in components** for client-side checks
2. **Middleware handles route-level protection** automatically
3. **Add both middleware and client-side checks** for defense in depth
4. **Test with different roles** during development
5. **Monitor for token expiry** and implement refresh logic
6. **Use return URLs** for better UX after login
7. **Keep PUBLIC_ROUTES minimal** for security

## 🚨 Troubleshooting

### Issue: Infinite Redirect Loop

**Cause**: Dashboard route matches a protected route pattern
**Solution**: Ensure dashboard URLs are properly configured

### Issue: Middleware Not Running

**Cause**: Route matches excluded pattern
**Solution**: Check `matcher` configuration in middleware.ts

### Issue: Token Not Found

**Cause**: Cookies not set after login
**Solution**: Verify `setAuthCookies` is called after successful login

### Issue: Wrong Dashboard Redirect

**Cause**: Role mismatch in `ROLE_DASHBOARDS`
**Solution**: Verify role string matches exactly (case-sensitive)

## 📝 Testing Checklist

- [ ] Public routes accessible without login
- [ ] Protected routes redirect to login
- [ ] Login redirects to correct dashboard based on role
- [ ] Return URL works after login
- [ ] Logged-in users can't access `/login`
- [ ] Role-based access works correctly
- [ ] Token expiry triggers re-authentication
- [ ] Logout clears cookies and localStorage
- [ ] Middleware doesn't run on static files
- [ ] All role combinations tested

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Aligned with**: Mobile Travel App API v2.0.0
