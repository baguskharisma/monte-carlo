# JWT Token Management Documentation

Dokumentasi lengkap untuk JWT Token Management dengan Access & Refresh Token.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Token Manager API](#token-manager-api)
4. [Token Storage](#token-storage)
5. [Token Validation](#token-validation)
6. [Usage Examples](#usage-examples)
7. [Integration with Axios](#integration-with-axios)
8. [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

Token Manager adalah singleton class yang mengelola JWT access & refresh tokens dengan fitur:
- ✅ Secure storage (localStorage/sessionStorage)
- ✅ Token validation & expiry checking
- ✅ Auto-decode JWT payload
- ✅ Integration dengan Axios interceptors
- ✅ TypeScript support

### Token Types

```typescript
interface Tokens {
  accessToken: string;   // Short-lived token for API access
  refreshToken: string;  // Long-lived token for refreshing access token
}

interface TokenPayload {
  sub: string;       // User ID
  phone: string;     // User phone
  role: string;      // User role (SUPER_ADMIN, ADMIN, DRIVER, CUSTOMER)
  iat: number;       // Issued at (timestamp)
  exp: number;       // Expiration time (timestamp)
}
```

---

## ✨ Features

### 1. **Token Storage**
- Flexible storage (localStorage or sessionStorage)
- SSR-safe (fallback untuk server-side rendering)
- Auto-save both tokens

### 2. **Token Validation**
- Check if token exists
- Check if token is expired (with buffer)
- Check if token has valid structure
- Decode JWT payload without verification

### 3. **Token Lifecycle**
- Store tokens after login/register
- Auto-refresh when expired
- Clear tokens on logout
- Check authentication status

### 4. **Developer Tools**
- Debug info logging
- Token expiry countdown
- User info extraction from token

---

## 📚 Token Manager API

### Singleton Instance

```typescript
import { tokenManager } from '@/lib/token-manager';

// Default instance uses localStorage
tokenManager.getAccessToken();
```

### Create Custom Instance

```typescript
import { createTokenManager } from '@/lib/token-manager';

// Use sessionStorage instead of localStorage
const sessionTokenManager = createTokenManager(true);
```

---

## 🔐 Getters

### Get Tokens

```typescript
// Get access token
const accessToken = tokenManager.getAccessToken();
// Returns: string | null

// Get refresh token
const refreshToken = tokenManager.getRefreshToken();
// Returns: string | null

// Get both tokens
const tokens = tokenManager.getTokens();
// Returns: { accessToken: string, refreshToken: string } | null
```

### Get Token Payload

```typescript
// Get decoded access token payload
const payload = tokenManager.getAccessTokenPayload();
// Returns: TokenPayload | null
// Example: { sub: "user-123", phone: "081234567890", role: "ADMIN", ... }

// Get specific user info
const userId = tokenManager.getUserId();        // Returns: string | null
const userRole = tokenManager.getUserRole();    // Returns: string | null
const userPhone = tokenManager.getUserPhone();  // Returns: string | null
```

---

## 💾 Setters

### Store Tokens

```typescript
// Set access token
tokenManager.setAccessToken('eyJhbGci...');

// Set refresh token
tokenManager.setRefreshToken('eyJhbGci...');

// Set both tokens at once
tokenManager.setTokens({
  accessToken: 'eyJhbGci...',
  refreshToken: 'eyJhbGci...',
});
```

---

## ✅ Validation Methods

### Check Existence

```typescript
// Check if access token exists
const hasAccess = tokenManager.hasAccessToken();
// Returns: boolean

// Check if refresh token exists
const hasRefresh = tokenManager.hasRefreshToken();
// Returns: boolean

// Check if both tokens exist
const hasTokens = tokenManager.hasTokens();
// Returns: boolean
```

### Check Expiry

```typescript
// Check if access token is expired (with 60s buffer)
const isExpired = tokenManager.isAccessTokenExpired();
// Returns: boolean

// Check if refresh token is expired (no buffer)
const isRefreshExpired = tokenManager.isRefreshTokenExpired();
// Returns: boolean

// Get time until expiry (in seconds)
const timeLeft = tokenManager.getAccessTokenTimeUntilExpiry();
// Returns: number
```

### Check Validity

```typescript
// Check if access token is valid (exists, not expired, valid structure)
const isValid = tokenManager.isAccessTokenValid();
// Returns: boolean

// Check if user is authenticated
const isAuth = tokenManager.isAuthenticated();
// Returns: boolean (has tokens AND access token is valid)
```

---

## 🧹 Cleanup Methods

```typescript
// Clear access token only
tokenManager.clearAccessToken();

// Clear refresh token only
tokenManager.clearRefreshToken();

// Clear all tokens
tokenManager.clearTokens();
```

---

## 🐛 Debug Methods

### Get Token Info

```typescript
const info = tokenManager.getTokenInfo();
// Returns:
// {
//   hasTokens: boolean,
//   accessTokenValid: boolean,
//   accessTokenExpired: boolean,
//   refreshTokenExpired: boolean,
//   timeUntilExpiry: number,
//   userId: string | null,
//   userRole: string | null,
//   userPhone: string | null,
// }
```

### Debug to Console

```typescript
// Print token info to console (development only)
tokenManager.debugTokenInfo();

// Console output:
// 🔐 Token Manager Debug Info
// ┌─────────────────────┬──────────┐
// │ hasTokens           │ true     │
// │ accessTokenValid    │ true     │
// │ accessTokenExpired  │ false    │
// │ refreshTokenExpired │ false    │
// │ timeUntilExpiry     │ 3540     │
// │ userId              │ user-123 │
// │ userRole            │ ADMIN    │
// │ userPhone           │ 081234... │
// └─────────────────────┴──────────┘
```

---

## 💡 Usage Examples

### Example 1: Login Flow

```typescript
import { login } from '@/services/auth.service';

// Login automatically stores tokens
const result = await login('081234567890', 'Admin123');

// Check authentication
console.log(tokenManager.isAuthenticated()); // true
console.log(tokenManager.getUserRole());     // "ADMIN"
```

### Example 2: Check Authentication on Mount

```typescript
'use client';

import { useEffect, useState } from 'react';
import { tokenManager } from '@/lib/token-manager';

export function ProtectedPage() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = tokenManager.isAuthenticated();
    setIsAuth(authenticated);

    if (!authenticated) {
      window.location.href = '/login';
    }
  }, []);

  if (!isAuth) return <div>Loading...</div>;

  return <div>Protected Content</div>;
}
```

### Example 3: Display User Info

```typescript
'use client';

import { tokenManager } from '@/lib/token-manager';

export function UserProfile() {
  const userId = tokenManager.getUserId();
  const userRole = tokenManager.getUserRole();
  const userPhone = tokenManager.getUserPhone();

  return (
    <div>
      <p>User ID: {userId}</p>
      <p>Role: {userRole}</p>
      <p>Phone: {userPhone}</p>
    </div>
  );
}
```

### Example 4: Token Expiry Warning

```typescript
'use client';

import { useEffect, useState } from 'react';
import { tokenManager } from '@/lib/token-manager';

export function TokenExpiryWarning() {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = tokenManager.getAccessTokenTimeUntilExpiry();
      setTimeLeft(time);

      // Warn if less than 5 minutes
      if (time < 300 && time > 0) {
        console.warn('Token expiring soon!');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft < 300) {
    return (
      <div className="warning">
        Token expires in {Math.floor(timeLeft / 60)} minutes
      </div>
    );
  }

  return null;
}
```

### Example 5: Manual Token Validation

```typescript
import { tokenManager } from '@/lib/token-manager';

// Before making sensitive operation
if (!tokenManager.isAuthenticated()) {
  alert('Please login first');
  window.location.href = '/login';
  return;
}

// Check if user has required role
const userRole = tokenManager.getUserRole();
if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
  alert('Access denied. Admin role required.');
  return;
}

// Proceed with operation
await performSensitiveOperation();
```

### Example 6: Logout

```typescript
import { logout } from '@/services/auth.service';

// Logout automatically clears tokens
await logout();

// Verify tokens are cleared
console.log(tokenManager.hasTokens()); // false
```

---

## 🔗 Integration with Axios

Token Manager terintegrasi penuh dengan Axios interceptors.

### Auto Token Injection

```typescript
// src/lib/axios.ts (Request Interceptor)

axiosInstance.interceptors.request.use((config) => {
  // Get token from token manager
  const token = tokenManager.getAccessToken();

  // Auto-inject to request
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

### Auto Refresh Token

```typescript
// src/lib/axios.ts (Response Interceptor)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Check if refresh token is valid
      if (!tokenManager.isRefreshTokenExpired()) {
        // Auto-refresh access token
        const newToken = await refreshAccessToken();

        // Token manager updates tokens automatically
        tokenManager.setAccessToken(newToken);

        // Retry original request
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
```

### Token Storage on Login

```typescript
// src/services/auth.service.ts

export const login = async (phone: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', {
    phone,
    password,
  });

  // Store tokens using token manager
  tokenManager.setTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });

  return response.data;
};
```

---

## 🛡️ Security Best Practices

### 1. **Token Expiry Buffer**

```typescript
// Default: 60 seconds buffer before expiry
const isExpired = tokenManager.isAccessTokenExpired();
// Returns true if expires in < 60 seconds

// This prevents race conditions where token expires
// between validation and actual request
```

### 2. **Secure Storage**

```typescript
// Use localStorage for persistent sessions
const tokenManager = createTokenManager(false);

// Use sessionStorage for temporary sessions (more secure)
const sessionTokenManager = createTokenManager(true);
```

### 3. **Clear Tokens on Logout**

```typescript
// Always clear tokens on logout
tokenManager.clearTokens();

// Also clear any cached user data
setUser(null);
setIsAuthenticated(false);
```

### 4. **Validate Before Sensitive Operations**

```typescript
// Always validate before sensitive operations
if (!tokenManager.isAuthenticated()) {
  throw new Error('Unauthorized');
}

// Check role
if (tokenManager.getUserRole() !== 'ADMIN') {
  throw new Error('Access denied');
}
```

### 5. **Don't Store Sensitive Data in Tokens**

```typescript
// ❌ Bad - Don't store password in token
interface TokenPayload {
  password: string; // Never do this!
}

// ✅ Good - Only store identifiers
interface TokenPayload {
  sub: string;    // User ID
  phone: string;  // Phone number
  role: string;   // User role
}
```

### 6. **SSR Safety**

```typescript
// Token manager is SSR-safe
// On server, it uses in-memory fallback storage

if (typeof window === 'undefined') {
  // Server-side: no localStorage access
  // Token manager handles this automatically
}
```

---

## 🔧 Utility Functions

### Standalone Token Functions

```typescript
import {
  decodeToken,
  isTokenExpired,
  isTokenValid,
  getTokenExpiry,
  getTimeUntilExpiry,
} from '@/lib/token-manager';

// Decode any JWT token
const payload = decodeToken('eyJhbGci...');
// Returns: TokenPayload | null

// Check if any token is expired
const expired = isTokenExpired('eyJhbGci...', 60); // 60s buffer
// Returns: boolean

// Check if any token is valid
const valid = isTokenValid('eyJhbGci...');
// Returns: boolean

// Get expiry timestamp
const expiry = getTokenExpiry('eyJhbGci...');
// Returns: number | null (Unix timestamp)

// Get time until expiry
const timeLeft = getTimeUntilExpiry('eyJhbGci...');
// Returns: number (seconds)
```

---

## 📊 Token Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Token Lifecycle                       │
└─────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   User credentials → API
   ↓
   Receive tokens (access + refresh)
   ↓
   tokenManager.setTokens({ accessToken, refreshToken })
   ↓
   Stored in localStorage/sessionStorage

2. API REQUEST
   ↓
   Get token: tokenManager.getAccessToken()
   ↓
   Validate: tokenManager.isAccessTokenValid()
   ↓
   If valid: Add to request header
   ↓
   If expired: Auto-refresh (axios interceptor)

3. AUTO REFRESH (on 401)
   ↓
   Get refresh token: tokenManager.getRefreshToken()
   ↓
   Validate: !tokenManager.isRefreshTokenExpired()
   ↓
   Call /auth/refresh with refresh token
   ↓
   Receive new tokens
   ↓
   tokenManager.setTokens({ accessToken, refreshToken })
   ↓
   Retry original request

4. LOGOUT
   ↓
   Call /auth/logout
   ↓
   tokenManager.clearTokens()
   ↓
   Redirect to /login
```

---

## 🎯 Summary

JWT Token Manager provides:

✅ **Centralized token storage** - Single source of truth
✅ **Auto validation** - Check expiry before requests
✅ **Type safety** - Full TypeScript support
✅ **Integration** - Works seamlessly with Axios
✅ **Security** - Buffer time, validation, SSR-safe
✅ **Developer tools** - Debug info, expiry countdown
✅ **Flexible storage** - localStorage or sessionStorage

**All token operations are handled automatically by:**
- Auth service (login, register, logout)
- Axios interceptors (inject, refresh)
- Token manager (storage, validation)

**You rarely need to interact with token manager directly!**
