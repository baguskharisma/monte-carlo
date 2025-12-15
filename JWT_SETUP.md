# JWT Token Management - Quick Start Guide

Setup lengkap JWT Token Management dengan Access & Refresh Token untuk Travel Management System.

---

## ✅ What's Implemented

### 1. **Token Manager** ([src/lib/token-manager.ts](src/lib/token-manager.ts))
- ✅ Centralized token storage (localStorage/sessionStorage)
- ✅ Token validation & expiry checking
- ✅ Auto-decode JWT payload
- ✅ Extract user info from token (ID, role, phone)
- ✅ SSR-safe with fallback storage
- ✅ Development debug tools

### 2. **Axios Integration** ([src/lib/axios.ts](src/lib/axios.ts))
- ✅ Auto-inject token to all requests
- ✅ Auto-refresh token on 401
- ✅ Request queueing during refresh
- ✅ Clear tokens on invalid token

### 3. **Auth Service** ([src/services/auth.service.ts](src/services/auth.service.ts))
- ✅ Auto-store tokens on login
- ✅ Auto-store tokens on register
- ✅ Auto-clear tokens on logout
- ✅ Update tokens on refresh

### 4. **Auth Hook** ([src/hooks/use-auth.ts](src/hooks/use-auth.ts))
- ✅ Check auth using token manager
- ✅ Validate token before API calls
- ✅ Auto-clear expired tokens

---

## 🚀 Usage

### 1. Login (Auto-stores tokens)

```typescript
import { login } from '@/services/auth.service';

const result = await login('081234567890', 'Admin123');
// ✅ Tokens automatically stored in localStorage
// ✅ Access token: tokenManager.getAccessToken()
// ✅ Refresh token: tokenManager.getRefreshToken()
```

### 2. Make API Calls (Auto-injects token)

```typescript
import { getSchedules } from '@/services/schedule.service';

const schedules = await getSchedules({ limit: 20 });
// ✅ Token automatically injected in request header
// ✅ If expired, auto-refresh and retry
// ✅ All handled by axios interceptors
```

### 3. Check Authentication

```typescript
import { tokenManager } from '@/lib/token-manager';

// Check if user is authenticated
const isAuth = tokenManager.isAuthenticated();
// Returns: true if tokens exist AND access token is valid

// Get user info from token
const userId = tokenManager.getUserId();
const userRole = tokenManager.getUserRole();
const userPhone = tokenManager.getUserPhone();
```

### 4. Logout (Auto-clears tokens)

```typescript
import { logout } from '@/services/auth.service';

await logout();
// ✅ Tokens automatically cleared
// ✅ User redirected to /login
```

---

## 📦 Token Manager API

### Quick Reference

```typescript
import { tokenManager } from '@/lib/token-manager';

// ==================== GETTERS ====================
tokenManager.getAccessToken()           // Get access token
tokenManager.getRefreshToken()          // Get refresh token
tokenManager.getTokens()                // Get both tokens
tokenManager.getUserId()                // Get user ID from token
tokenManager.getUserRole()              // Get user role from token
tokenManager.getUserPhone()             // Get user phone from token

// ==================== VALIDATION ====================
tokenManager.hasTokens()                // Check if both tokens exist
tokenManager.isAccessTokenValid()       // Check if access token is valid
tokenManager.isAccessTokenExpired()     // Check if expired (60s buffer)
tokenManager.isAuthenticated()          // Has tokens AND valid

// ==================== SETTERS ====================
tokenManager.setTokens({ accessToken, refreshToken })
tokenManager.setAccessToken(token)
tokenManager.setRefreshToken(token)

// ==================== CLEANUP ====================
tokenManager.clearTokens()              // Clear all tokens
tokenManager.clearAccessToken()         // Clear access token only
tokenManager.clearRefreshToken()        // Clear refresh token only

// ==================== DEBUG ====================
tokenManager.getTokenInfo()             // Get token info object
tokenManager.debugTokenInfo()           // Print to console
tokenManager.getAccessTokenTimeUntilExpiry() // Seconds until expiry
```

---

## 🎯 Common Use Cases

### Use Case 1: Protected Route

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token-manager';

export function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return <div>Protected Content</div>;
}
```

### Use Case 2: Role-based Access

```typescript
import { tokenManager } from '@/lib/token-manager';

