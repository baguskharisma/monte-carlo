# API Error Handling & Retry Logic

Dokumentasi lengkap untuk comprehensive error handling dan retry logic system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Error Classes](#error-classes)
3. [Error Parsing](#error-parsing)
4. [Retry Logic](#retry-logic)
5. [React Integration](#react-integration)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

System error handling yang comprehensive dengan:
- ✅ Custom error classes untuk berbagai jenis error
- ✅ Auto-parsing dari Axios error ke custom error
- ✅ User-friendly error messages (bahasa Indonesia)
- ✅ Retry logic dengan multiple strategies
- ✅ React Error Boundary
- ✅ Custom hooks untuk error handling
- ✅ Integration dengan Axios interceptors

---

## 🔥 Error Classes

### Base Error Class

```typescript
import { ApiError } from '@/lib/api-error';

const error = new ApiError(
  'Resource not found',
  ErrorCode.NOT_FOUND,
  404
);

// Get user-friendly message
error.getUserMessage(); // "Resource tidak ditemukan."

// Convert to JSON
error.toJSON();
// {
//   name: 'ApiError',
//   message: 'Resource not found',
//   code: 'NOT_FOUND',
//   statusCode: 404,
//   timestamp: '2025-01-15T10:30:00.000Z'
// }
```

### Specialized Error Classes

```typescript
import {
  NetworkError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError,
} from '@/lib/api-error';

// Network Error
const networkErr = new NetworkError();
networkErr.getUserMessage();
// "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."

// Validation Error
const validationErr = new ValidationError(
  'Validation failed',
  {
    email: ['Email tidak valid'],
    phone: ['Nomor telepon harus 10-12 digit'],
  }
);
validationErr.getErrors();
// ['Email tidak valid', 'Nomor telepon harus 10-12 digit']
validationErr.getFieldErrors('email');
// ['Email tidak valid']

// Unauthorized Error
const authErr = new UnauthorizedError();
authErr.getUserMessage();
// "Anda harus login terlebih dahulu."

// Server Error
const serverErr = new ServerError('Database error', 500);
serverErr.getUserMessage();
// "Terjadi kesalahan pada server."
```

### Error Codes

```typescript
export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',

  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server Errors (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // Custom
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
}
```

---

## 🔍 Error Parsing

### Parse Axios Error

```typescript
import { parseApiError } from '@/lib/api-error';

try {
  await axios.get('/api/schedules');
} catch (error) {
  const apiError = parseApiError(error);

  console.log(apiError.code);          // 'NOT_FOUND'
  console.log(apiError.statusCode);    // 404
  console.log(apiError.getUserMessage()); // "Resource tidak ditemukan."
}
```

### Auto-parsing in Axios Interceptor

```typescript
// Axios interceptor automatically parses errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = parseApiError(error);
    return Promise.reject(apiError); // Returns ApiError, not AxiosError
  }
);

// In your code
try {
  await getSchedules();
} catch (error) {
  // error is already ApiError (not AxiosError)
  if (error instanceof ValidationError) {
    console.log(error.errors);
  }
}
```

### Error Utilities

```typescript
import {
  isRetryableError,
  requiresAuth,
  isClientError,
  isServerError,
  isNetworkError,
  formatErrorMessage,
  logError,
} from '@/lib/api-error';

const apiError = parseApiError(error);

// Check error type
isRetryableError(apiError);  // true for network/server errors
requiresAuth(apiError);      // true for 401 errors
isClientError(apiError);     // true for 4xx errors
isServerError(apiError);     // true for 5xx errors
isNetworkError(apiError);    // true for network errors

// Format message for display
const message = formatErrorMessage(apiError);
// "Resource tidak ditemukan."

// Log error (development only)
logError(apiError);
// Console group with detailed error info
```

---

## 🔄 Retry Logic

### Built-in Retry (Axios Interceptor)

```typescript
// Automatic retry in axios interceptor
// No code needed - works automatically!

const schedules = await getSchedules();
// If network error or 5xx error:
// - Retry 1: Wait 1s
// - Retry 2: Wait 2s
// - Retry 3: Wait 4s
// - If all fail: throw error
```

### Manual Retry with Strategies

```typescript
import { withRetry } from '@/lib/retry-logic';

// Exponential backoff (default)
const result = await withRetry(
  () => getSchedules({ limit: 20 }),
  { maxRetries: 3, baseDelay: 1000 },
  'exponential'
);

// Linear backoff
const result = await withRetry(
  () => createTicket(data),
  { maxRetries: 5, baseDelay: 2000 },
  'linear'
);

// Fixed delay
const result = await withRetry(
  () => uploadFile(file),
  { maxRetries: 3, baseDelay: 3000 },
  'fixed'
);

// Fibonacci backoff
const result = await withRetry(
  () => syncData(),
  { maxRetries: 5, baseDelay: 1000 },
  'fibonacci'
);
```

### Retry Configurations

```typescript
import {
  DEFAULT_RETRY_CONFIG,
  AGGRESSIVE_RETRY_CONFIG,
  CONSERVATIVE_RETRY_CONFIG,
  NO_RETRY_CONFIG,
} from '@/lib/retry-logic';

// Default: 3 retries, 1s base, exponential
await withRetry(() => fn(), DEFAULT_RETRY_CONFIG);

// Aggressive: 5 retries, 500ms base
await withRetry(() => fn(), AGGRESSIVE_RETRY_CONFIG);

// Conservative: 2 retries, 2s base
await withRetry(() => fn(), CONSERVATIVE_RETRY_CONFIG);

// No retry
await withRetry(() => fn(), NO_RETRY_CONFIG);
```

### Custom Retry Logic

```typescript
import { withRetry } from '@/lib/retry-logic';

const result = await withRetry(
  () => fetchData(),
  {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: (error) => {
      // Only retry network errors
      return error.code === 'NETWORK_ERROR';
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt} after ${delay}ms`);
    },
  }
);
```

### Circuit Breaker Pattern

```typescript
import { CircuitBreaker, CircuitState } from '@/lib/retry-logic';

