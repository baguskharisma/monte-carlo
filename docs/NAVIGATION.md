# Navigation Components Documentation

## 📚 Overview

Comprehensive navigation system for the Mobile Travel App featuring role-based menus, responsive sidebar, top navbar with user profile dropdown, breadcrumb navigation, and mobile hamburger menu.

## 🎯 Features

- ✅ **Responsive Sidebar** - Collapsible sidebar with role-based menu items
- ✅ **Role-Based Menu** - Dynamic menu items based on user role (SUPER_ADMIN, ADMIN, DRIVER, CUSTOMER)
- ✅ **Top Navbar** - User profile dropdown, notifications, search bar
- ✅ **Breadcrumb Navigation** - Auto-generated breadcrumbs from current route
- ✅ **Mobile Menu** - Hamburger menu with overlay for mobile devices
- ✅ **Active Route Highlighting** - Visual feedback for current page
- ✅ **Super Admin Badges** - Special indicators for super admin-only features
- ✅ **Notification Center** - Real-time notifications with unread count
- ✅ **User Profile Dropdown** - Quick access to profile, settings, and logout

## 🎨 Component Architecture

```
DashboardLayout (Main Wrapper)
├── Sidebar (Left Navigation)
│   ├── Logo & Brand
│   ├── Role Badge
│   ├── Navigation Menu (Role-based)
│   └── Settings Link
├── Navbar (Top Bar)
│   ├── Hamburger Menu (Mobile)
│   ├── Search Bar
│   ├── Notifications Dropdown
│   └── User Profile Dropdown
├── Breadcrumb (Navigation Path)
└── Main Content Area
```

## 📦 Components

### 1. Sidebar Component

**File**: `src/components/layout/Sidebar.tsx`

#### Features
- Role-based menu filtering
- Active route highlighting
- Badge support for notifications
- Super Admin only indicators
- Mobile overlay and close button
- Smooth slide-in animation

#### Props
```typescript
interface SidebarProps {
  isOpen: boolean;      // Controls sidebar visibility
  onClose: () => void;  // Close handler for mobile
}
```

#### Menu Structure
```typescript
interface MenuItem {
  label: string;           // Display label
  href: string;            // Route path
  icon: React.ReactNode;   // Lucide icon
  roles: UserRole[];       // Allowed roles
  badge?: string;          // Optional notification badge
  superAdminOnly?: boolean; // Super Admin restriction
}
```

#### Usage
```typescript
import { Sidebar } from '@/components/layout';

<Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
```

#### Menu Items by Role

**Admin & Super Admin**
- Dashboard
- Schedules
- Tickets
- Travel Documents
- Vehicles
- Routes
- Manage Users (Super Admin Only)
- Coin Management
- Payment Proofs (with badge)
- Reports
- System Settings (Super Admin Only)

**Driver**
- Dashboard
- My Trips
- Schedule
- Performance
- Report Issue

**Customer**
- Dashboard
- Book Ticket
- My Bookings
- Travel Documents

### 2. Navbar Component

**File**: `src/components/layout/Navbar.tsx`

#### Features
- Hamburger menu button for mobile
- Global search bar (hidden on mobile)
- Notification center with dropdown
- User profile dropdown
- Unread notification badge
- Click-outside to close dropdowns

#### Props
```typescript
interface NavbarProps {
  onMenuClick: () => void; // Hamburger menu click handler
}
```

#### Usage
```typescript
import { Navbar } from '@/components/layout';

<Navbar onMenuClick={toggleSidebar} />
```

#### Notification System
```typescript
const notifications = [
  {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }
];
```

#### Profile Dropdown Menu
- User info display (phone, email, role)
- My Profile link
- Settings link
- System Settings (Super Admin only)
- Logout button

### 3. Breadcrumb Component

**File**: `src/components/layout/Breadcrumb.tsx`

#### Features
- Auto-generated from current route
- Custom breadcrumb support
- Smart label formatting
- ID truncation for long identifiers
- Responsive design (home icon on mobile)

#### Props
```typescript
interface BreadcrumbProps {
  className?: string;            // Custom CSS classes
  customItems?: BreadcrumbItem[]; // Manual breadcrumb items
}

interface BreadcrumbItem {
  label: string; // Display text
  href: string;  // Link URL
}
```

#### Usage

**Auto-generated**
```typescript
import { Breadcrumb } from '@/components/layout';

<Breadcrumb />
// Current route: /admin/schedules/create
// Renders: Home > Admin > Schedules > Create
```

