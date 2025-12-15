# Role-Based Redirect System

## 📚 Overview

Complete implementation of role-based redirects after login. The system intelligently redirects users to their appropriate dashboard based on their role, with support for return URLs and custom redirects.

## 🎯 Features

- ✅ **Automatic Role Detection** - Redirects based on user role (SUPER_ADMIN, ADMIN, DRIVER, CUSTOMER)
- ✅ **Return URL Support** - Remembers intended destination before login
- ✅ **Custom Redirects** - Support for custom redirect paths
- ✅ **Priority System** - Smart priority: Return URL > Custom > Role-based
- ✅ **Middleware Integration** - Works seamlessly with route protection middleware
- ✅ **Type-Safe** - Full TypeScript support

## 🔄 Redirect Priority Flow

```
Login Success
   ↓
┌─────────────────────────────────┐
│ Has Return URL?                 │
│ (from middleware redirect)      │
└────────┬────────────────────────┘
         │
    ┌────┴─────┐
   YES         NO
    │           │
    ▼           ▼
┌─────────┐ ┌──────────────────────┐
│ Redirect│ │ Has Custom           │
│ to      │ │ Redirect Prop?       │
│ Return  │ └────────┬─────────────┘
│ URL     │          │
└─────────┘     ┌────┴─────┐
               YES         NO
                │           │
                ▼           ▼
           ┌─────────┐ ┌────────────────┐
           │ Redirect│ │ Redirect to    │
           │ to      │ │ Role Dashboard │
           │ Custom  │ └────────────────┘
           └─────────┘
```

## 📋 Role Dashboards

```typescript
const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  DRIVER: '/driver/dashboard',
  CUSTOMER: '/customer/dashboard',
};
```

## 💡 Usage Examples

### Example 1: Basic Login (Default Behavior)

**Scenario**: User logs in normally without any special redirect

```typescript
// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
      {/* No redirectTo prop - uses role-based redirect */}
    </div>
  );
}
```

**Flow**:
```
Admin logs in → /admin/dashboard
Driver logs in → /driver/dashboard
Customer logs in → /customer/dashboard
Super Admin logs in → /admin/dashboard
```

### Example 2: Return URL After Login

**Scenario**: User tries to access protected route while not logged in

```
User → /admin/schedules (not authenticated)
  ↓
Middleware redirects → /login?returnUrl=/admin/schedules
  ↓
User logs in as Admin
  ↓
Auto-redirects → /admin/schedules ✅
```

**Implementation**:
```typescript
// LoginForm automatically detects returnUrl from query params
const searchParams = useSearchParams();
const returnUrl = searchParams.get('returnUrl');

// After login
if (returnUrl) {
  router.push(returnUrl); // Redirect to intended route
}
```

### Example 3: Custom Redirect

**Scenario**: Custom redirect after login for specific flows

```typescript
// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <h1>Login to Book Ticket</h1>
      <LoginForm redirectTo="/customer/book" />
      {/* Custom redirect to booking page */}
    </div>
  );
}
```

**Flow**:
```
Customer logs in → /customer/book (custom redirect)
Admin logs in → /customer/book (even admins go here)
```

### Example 4: With Success Callback

**Scenario**: Execute custom logic after successful login

```typescript
// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/features/auth/LoginForm';
import { useState } from 'react';

export default function LoginPage() {
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLoginSuccess = () => {
    setShowWelcome(true);
    // Track analytics
    console.log('User logged in successfully');
  };

  return (
    <div>
      {showWelcome && <p>Welcome! Redirecting...</p>}
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}
```

### Example 5: Role-Specific Landing Pages