export function AdminPanel() {
  const userRole = tokenManager.getUserRole();

  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

### Use Case 3: Display User Info

```typescript
import { tokenManager } from '@/lib/token-manager';

export function UserBadge() {
  const phone = tokenManager.getUserPhone();
  const role = tokenManager.getUserRole();

  return (
    <div>
      <p>{phone}</p>
      <span className="badge">{role}</span>
    </div>
  );
}
```

### Use Case 4: Token Expiry Warning

```typescript
'use client';

import { useEffect, useState } from 'react';
import { tokenManager } from '@/lib/token-manager';

export function TokenExpiryWarning() {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(tokenManager.getAccessTokenTimeUntilExpiry());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft < 300 && timeLeft > 0) {
    return (
      <div className="warning">
        Session expires in {Math.floor(timeLeft / 60)}m
      </div>
    );
  }

  return null;
}
```

### Use Case 5: Conditional Rendering

```typescript
import { tokenManager } from '@/lib/token-manager';

export function Navbar() {
  const isAuth = tokenManager.isAuthenticated();
  const userRole = tokenManager.getUserRole();

  return (
    <nav>
      <Link href="/">Home</Link>

      {isAuth ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          {userRole === 'ADMIN' && <Link href="/admin">Admin</Link>}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
```

---

## 🔄 Token Flow

### Login Flow

```
User enters credentials
  ↓
Call login(phone, password)
  ↓
API returns { accessToken, refreshToken, user }
  ↓
Auth service auto-stores tokens
  ↓
tokenManager.setTokens({ accessToken, refreshToken })
  ↓
User is authenticated ✅
```

### API Request Flow

```
Make API call (e.g., getSchedules())
  ↓
Axios request interceptor
  ↓
tokenManager.getAccessToken()
  ↓
Add Authorization header: Bearer <token>
  ↓
Send request to API
  ↓
If 401 → Auto-refresh token → Retry
  ↓
Return response ✅
```

### Auto-Refresh Flow

```
API returns 401 Unauthorized
  ↓
Axios response interceptor detects 401
  ↓
Check if refresh token exists & valid
  ↓
Call /auth/refresh with refresh token
  ↓
Receive new access token
  ↓
tokenManager.setAccessToken(newToken)
  ↓
Retry original request with new token
  ↓
Return response ✅
```

### Logout Flow

```
User clicks logout
  ↓
Call logout()
  ↓
API call to /auth/logout
  ↓
Auth service clears tokens
  ↓
tokenManager.clearTokens()
  ↓
Redirect to /login
  ↓
User logged out ✅
```

---

## 🛡️ Security Features

### 1. Token Expiry Buffer (60 seconds)
```typescript
// Token expires at 14:30:00
// isAccessTokenExpired() returns true at 14:29:00
// 60 seconds buffer prevents race conditions
```

### 2. Auto-refresh on 401
```typescript
// No manual refresh needed
// Axios interceptors handle it automatically
```

### 3. SSR-Safe
```typescript
// Works on both client and server
// No localStorage errors in SSR
```

### 4. Validation Before Request
```typescript
// Token validity checked before API calls
// Invalid tokens are cleared automatically
```

---

## 📝 Configuration

### Change Storage Type

```typescript
// Default: localStorage (persistent)
import { tokenManager } from '@/lib/token-manager';

// Use sessionStorage (temporary - clears on tab close)
import { createTokenManager } from '@/lib/token-manager';
const sessionTokenManager = createTokenManager(true);
```

### Change Expiry Buffer

```typescript
// src/lib/token-manager.ts
const TOKEN_EXPIRY_BUFFER = 60; // Default: 60 seconds

// Change to 120 seconds
const TOKEN_EXPIRY_BUFFER = 120;
```

---

## 🔍 Debugging

### Console Debug

```typescript
import { tokenManager } from '@/lib/token-manager';

// Print token info (development only)
tokenManager.debugTokenInfo();

// Output:
// 🔐 Token Manager Debug Info
// ┌─────────────────────┬──────────┐
// │ hasTokens           │ true     │
// │ accessTokenValid    │ true     │
// │ accessTokenExpired  │ false    │
// │ timeUntilExpiry     │ 3540     │
// │ userId              │ user-123 │
// │ userRole            │ ADMIN    │
// └─────────────────────┴──────────┘
```

### Get Token Info

```typescript
const info = tokenManager.getTokenInfo();
console.log(info);

// Output:
// {
//   hasTokens: true,
//   accessTokenValid: true,
//   accessTokenExpired: false,
//   refreshTokenExpired: false,
//   timeUntilExpiry: 3540,
//   userId: "user-123",
//   userRole: "ADMIN",
//   userPhone: "081234567890"
// }
```

---

## 📚 Complete Documentation

- **[Token Manager Documentation](src/lib/TOKEN_MANAGEMENT.md)** - Complete API reference
- **[Axios Interceptors](src/lib/INTERCEPTORS.md)** - Auto-refresh & retry
- **[Auth Service](src/services/auth.service.ts)** - Login, register, logout
- **[Auth Hook](src/hooks/use-auth.ts)** - React authentication hook

---

## ✨ Summary

JWT Token Management sudah fully integrated dengan:

✅ **Token Manager** - Centralized storage & validation
✅ **Axios Interceptors** - Auto-inject, auto-refresh, auto-retry
✅ **Auth Service** - Auto-store/clear tokens
✅ **Auth Hook** - React integration

**Everything works automatically!**
- Login → Tokens stored ✅
- API call → Token injected ✅
- Token expired → Auto-refresh ✅
- Logout → Tokens cleared ✅

**You rarely need to interact with token manager directly!**

Just use the auth service and axios will handle the rest. 🚀