**Custom breadcrumbs**
```typescript
import { CustomBreadcrumb } from '@/components/layout';

<CustomBreadcrumb
  items={[
    { label: 'Admin', href: '/admin' },
    { label: 'Schedule #ABC123', href: '/admin/schedules/ABC123' },
    { label: 'Edit', href: '/admin/schedules/ABC123/edit' },
  ]}
/>
```

#### Route Label Mapping
```typescript
const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  schedules: 'Schedules',
  tickets: 'Tickets',
  // ... more routes
};
```

### 4. DashboardLayout Component

**File**: `src/components/layout/DashboardLayout.tsx`

#### Features
- Combines Sidebar, Navbar, Breadcrumb
- Manages mobile sidebar state
- Responsive layout with proper spacing
- Optional breadcrumb visibility

#### Props
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;  // Page content
  showBreadcrumb?: boolean;   // Show/hide breadcrumb (default: true)
}
```

#### Usage

**Standard layout**
```typescript
import { DashboardLayout } from '@/components/layout';

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div>
        <h1>Admin Content</h1>
        {/* Your page content */}
      </div>
    </DashboardLayout>
  );
}
```

**Without breadcrumb**
```typescript
import { DashboardLayoutNoBreadcrumb } from '@/components/layout';

export default function FullScreenPage() {
  return (
    <DashboardLayoutNoBreadcrumb>
      <div>Full screen content</div>
    </DashboardLayoutNoBreadcrumb>
  );
}
```

## 🎨 Responsive Behavior

### Desktop (> 1024px)
- Sidebar always visible (fixed position)
- Full search bar displayed
- User info shown in profile dropdown
- Breadcrumb with full labels

### Tablet (768px - 1024px)
- Sidebar toggleable
- Full search bar
- Simplified breadcrumb

### Mobile (< 768px)
- Sidebar hidden by default
- Hamburger menu button
- Search icon button (modal opens)
- Mobile-optimized dropdowns
- Home icon in breadcrumb

## 🔐 Role-Based Access Control

The navigation system integrates with `useAuth` hook for role detection:

```typescript
const { role, isSuperAdmin, hasAnyRole } = useAuth();

// Filter menu items based on role
const filteredMenuItems = MENU_ITEMS.filter((item) => {
  if (!hasAnyRole(item.roles)) return false;
  if (item.superAdminOnly && !isSuperAdmin) return false;
  return true;
});
```

### Super Admin Features
- Manage Users menu item
- System Settings menu item
- System Settings in profile dropdown
- Purple "SA" badges on restricted items

## 🎯 Active Route Detection

```typescript
const pathname = usePathname();

const isActive = (href: string) => {
  if (href === '/') return pathname === href;
  return pathname.startsWith(href);
};
```

**Styling**
- Active: Blue background, blue text, medium font weight
- Inactive: Gray text, hover gray background

## 💡 Integration Examples

### Example 1: Admin Dashboard

```typescript
// src/app/admin/dashboard/page.tsx
'use client';

import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { requireAnyRole } = useAuth();

  useEffect(() => {
    requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }, [requireAnyRole]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1>Admin Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </DashboardLayout>
  );
}
```

### Example 2: Driver Dashboard

```typescript
// src/app/driver/dashboard/page.tsx
'use client';

import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
import { useEffect } from 'react';

export default function DriverDashboard() {
  const { requireRole } = useAuth();

  useEffect(() => {
    requireRole(UserRole.DRIVER);
  }, [requireRole]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1>Driver Dashboard</h1>
        {/* Driver content */}
      </div>
    </DashboardLayout>
  );
}
```

### Example 3: Custom Breadcrumb

```typescript
// src/app/admin/schedules/[id]/edit/page.tsx
'use client';

import { DashboardLayout, CustomBreadcrumb } from '@/components/layout';

export default function EditSchedulePage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout showBreadcrumb={false}>
      {/* Custom breadcrumb */}
      <CustomBreadcrumb
        items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Schedules', href: '/admin/schedules' },
          { label: `Schedule #${params.id}`, href: `/admin/schedules/${params.id}` },
          { label: 'Edit', href: `/admin/schedules/${params.id}/edit` },
        ]}
      />

      <div className="mt-6">
        {/* Page content */}
      </div>
    </DashboardLayout>
  );
}
```

### Example 4: Notification Handler

```typescript
// src/components/layout/Navbar.tsx