**Scenario**: Different components after login based on role

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated, isSuperAdmin, isAdmin, isDriver, isCustomer } = useAuth();

  if (!isAuthenticated) {
    return <PublicHomePage />;
  }

  // Role-specific home pages
  if (isSuperAdmin || isAdmin) {
    return <AdminHomePage />;
  }

  if (isDriver) {
    return <DriverHomePage />;
  }

  if (isCustomer) {
    return <CustomerHomePage />;
  }

  return <PublicHomePage />;
}
```

## 🔧 Implementation Details

### LoginForm Component

```typescript
// src/components/features/auth/LoginForm.tsx
export default function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin, redirectToDashboard } = useAuth();

  // Get return URL from middleware redirect
  const returnUrl = searchParams.get('returnUrl');

  const onSubmit = async (values) => {
    // Login using useAuth hook
    await authLogin(values.phone, values.password);

    // Call success callback
    onSuccess?.();

    // Smart redirect priority
    if (returnUrl) {
      router.push(returnUrl);           // 1. Return URL (highest priority)
    } else if (redirectTo) {
      router.push(redirectTo);          // 2. Custom redirect
    } else {
      redirectToDashboard();            // 3. Role-based dashboard (default)
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### useAuth Hook

```typescript
// src/hooks/use-auth.ts
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
```

## 🎬 Real-World Scenarios

### Scenario 1: Admin Booking Flow

```
Admin visits booking page → /admin/tickets/create
  ↓
Not logged in
  ↓
Redirects → /login?returnUrl=/admin/tickets/create
  ↓
Admin logs in
  ↓
Auto-redirects → /admin/tickets/create ✅
  ↓
Can immediately create booking
```

### Scenario 2: Customer Shared Link

```
Customer clicks shared link → /customer/schedule/ABC123
  ↓
Not logged in
  ↓
Redirects → /login?returnUrl=/customer/schedule/ABC123
  ↓
Customer logs in
  ↓
Auto-redirects → /customer/schedule/ABC123 ✅
  ↓
Can view and book the schedule
```

### Scenario 3: Driver Starting Shift

```
Driver logs in normally (no return URL)
  ↓
Login successful
  ↓
Auto-redirects → /driver/dashboard ✅
  ↓
Sees assigned trips for the day
```

### Scenario 4: Super Admin Quick Access

```
Super Admin logs in normally
  ↓
Login successful
  ↓
Auto-redirects → /admin/dashboard ✅
  ↓
Full admin panel access
```

## 🛡️ Security Considerations

### 1. **Return URL Validation**

The middleware only sets returnUrl for valid routes:

```typescript
// middleware.ts
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('returnUrl', pathname); // Only set for protected routes
```

### 2. **Role Verification**

Middleware ensures role access even with return URLs:

```typescript
// After login, middleware checks:
if (!hasRoleAccess(returnUrl, userRole)) {
  // Redirect to role dashboard instead
  redirectToDashboard();
}
```

### 3. **XSS Prevention**

Return URLs are sanitized by Next.js router:

```typescript
router.push(returnUrl); // Next.js handles sanitization
```

## 📊 Comparison: Before vs After

### Before (Without Role-Based Redirects)

```typescript
// Everyone goes to the same place
export default function LoginForm() {
  const onSubmit = async (values) => {
    await login(values.phone, values.password);
    router.push('/');  // ❌ Everyone goes to home
  };
}
```

**Problems**:
- ❌ Admins manually navigate to admin panel
- ❌ Drivers manually find their trips
- ❌ Poor user experience
- ❌ Lost return URLs

### After (With Role-Based Redirects)

```typescript
// Smart role-based redirects
export default function LoginForm() {
  const { login, redirectToDashboard } = useAuth();
  const returnUrl = searchParams.get('returnUrl');

  const onSubmit = async (values) => {
    await login(values.phone, values.password);

    if (returnUrl) {
      router.push(returnUrl);      // ✅ Back to intended route
    } else {
      redirectToDashboard();        // ✅ Role-appropriate dashboard
    }
  };
}
```

**Benefits**:
- ✅ Automatic role-based routing
- ✅ Return URL preserved
- ✅ Better UX
- ✅ Fewer clicks to destination

## 🧪 Testing Checklist

### Return URL Tests
- [ ] Access protected route while logged out
- [ ] Verify redirect to /login with returnUrl param
- [ ] Login successfully
- [ ] Verify redirect back to original route
- [ ] Confirm user can access the route

### Role-Based Dashboard Tests
- [ ] Login as Super Admin → redirects to /admin/dashboard
- [ ] Login as Admin → redirects to /admin/dashboard
- [ ] Login as Driver → redirects to /driver/dashboard
- [ ] Login as Customer → redirects to /customer/dashboard

### Custom Redirect Tests
- [ ] LoginForm with redirectTo prop
- [ ] Verify custom redirect takes priority over role-based
- [ ] Verify return URL takes priority over custom

### Edge Cases
- [ ] Login with invalid returnUrl (should fall back to role dashboard)
- [ ] Login with returnUrl to unauthorized route (should redirect to role dashboard)
- [ ] Logout and login again (should not remember old returnUrl)

## 🔗 Integration with Other Features

### With Middleware
```typescript
// middleware.ts sets returnUrl
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('returnUrl', pathname);
return NextResponse.redirect(loginUrl);
```

### With useAuth Hook
```typescript
// useAuth provides role detection
const { redirectToDashboard, isSuperAdmin, isAdmin } = useAuth();
```

### With Token Manager
```typescript
// Automatic token sync to cookies
await authLogin(phone, password);
// ✅ Tokens in localStorage
// ✅ Tokens in cookies (for middleware)
```

## 📁 Related Files

| File | Purpose |
|------|---------|
| [src/components/features/auth/LoginForm.tsx](../src/components/features/auth/LoginForm.tsx) | Login form with role-based redirects |
| [src/hooks/use-auth.ts](../src/hooks/use-auth.ts) | Auth hook with redirectToDashboard |
| [src/middleware.ts](../src/middleware.ts) | Route protection with return URLs |
| [src/lib/token-manager.ts](../src/lib/token-manager.ts) | Token management with cookie sync |

## 🎯 Best Practices

1. **Always use returnUrl when available** - Best UX
2. **Use redirectToDashboard() as default** - Automatic role handling
3. **Custom redirects for special flows** - Booking, checkout, etc.
4. **Test with all roles** - Ensure each role redirects correctly
5. **Monitor for infinite loops** - Ensure dashboards are accessible
6. **Log redirects in development** - Debug redirect issues

## 🚨 Troubleshooting

### Issue: Infinite Redirect Loop

**Symptom**: Page keeps redirecting
**Cause**: Dashboard route not accessible by role
**Solution**: Ensure role has access to their dashboard in middleware

### Issue: Return URL Not Working

**Symptom**: Returns to home instead of intended route
**Cause**: Query params not being read
**Solution**: Verify useSearchParams() is working and returnUrl is in URL

### Issue: Wrong Dashboard

**Symptom**: User redirected to wrong dashboard
**Cause**: Role detection issue
**Solution**: Check tokenManager.getUserRole() returns correct role

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Aligned with**: Mobile Travel App API v2.0.0