const breaker = new CircuitBreaker({
  failureThreshold: 5,      // Trip after 5 failures
  resetTimeout: 60000,      // Try again after 1 minute
  monitoringPeriod: 120000, // Monitor for 2 minutes
});

try {
  const result = await breaker.execute(() => callExternalAPI());
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // Circuit is open, service is down
    console.log('Service temporarily unavailable');
  }
}

// Check circuit state
breaker.getState(); // CLOSED, OPEN, or HALF_OPEN
breaker.getFailureCount(); // Number of failures
```

---

## ⚛️ React Integration

### Error Boundary

```typescript
import { ErrorBoundary, ApiErrorBoundary } from '@/components/error-boundary';

// Basic Error Boundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// API Error Boundary with custom fallback
<ApiErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h1>Error: {error.getUserMessage()}</h1>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
  onError={(error) => {
    console.error('API Error:', error);
  }}
>
  <ScheduleList />
</ApiErrorBoundary>

// Error Boundary with reset keys
<ErrorBoundary resetKeys={[userId, scheduleId]}>
  <UserSchedules />
</ErrorBoundary>
```

### Error Handler Hooks

```typescript
import { useErrorHandler } from '@/hooks/use-error-handler';

function BookingForm() {
  const { error, handleError, clearError, getErrorMessage } = useErrorHandler();

  const onSubmit = async (data) => {
    try {
      await createTicket(data);
    } catch (err) {
      handleError(err, {
        onValidation: (error) => {
          console.log('Validation errors:', error.errors);
        },
        onNetworkError: () => {
          alert('Please check your internet connection');
        },
      });
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          {getErrorMessage()}
          <button onClick={clearError}>×</button>
        </div>
      )}
      <form onSubmit={onSubmit}>...</form>
    </div>
  );
}
```

### Validation Errors Hook

```typescript
import { useValidationErrors } from '@/hooks/use-error-handler';

