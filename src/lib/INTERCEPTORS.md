# Axios Interceptors Documentation

Dokumentasi lengkap untuk Request/Response Interceptors yang diimplementasikan dalam aplikasi Travel Management System.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Configuration](#configuration)
4. [Request Interceptor](#request-interceptor)
5. [Response Interceptor](#response-interceptor)
6. [Auto Refresh Token](#auto-refresh-token)
7. [Request Queueing](#request-queueing)
8. [Retry Mechanism](#retry-mechanism)
9. [Error Handling](#error-handling)
10. [Logging](#logging)
11. [Usage Examples](#usage-examples)

---

## 🎯 Overview

Axios instance dengan advanced interceptors yang menangani:
- ✅ Auto-inject JWT token ke semua request
- ✅ Auto-refresh token saat expired
- ✅ Request queueing saat sedang refresh token
- ✅ Auto-retry untuk network errors
- ✅ Exponential backoff untuk retry
- ✅ Comprehensive error handling
- ✅ Development logging dengan emoji

---

## ✨ Features

### 1. **Auto Token Injection**
Setiap request otomatis mendapatkan `Authorization: Bearer <token>` dari localStorage.

### 2. **Auto Refresh Token**
Saat access token expired (401), interceptor akan:
- Auto-refresh menggunakan refresh token
- Retry original request dengan token baru
- Update localStorage dengan token baru

### 3. **Request Queueing**
Multiple concurrent requests yang gagal karena token expired akan:
- Di-queue sementara refresh token berlangsung
- Diproses setelah token baru didapat
- Mencegah multiple refresh token calls

### 4. **Auto Retry**
Network errors dan server errors (5xx) akan otomatis di-retry:
- Maximum 3 kali retry
- Exponential backoff delay (1s, 2s, 4s)
- Hanya retry untuk error yang bisa di-retry

### 5. **Comprehensive Error Handling**
Error handling untuk berbagai HTTP status codes:
- `401` - Unauthorized (auto refresh atau redirect login)
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limit
- `5xx` - Server Errors

### 6. **Development Logging**
Logging lengkap hanya di development mode:
- 📤 Request logs (method, URL, headers, data)
- 📥 Response logs (status, data)
- ❌ Error logs (status, message, data)
- 🔄 Retry logs

---

## ⚙️ Configuration

```typescript
// src/lib/axios.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TIMEOUT = 30000;        // 30 seconds
const MAX_RETRIES = 3;        // Maximum retry attempts
const RETRY_DELAY = 1000;     // Base retry delay (1 second)
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NODE_ENV=development  # Enable logging
```

---

## 📤 Request Interceptor

### What It Does

1. **Token Injection**: Ambil `access_token` dari localStorage
2. **Add Authorization Header**: `Authorization: Bearer <token>`
3. **Logging**: Log request details di development mode

### Code

```typescript
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage
    const token = localStorage.getItem('access_token');

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    logRequest(config);

    return config;
  },
  (error: AxiosError) => {
    logError(error);
    return Promise.reject(error);
  }
);
```

### Console Output (Development)

```
📤 API Request: GET /schedules/upcoming
  Headers: { Authorization: "Bearer eyJhbGci...", ... }
  Params: { limit: 20 }
```

---

## 📥 Response Interceptor

### What It Does

**Success Response:**
1. Log response di development mode
2. Return response as-is

**Error Response:**
1. Handle 401 Unauthorized (auto refresh token)
2. Handle retry untuk network/server errors
3. Comprehensive error logging
4. Return rejected promise dengan error

### Code Structure

```typescript
axiosInstance.interceptors.response.use(
  (response) => {
    logResponse(response);    // Log in development
    return response;
  },
  async (error) => {
    // 1. Handle 401 - Auto refresh token
    // 2. Handle retry mechanism
    // 3. Handle other errors
    // 4. Return rejected promise
  }
);
```

---

## 🔄 Auto Refresh Token

### How It Works

**Flow:**
1. Request fails dengan 401 Unauthorized
2. Check apakah sedang refreshing
3. Jika ya, queue request
4. Jika tidak, mulai refresh token
5. Call `/auth/refresh` dengan refresh token
6. Update localStorage dengan token baru
7. Retry original request dengan token baru
8. Process all queued requests

### Code Example

```typescript
// Automatic - no code needed!
// Just make normal API calls

import { getSchedules } from '@/services/schedule.service';

// Token expired, akan auto-refresh dan retry
const schedules = await getSchedules();
// ✅ Berhasil dengan token baru
```

### Manual Refresh (Optional)

```typescript
import { manualRefreshToken } from '@/lib/axios';

// Manually refresh token
const newToken = await manualRefreshToken();
console.log('New token:', newToken);
```

### Failure Handling

Jika refresh token gagal atau expired:
1. Clear semua tokens dari localStorage
2. Reject semua queued requests
3. Redirect ke `/login`

---

## 📋 Request Queueing

### Problem

Saat multiple concurrent requests dan token expired:
```typescript
// 5 requests sekaligus, token expired
Promise.all([
  getSchedules(),
  getRoutes(),
  getVehicles(),
  getTickets(),
  getDrivers(),
]);

// ❌ Tanpa queueing: 5x refresh token calls
// ✅ Dengan queueing: 1x refresh token call
```

### Solution

**Request Queue:**
1. Request pertama mulai refresh token
2. Request 2-5 masuk queue
3. Setelah token baru didapat, process semua queue
4. Semua request retry dengan token baru

### Code

```typescript
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

if (isRefreshing) {
  // Queue this request
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  })
    .then((token) => {
      config.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(config);
    });
}

// Start refreshing...
isRefreshing = true;
// ... refresh token logic ...
processQueue(null, newToken);  // Process all queued requests
```

---

## 🔁 Retry Mechanism

### What Gets Retried

1. **Network Errors**: No response from server
2. **5xx Server Errors**: 500, 502, 503, 504
3. **408 Request Timeout**

### What Does NOT Get Retried

1. 4xx Client Errors (400, 401, 403, 404, etc.)
2. Successful responses (2xx, 3xx)

### Configuration

```typescript
const MAX_RETRIES = 3;           // Max retry attempts
const RETRY_DELAY = 1000;        // Base delay 1 second
```

### Exponential Backoff

```
Retry 1: Wait 1 second  (1000ms * 2^0)
Retry 2: Wait 2 seconds (1000ms * 2^1)
Retry 3: Wait 4 seconds (1000ms * 2^2)
```

### Code Example

```typescript
// Automatic retry
try {
  const result = await getSchedules();
  // ✅ Success (maybe after 2 retries)
} catch (error) {
  // ❌ Failed after 3 retries
  console.error('Failed after retries:', error);
}
```

### Console Output (Development)

```
❌ API Error: GET /schedules
  Status: undefined
  Message: Network Error

🔄 Retrying request (1/3): /schedules
🔄 Retrying request (2/3): /schedules
🔄 Retrying request (3/3): /schedules

❌ Failed after 3 retries
```

---

## ❌ Error Handling

### Error Types

#### 1. **401 Unauthorized**
```typescript
// Auto refresh token dan retry
// Atau redirect ke /login jika token invalid
```

#### 2. **403 Forbidden**
```typescript
console.error('❌ Access Forbidden: You do not have permission');
```

#### 3. **404 Not Found**
```typescript
console.error('❌ Resource Not Found: The requested resource was not found');
```

#### 4. **409 Conflict**
```typescript
console.error('❌ Conflict: Resource conflict detected');
// Example: Vehicle already scheduled
```

#### 5. **422 Validation Error**
```typescript
console.error('❌ Validation Error: Validation failed');
// Example: Invalid phone number format
```

#### 6. **429 Too Many Requests**
```typescript
console.error('❌ Too Many Requests: Rate limit exceeded');
```

#### 7. **5xx Server Errors**
```typescript
console.error('❌ Server Error: Internal server error occurred');
// Will auto-retry
```

#### 8. **Network Errors**
```typescript
console.error('❌ Network Error: No response from server');
console.error('Please check your internet connection');
// Will auto-retry
```

### Error Response Format

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

### Handling Errors in Components

```typescript
import { AxiosError } from 'axios';
import { ApiError } from '@/lib/api-types';

try {
  await createTicket(data);
} catch (error) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    if (apiError.statusCode === 400) {
      // Handle validation error
      alert(apiError.message);
    } else if (apiError.statusCode === 409) {
      // Handle conflict
      alert('Seat already taken!');
    }
  }
}
```

---

## 📊 Logging

### Development Mode Only

Logging hanya aktif saat `NODE_ENV === 'development'`

### Request Logging

```javascript
📤 API Request: POST /tickets
  Headers: {
    Authorization: "Bearer eyJhbGci...",
    Content-Type: "application/json"
  }
  Data: {
    scheduleId: "schedule-123",
    passengers: [...]
  }
```

### Response Logging

```javascript
📥 API Response: POST /tickets
  Status: 201
  Data: {
    id: "ticket-456",
    ticketNumber: "TKT-20250115-00001",
    ...
  }
```

### Error Logging

```javascript
❌ API Error: POST /tickets
  Status: 400
  Message: Insufficient seats
  Error Data: {
    statusCode: 400,
    message: "Only 2 seats available",
    error: "Bad Request"
  }
```

### Disable Logging in Production

```env
# .env.production
NODE_ENV=production  # Logging disabled
```

---

## 💡 Usage Examples

### Example 1: Basic Request (Auto Token Injection)

```typescript
import { getSchedules } from '@/services/schedule.service';

// Token otomatis di-inject dari localStorage
const result = await getSchedules();
```

### Example 2: Auto Refresh Token

```typescript
import { getUpcomingSchedules } from '@/services/schedule.service';

// Token expired, akan auto-refresh dan retry
const schedules = await getUpcomingSchedules(20);

// Console output (development):
// ❌ API Error: GET /schedules/upcoming
//   Status: 401
// 🔄 Refreshing access token...
// ✅ Token refreshed successfully
// 📤 API Request: GET /schedules/upcoming (retry)
// 📥 API Response: GET /schedules/upcoming
```

### Example 3: Multiple Concurrent Requests

```typescript
// 3 requests sekaligus, token expired
const [schedules, routes, vehicles] = await Promise.all([
  getSchedules(),
  getRoutes(),
  getVehicles(),
]);

// ✅ Hanya 1x refresh token call
// ✅ Semua request di-queue dan retry dengan token baru
```

### Example 4: Network Error with Retry

```typescript
try {
  // Internet connection lost
  const result = await createTicket(data);
} catch (error) {
  // After 3 retries (1s, 2s, 4s)
  console.error('Failed to create ticket after retries');
}

// Console output:
// ❌ Network Error: No response from server
// 🔄 Retrying request (1/3): /tickets
// 🔄 Retrying request (2/3): /tickets
// 🔄 Retrying request (3/3): /tickets
// ❌ Failed after 3 retries
```

### Example 5: Manual Token Refresh

```typescript
import { manualRefreshToken } from '@/lib/axios';

// Manually refresh before making requests
try {
  const newToken = await manualRefreshToken();
  console.log('Token refreshed:', newToken);
} catch (error) {
  console.error('Failed to refresh token');
  // User will be redirected to /login
}
```

### Example 6: Manual Logout

```typescript
import { clearAuth } from '@/lib/axios';

// Clear all tokens and redirect to login
clearAuth();
```

---

## 🎯 Best Practices

### 1. Let Interceptors Handle Tokens
```typescript
// ❌ Don't do this
const token = localStorage.getItem('access_token');
axios.get('/schedules', {
  headers: { Authorization: `Bearer ${token}` }
});

// ✅ Do this
import axiosInstance from '@/lib/axios';
axiosInstance.get('/schedules');
// Token auto-injected!
```

### 2. Let Interceptors Handle Refresh
```typescript
// ❌ Don't manually refresh
if (error.status === 401) {
  const newToken = await refreshToken();
  // retry request...
}

// ✅ Let interceptor handle it
await getSchedules();
// Auto-refresh dan retry!
```

### 3. Handle Specific Errors
```typescript
// ✅ Handle business logic errors
try {
  await createTicket(data);
} catch (error) {
  if (error.response?.status === 400) {
    // Handle insufficient seats
    alert(error.response.data.message);
  }
}
```

### 4. Use Service Functions
```typescript
// ✅ Use typed service functions
import { getSchedules } from '@/services/schedule.service';
const result = await getSchedules({ limit: 20 });

// ❌ Don't use axios directly
const result = await axiosInstance.get('/schedules?limit=20');
```

---

## 🔧 Troubleshooting

### Issue: Infinite Redirect Loop

**Problem:** User terus redirect ke `/login`

**Solution:**
1. Check refresh token masih valid
2. Check `/auth/refresh` endpoint working
3. Check localStorage tidak ter-clear sebelum refresh

### Issue: Token Tidak Auto-Refresh

**Problem:** Request gagal dengan 401, tidak auto-refresh

**Solution:**
1. Check refresh token ada di localStorage
2. Check error message dari API
3. Check `_retry` flag (prevent infinite loop)

### Issue: Logging Tidak Muncul

**Problem:** Console tidak menampilkan logs

**Solution:**
1. Check `NODE_ENV=development` di `.env.local`
2. Restart development server
3. Clear cache dan reload

---

## 📚 Related Documentation

- [API Services Documentation](../services/README.md)
- [API Types Documentation](./api-types.ts)
- [Authentication Flow](../services/auth.service.ts)

---

## 🆘 Support

Jika ada issue atau pertanyaan:
1. Check console logs (development mode)
2. Check Network tab di DevTools
3. Check localStorage untuk tokens
4. Review error messages dari API
