# Custom React Hooks Documentation

Dokumentasi untuk custom React hooks yang memudahkan integrasi dengan API services dan Axios interceptors.

---

## 📋 Available Hooks

1. [useApi](#useapi) - Generic API call hook
2. [useAuth](#useauth) - Authentication hook
3. [useToast](#usetoast) - Toast notification hook

---

## 🎣 useApi

Generic hook untuk handle API calls dengan loading dan error states.

### Import

```typescript
import { useApi } from '@/hooks/use-api';
```

### Usage

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { getSchedules } from '@/services/schedule.service';

export function ScheduleList() {
  const { execute, loading, error, data, reset } = useApi(getSchedules);

  const loadSchedules = async () => {
    const result = await execute({ limit: 20, sortBy: 'cheapest' });

    if (result) {
      console.log('Schedules loaded:', result.data);
    }
  };

  return (
    <div>
      <button onClick={loadSchedules} disabled={loading}>
        {loading ? 'Loading...' : 'Load Schedules'}
      </button>

      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}

      {data && (
        <div>
          <h3>Found {data.meta.total} schedules</h3>
          {data.data.map((schedule) => (
            <div key={schedule.id}>{/* ... */}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### API

```typescript
const {
  execute,   // Function: Execute API call
  loading,   // boolean: Loading state
  error,     // ApiError | null: Error state
  data,      // T | null: Response data
  reset,     // Function: Reset all states
} = useApi(apiFunction);
```

### Type Safety

```typescript
import { getSchedules } from '@/services/schedule.service';

// ✅ Type-safe parameters and return value
const { execute } = useApi(getSchedules);

// TypeScript knows parameters and return type
const result = await execute({
  limit: 20,        // ✅ Valid
  sortBy: 'cheapest' // ✅ Valid
  // invalidParam: true  // ❌ TypeScript error
});
```

### Examples

#### Example 1: Form Submission

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { createTicket } from '@/services/ticket.service';

export function BookingForm() {
  const { execute, loading, error } = useApi(createTicket);

  const handleSubmit = async (formData: any) => {
    const result = await execute(formData);

    if (result) {
      alert(`Ticket created: ${result.ticketNumber}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Book Ticket'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

#### Example 2: Multiple API Calls

```typescript
const schedulesApi = useApi(getSchedules);
const routesApi = useApi(getRoutes);
const vehiclesApi = useApi(getVehicles);

const loadAllData = async () => {
  await Promise.all([
    schedulesApi.execute({ limit: 20 }),
    routesApi.execute({ isActive: true }),
    vehiclesApi.execute({ status: 'AVAILABLE' }),
  ]);
};

const isLoading = schedulesApi.loading || routesApi.loading || vehiclesApi.loading;
```

---

## 🔐 useAuth

Hook untuk authentication dengan auto-check token dan user management.

### Import

```typescript
import { useAuth } from '@/hooks/use-auth';
```

### Usage

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

export function LoginPage() {
  const { login, loading, isAuthenticated, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(phone, password);
      // User logged in, redirected automatically
    } catch (error) {
      alert('Login failed');
    }
  };

  if (isAuthenticated) {
    return <div>Welcome, {user?.name}</div>;
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### API

```typescript
const {
  user,              // User | null: Current user
  isAuthenticated,   // boolean: Is user authenticated
  loading,           // boolean: Loading state
  login,             // Function: Login user
  register,          // Function: Register user
  logout,            // Function: Logout user
  checkAuth,         // Function: Re-check authentication
} = useAuth();
```

### Auto-Check on Mount

Hook automatically checks authentication on component mount:

```typescript
useEffect(() => {
  checkAuth(); // Checks token and loads user
}, []);
```

### Examples

#### Example 1: Protected Route

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {user?.name}!</p>
    </div>
  );
}
```

#### Example 2: Register Flow

```typescript
const { register, loading } = useAuth();

const handleRegister = async (formData: any) => {
  try {
    await register({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      birthDate: '1990-05-15',
      gender: 'MALE',
    });
    // User registered and logged in
  } catch (error) {
    alert('Registration failed');
  }
};
```

#### Example 3: Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User logged out and redirected to /login
};
```

---

## 🔔 useToast

Hook untuk menampilkan toast notifications, terutama untuk API errors.

### Import

```typescript
import { useToast } from '@/hooks/use-toast';
```

### Usage

```typescript
'use client';

import { useToast } from '@/hooks/use-toast';
import { createTicket } from '@/services/ticket.service';

export function BookingForm() {
  const { showToast, showError, showSuccess, toasts } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      const result = await createTicket(data);
      showSuccess(`Ticket created: ${result.ticketNumber}`);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>

      {/* Display toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### API

```typescript
const {
  toasts,        // Toast[]: Array of active toasts
  showToast,     // Function: Show generic toast
  showError,     // Function: Show error toast (auto-extract from API error)
  showSuccess,   // Function: Show success toast
  showWarning,   // Function: Show warning toast
  removeToast,   // Function: Remove specific toast
  clearAll,      // Function: Clear all toasts
} = useToast();
```

### Toast Types

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;  // Auto-dismiss after duration (ms)
}
```

### Examples

#### Example 1: API Error Handling

```typescript
const { showError } = useToast();

try {
  await createTicket(data);
} catch (error) {
  // Automatically extracts message from AxiosError
  showError(error);
  // Shows: "Insufficient seats" or "Validation failed"
}
```

#### Example 2: Custom Messages

```typescript
const { showToast, showSuccess, showWarning } = useToast();

// Success message (auto-dismiss after 5s)
showSuccess('Ticket booked successfully!');

// Warning message
showWarning('Please verify your payment proof');

// Custom duration
showToast('Processing...', 'info', 10000); // 10 seconds
```

#### Example 3: Manual Control

```typescript
const { showToast, removeToast } = useToast();

const toastId = showToast('Please wait...', 'info', 0); // No auto-dismiss

// Later...
removeToast(toastId);
```

#### Example 4: Toast Container Component

```typescript
'use client';

import { useToast } from '@/hooks/use-toast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded shadow-lg
            ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-500 text-black' : ''}
            ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Combine Hooks

```typescript
function BookingPage() {
  const { user, isAuthenticated } = useAuth();
  const { execute, loading, error } = useApi(createTicket);
  const { showSuccess, showError } = useToast();

  const handleBook = async (data: any) => {
    const result = await execute(data);

    if (result) {
      showSuccess(`Ticket ${result.ticketNumber} created!`);
    } else if (error) {
      showError(error);
    }
  };

  // ...
}
```

### 2. Error Boundary

```typescript
function ScheduleList() {
  const { execute, loading, error, data } = useApi(getSchedules);
  const { showError } = useToast();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    const result = await execute({ limit: 20 });

    if (!result && error) {
      showError(error);
    }
  };

  // ...
}
```

### 3. Optimistic Updates

```typescript
const { execute } = useApi(deleteTicket);
const { showSuccess, showError } = useToast();

const handleDelete = async (ticketId: string) => {
  // Optimistically remove from UI
  setTickets(prev => prev.filter(t => t.id !== ticketId));

  const result = await execute(ticketId);

  if (result) {
    showSuccess('Ticket deleted');
  } else {
    // Rollback on error
    showError('Failed to delete ticket');
    // Reload data
  }
};
```

---

## 🔗 Related Documentation

- [Axios Interceptors](../lib/INTERCEPTORS.md)
- [API Services](../services/README.md)
- [API Types](../lib/api-types.ts)

---

## 📝 Notes

1. **Client Components Only**: All hooks use `'use client'` directive
2. **Type Safety**: Fully typed with TypeScript
3. **Auto-Refresh**: Works seamlessly with Axios interceptors
4. **SSR Compatible**: Checks `window` before localStorage access
5. **Auto-Cleanup**: Toast auto-dismiss with configurable duration
