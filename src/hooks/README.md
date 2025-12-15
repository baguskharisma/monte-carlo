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

Hook untuk authentication dengan auto-check token, user management, dan **role detection**.

### Features

- ✅ User authentication state management
- ✅ Login, register, logout functionality
- ✅ **Role detection** (Super Admin, Admin, Driver, Customer)
- ✅ **Role-based access control**
- ✅ **Navigation helpers** for role-based routing
- ✅ Token management integration

### Import

```typescript
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
```

### Basic Usage

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

### Complete API

```typescript
const {
  // User & Auth State
  user,              // User | null: Current user
  isAuthenticated,   // boolean: Is user authenticated
  loading,           // boolean: Loading state

  // Auth Actions
  login,             // Function: Login user
  register,          // Function: Register user
  logout,            // Function: Logout user
  checkAuth,         // Function: Re-check authentication

  // Role Detection
  role,              // UserRole | null: Current user role
  isSuperAdmin,      // boolean: Is Super Admin
  isAdmin,           // boolean: Is Admin (includes Super Admin)
  isDriver,          // boolean: Is Driver
  isCustomer,        // boolean: Is Customer
  hasRole,           // Function: Check specific role
  hasAnyRole,        // Function: Check if has any of roles
  hasAllRoles,       // Function: Check if has all roles

  // Navigation Helpers
  redirectToDashboard,  // Function: Redirect to role-appropriate dashboard
  requireAuth,          // Function: Require authentication (redirect if not)
  requireRole,          // Function: Require specific role
  requireAnyRole,       // Function: Require any of specified roles
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

#### Example 1: Role Detection

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';

export function Dashboard() {
  const {
    user,
    role,
    isSuperAdmin,
    isAdmin,
    isDriver,
    isCustomer
  } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {user?.phone}</p>
      <p>Role: {role}</p>

      {/* Super Admin Only */}
      {isSuperAdmin && (
        <div className="admin-panel">
          <h2>Super Admin Panel</h2>
          <button>Manage All Users</button>
          <button>System Settings</button>
        </div>
      )}

      {/* Admin & Super Admin */}
      {isAdmin && (
        <div className="admin-tools">
          <h2>Admin Tools</h2>
          <button>Manage Schedules</button>
          <button>View Reports</button>
        </div>
      )}

      {/* Driver Only */}
      {isDriver && (
        <div className="driver-panel">
          <h2>Driver Panel</h2>
          <button>My Trips</button>
          <button>Update Status</button>
        </div>
      )}

      {/* Customer Only */}
      {isCustomer && (
        <div className="customer-panel">
          <h2>Customer Panel</h2>
          <button>Book Ticket</button>
          <button>My Bookings</button>
        </div>
      )}
    </div>
  );
}
```

#### Example 2: Role-Based Access Control

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
import { useEffect } from 'react';

export function AdminPage() {
  const { hasRole, hasAnyRole, requireAnyRole } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN], '/unauthorized');
  }, [requireAnyRole]);

  // Check specific role
  const canDeleteUsers = hasRole(UserRole.SUPER_ADMIN);
  const canManageSchedules = hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  return (
    <div>
      <h1>Admin Panel</h1>

      {canManageSchedules && (
        <button>Manage Schedules</button>
      )}

      {canDeleteUsers && (
        <button className="danger">Delete Users</button>
      )}
    </div>
  );
}
```

#### Example 3: Protected Route with Auto-Redirect

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export function ProtectedPage() {
  const { isAuthenticated, loading, user, requireAuth } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    requireAuth('/login');
  }, [requireAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {user?.phone}!</p>
    </div>
  );
}
```

#### Example 4: Role-Based Dashboard Redirect

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export function HomePage() {
  const { isAuthenticated, redirectToDashboard } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Automatically redirect to appropriate dashboard based on role
      // Super Admin / Admin → /admin/dashboard
      // Driver → /driver/dashboard
      // Customer → /customer/dashboard
      redirectToDashboard();
    }
  }, [isAuthenticated, redirectToDashboard]);

  return (
    <div>
      <h1>Welcome to Travel App</h1>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
```

#### Example 5: Conditional Rendering by Multiple Roles

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';

export function TicketManagement() {
  const { hasAnyRole, hasRole } = useAuth();

  const canCreateTicket = hasAnyRole([
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.CUSTOMER
  ]);

  const canApprovePayment = hasAnyRole([
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ]);

  const canCancelAnyTicket = hasRole(UserRole.SUPER_ADMIN);

  return (
    <div>
      <h1>Ticket Management</h1>

      {canCreateTicket && (
        <button>Create Ticket</button>
      )}

      {canApprovePayment && (
        <button>Approve Payments</button>
      )}

      {canCancelAnyTicket && (
        <button className="danger">Cancel Any Ticket</button>
      )}
    </div>
  );
}
```

#### Example 6: Role-Specific Navigation

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export function Navigation() {
  const {
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isDriver,
    isCustomer,
    logout
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <nav>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    );
  }

  return (
    <nav>
      {/* Common links */}
      <Link href="/">Home</Link>

      {/* Admin links */}
      {(isSuperAdmin || isAdmin) && (
        <>
          <Link href="/admin/dashboard">Admin Dashboard</Link>
          <Link href="/admin/schedules">Manage Schedules</Link>
          <Link href="/admin/users">Manage Users</Link>
        </>
      )}

      {/* Super Admin only */}
      {isSuperAdmin && (
        <Link href="/admin/settings">System Settings</Link>
      )}

      {/* Driver links */}
      {isDriver && (
        <>
          <Link href="/driver/dashboard">Driver Dashboard</Link>
          <Link href="/driver/trips">My Trips</Link>
        </>
      )}

      {/* Customer links */}
      {isCustomer && (
        <>
          <Link href="/customer/dashboard">My Dashboard</Link>
          <Link href="/customer/bookings">My Bookings</Link>
          <Link href="/customer/book">Book Ticket</Link>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </nav>
  );
}
```

#### Example 7: Register Flow

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