function RegisterForm() {
  const {
    errors,
    getFieldError,
    hasFieldError,
    setValidationError,
    clearErrors,
  } = useValidationErrors();

  const onSubmit = async (data) => {
    try {
      await register(data);
    } catch (err) {
      if (err instanceof ValidationError) {
        setValidationError(err);
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input name="email" />
      {hasFieldError('email') && (
        <div className="error">
          {getFieldError('email').join(', ')}
        </div>
      )}

      <input name="phone" />
      {hasFieldError('phone') && (
        <div className="error">
          {getFieldError('phone').join(', ')}
        </div>
      )}

      <button type="submit">Register</button>
    </form>
  );
}
```

### Combined Error Handler

```typescript
import { useApiErrorHandler } from '@/hooks/use-error-handler';

function ScheduleList() {
  const {
    error,
    validationErrors,
    isOnline,
    isUnauthorized,
    handleError,
    getFieldError,
    clearAll,
  } = useApiErrorHandler();

  const loadSchedules = async () => {
    try {
      const result = await getSchedules();
    } catch (err) {
      handleError(err);
    }
  };

  if (!isOnline) {
    return <div>You are offline</div>;
  }

  if (isUnauthorized) {
    return <div>Please login first</div>;
  }

  return <div>Schedules...</div>;
}
```

---

## 💡 Usage Examples

### Example 1: Handle Validation Errors

```typescript
import { parseApiError, ValidationError } from '@/lib/api-error';

try {
  await createTicket(formData);
} catch (error) {
  const apiError = parseApiError(error);

  if (apiError instanceof ValidationError) {
    // Display validation errors
    Object.entries(apiError.errors).forEach(([field, messages]) => {
      console.log(`${field}: ${messages.join(', ')}`);
    });
  } else {
    // Display generic error
    alert(apiError.getUserMessage());
  }
}
```

### Example 2: Retry with Custom Condition

```typescript
import { retryIf } from '@/lib/retry-logic';

const result = await retryIf(
  () => callExternalAPI(),
  (error, attempt) => {
    // Only retry network errors and only first 3 attempts
    return error.code === 'NETWORK_ERROR' && attempt <= 3;
  },
  { baseDelay: 2000 }
);
```

### Example 3: Batch Retry

```typescript
import { retryBatch } from '@/lib/retry-logic';

const results = await retryBatch(
  [
    () => getSchedules(),
    () => getRoutes(),
    () => getVehicles(),
  ],
  { maxRetries: 3 }
);

// Results is array of values or errors
results.forEach((result) => {
  if (result instanceof ApiError) {
    console.error('Failed:', result.getUserMessage());
  } else {
    console.log('Success:', result);
  }
});
```

### Example 4: Error Boundary with Toast

```typescript
import { ApiErrorBoundary } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';

function App() {
  const { showError } = useToast();

  return (
    <ApiErrorBoundary
      onError={(error) => {
        showError(error.getUserMessage());
      }}
      fallback={(error, reset) => (
        <div>
          <p>{error.getUserMessage()}</p>
          <button onClick={reset}>Reset</button>
        </div>
      )}
    >
      <YourApp />
    </ApiErrorBoundary>
  );
}
```

### Example 5: Network Status Check

```typescript
import { useNetworkStatus } from '@/hooks/use-error-handler';

function ScheduleList() {
  const { isOnline, hasNetworkError, clearNetworkError } = useNetworkStatus();

  if (!isOnline || hasNetworkError) {
    return (
      <div className="offline-banner">
        <p>You are offline. Check your internet connection.</p>
        <button onClick={clearNetworkError}>Retry</button>
      </div>
    );
  }

  return <div>Schedules...</div>;
}
```

---

## 🎯 Best Practices

### 1. Always Parse Errors

```typescript
// ✅ Good - Parse error first
try {
  await createTicket(data);
} catch (error) {
  const apiError = parseApiError(error);
  alert(apiError.getUserMessage());
}

// ❌ Bad - Use raw error
try {
  await createTicket(data);
} catch (error) {
  alert(error.message); // Not user-friendly
}
```

### 2. Handle Specific Errors

```typescript
// ✅ Good - Handle specific error types
try {
  await createTicket(data);
} catch (error) {
  if (error instanceof ValidationError) {
    setFormErrors(error.errors);
  } else if (error instanceof NetworkError) {
    showOfflineMessage();
  } else {
    showGenericError(error.getUserMessage());
  }
}

// ❌ Bad - Generic handling
try {
  await createTicket(data);
} catch (error) {
  alert('Something went wrong');
}
```

### 3. Use Error Boundary for React Components

```typescript
// ✅ Good - Wrap components
<ErrorBoundary>
  <ScheduleList />
</ErrorBoundary>

// ❌ Bad - No error boundary
<ScheduleList /> // Errors crash the app
```

### 4. Don't Retry User Errors (4xx)

```typescript
// ✅ Good - Only retry server/network errors
import { isRetryableError } from '@/lib/api-error';

if (isRetryableError(error)) {
  await retry(fn);
} else {
  throw error; // Don't retry validation errors
}

// ❌ Bad - Retry all errors
await retry(fn); // Will retry 400, 422, etc.
```

### 5. Clear Errors After Success

```typescript
// ✅ Good - Clear errors on success
const { error, handleError, clearError } = useErrorHandler();

const onSubmit = async () => {
  try {
    await createTicket(data);
    clearError(); // Clear previous errors
    navigate('/success');
  } catch (err) {
    handleError(err);
  }
};

// ❌ Bad - Don't clear errors
const onSubmit = async () => {
  try {
    await createTicket(data);
    navigate('/success');
  } catch (err) {
    handleError(err);
  }
  // Error still displayed after success
};
```

---

## 📚 Summary

Error handling & retry logic system provides:

✅ **Custom Error Classes** - Type-safe error handling
✅ **Auto-parsing** - Axios errors → Custom errors
✅ **User-friendly Messages** - Bahasa Indonesia
✅ **Retry Logic** - Multiple strategies (exponential, linear, fibonacci)
✅ **Circuit Breaker** - Prevent cascading failures
✅ **React Integration** - Error Boundary & Hooks
✅ **Validation Handling** - Field-level error messages
✅ **Network Status** - Online/offline detection
✅ **Auth Errors** - Unauthorized handling

**All errors are handled automatically by Axios interceptors!**