// In component
const handleNotificationClick = (notification: Notification) => {
  // Mark as read
  markNotificationAsRead(notification.id);

  // Navigate based on notification type
  if (notification.type === 'payment') {
    router.push('/admin/payment-proofs');
  } else if (notification.type === 'booking') {
    router.push(`/admin/tickets/${notification.ticketId}`);
  }

  setIsNotificationOpen(false);
};
```

## 🔧 Customization

### Adding New Menu Items

Edit `src/components/layout/Sidebar.tsx`:

```typescript
const MENU_ITEMS: MenuItem[] = [
  // ... existing items
  {
    label: 'New Feature',
    href: '/admin/new-feature',
    icon: <NewIcon className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    badge: '3', // Optional
    superAdminOnly: false,
  },
];
```

### Customizing Breadcrumb Labels

Edit `src/components/layout/Breadcrumb.tsx`:

```typescript
const ROUTE_LABELS: Record<string, string> = {
  // ... existing labels
  'new-route': 'Custom Label',
};
```

### Adding Notification Types

```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'payment' | 'booking' | 'schedule' | 'system'; // Add types
  metadata?: any; // Additional data
}
```

## 🎨 Design System

### Colors

**Sidebar**
- Background: `bg-white`
- Border: `border-gray-200`
- Active: `bg-blue-50 text-blue-700`
- Hover: `bg-gray-50 text-gray-900`

**Navbar**
- Background: `bg-white`
- Border: `border-gray-200`
- Dropdowns: `shadow-lg border-gray-200`

**Badges**
- Notification: `bg-red-500 text-white`
- Super Admin: `bg-purple-100 text-purple-700`
- Role: `bg-blue-50 text-blue-700`

### Icons

Using Lucide React icons:
- Menu items: 5×5 (w-5 h-5)
- Navbar: 5×5 or 6×6
- Dropdowns: 4×4

### Spacing

- Sidebar width: `w-64` (256px)
- Navbar height: `h-16` (64px)
- Content padding: `p-4 lg:p-6`

## 📱 Mobile Optimizations

### Sidebar
- Full-screen overlay on open
- Smooth slide-in animation
- Click outside to close
- Close button in header

### Navbar
- Compact user info
- Search icon instead of full bar
- Optimized dropdown widths

### Breadcrumb
- Home icon only on mobile
- Truncated labels for long text

## 🚀 Performance

### Optimizations
- Memoized role checks
- Click-outside listeners with cleanup
- Conditional rendering for role-specific items
- Lazy-loaded dropdown content

### Best Practices
```typescript
// Use useCallback for handlers
const handleClose = useCallback(() => {
  setIsSidebarOpen(false);
}, []);

// Cleanup event listeners
useEffect(() => {
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

## 🧪 Testing Checklist

### Sidebar
- [ ] Menu items filtered by role
- [ ] Active route highlighted
- [ ] Super Admin items hidden for regular admin
- [ ] Mobile overlay works
- [ ] Close on navigation (mobile)

### Navbar
- [ ] Hamburger menu toggles sidebar
- [ ] Search bar functional
- [ ] Notifications dropdown opens/closes
- [ ] Profile dropdown opens/closes
- [ ] Logout works correctly
- [ ] Click outside closes dropdowns

### Breadcrumb
- [ ] Auto-generates from route
- [ ] Custom breadcrumbs work
- [ ] Labels formatted correctly
- [ ] Links navigate properly

### DashboardLayout
- [ ] Sidebar responsive behavior
- [ ] Navbar sticky positioning
- [ ] Breadcrumb toggle works
- [ ] Content area scrollable

## 🔗 Related Files

| File | Purpose |
|------|---------|
| [Sidebar.tsx](../src/components/layout/Sidebar.tsx) | Sidebar navigation component |
| [Navbar.tsx](../src/components/layout/Navbar.tsx) | Top navbar with dropdowns |
| [Breadcrumb.tsx](../src/components/layout/Breadcrumb.tsx) | Breadcrumb navigation |
| [DashboardLayout.tsx](../src/components/layout/DashboardLayout.tsx) | Main layout wrapper |
| [use-auth.ts](../src/hooks/use-auth.ts) | Auth hook with role detection |

## 📚 Related Documentation

| Document | Link |
|----------|------|
| Dashboard Layouts | [DASHBOARDS.md](./DASHBOARDS.md) |
| Role-Based Redirects | [ROLE_BASED_REDIRECTS.md](./ROLE_BASED_REDIRECTS.md) |
| Middleware | [MIDDLEWARE.md](./MIDDLEWARE.md) |
| useAuth Hook | [../src/hooks/README.md](../src/hooks/README.md) |

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Aligned with**: Mobile Travel App API v2.0.0
