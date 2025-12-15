# Layout Components

Comprehensive navigation and layout system for the Mobile Travel App with role-based access control.

## 🚀 Quick Start

```typescript
import { DashboardLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <DashboardLayout>
      <h1>My Page Content</h1>
    </DashboardLayout>
  );
}
```

That's it! Your page now has:
- ✅ Responsive sidebar with role-based menu
- ✅ Top navbar with user profile and notifications
- ✅ Auto-generated breadcrumb navigation
- ✅ Mobile hamburger menu

## 📦 Components

### DashboardLayout

Main layout wrapper that includes sidebar, navbar, and breadcrumb.

```typescript
import { DashboardLayout } from '@/components/layout';

<DashboardLayout showBreadcrumb={true}>
  {/* Your content */}
</DashboardLayout>
```

**Props:**
- `children: React.ReactNode` - Page content
- `showBreadcrumb?: boolean` - Show/hide breadcrumb (default: true)

### Sidebar

Responsive sidebar with role-based menu items.

```typescript
import { Sidebar } from '@/components/layout';

<Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
```

**Features:**
- Role-based menu filtering
- Active route highlighting
- Super Admin badges
- Mobile overlay
- Notification badges

### Navbar

Top navigation bar with search, notifications, and user profile.

```typescript
import { Navbar } from '@/components/layout';

<Navbar onMenuClick={toggleSidebar} />
```

**Features:**
- Global search bar
- Notification center
- User profile dropdown
- Mobile-responsive

### Breadcrumb

Auto-generated breadcrumb navigation.

```typescript
import { Breadcrumb, CustomBreadcrumb } from '@/components/layout';

// Auto-generated
<Breadcrumb />

// Custom
<CustomBreadcrumb
  items={[
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
  ]}
/>
```

## 💡 Usage Examples

### Example 1: Basic Dashboard Page

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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {/* Your content */}
      </div>
    </DashboardLayout>
  );
}
```

### Example 2: Without Breadcrumb

```typescript
import { DashboardLayoutNoBreadcrumb } from '@/components/layout';

export default function FullScreenPage() {
  return (
    <DashboardLayoutNoBreadcrumb>
      <div className="h-screen">
        {/* Full screen content */}
      </div>
    </DashboardLayoutNoBreadcrumb>
  );
}
```

### Example 3: Custom Breadcrumb

```typescript
import { DashboardLayout, CustomBreadcrumb } from '@/components/layout';

export default function EditPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout showBreadcrumb={false}>
      <CustomBreadcrumb
        items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Tickets', href: '/admin/tickets' },
          { label: `Ticket #${params.id}`, href: `/admin/tickets/${params.id}` },
          { label: 'Edit', href: `/admin/tickets/${params.id}/edit` },
        ]}
      />

      <div className="mt-6">
        {/* Edit form */}
      </div>
    </DashboardLayout>
  );
}
```

## 🎨 Role-Based Menu

The sidebar automatically shows menu items based on user role:

### Super Admin
- All admin features
- Manage Users
- System Settings
- Special "SA" badges

### Admin
- Dashboard
- Schedules
- Tickets
- Vehicles
- Routes
- Coin Management
- Payment Proofs
- Reports

### Driver
- Dashboard
- My Trips
- Schedule
- Performance
- Report Issue

### Customer
- Dashboard
- Book Ticket
- My Bookings
- Travel Documents

## 🔧 Customization

### Adding New Menu Items

Edit `src/components/layout/Sidebar.tsx`:

```typescript
const MENU_ITEMS: MenuItem[] = [
  {
    label: 'New Feature',
    href: '/admin/new-feature',
    icon: <Icon className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    badge: '5', // Optional notification badge
    superAdminOnly: false,
  },
  // ... more items
];
```

### Customizing Breadcrumb Labels

Edit `src/components/layout/Breadcrumb.tsx`:

```typescript
const ROUTE_LABELS: Record<string, string> = {
  'my-route': 'Custom Label',
  // ... more labels
};
```

## 📱 Responsive Design

### Desktop (> 1024px)
- Sidebar always visible
- Full search bar
- Complete breadcrumb

### Tablet (768px - 1024px)
- Sidebar toggleable
- Full features

### Mobile (< 768px)
- Sidebar hidden by default
- Hamburger menu
- Compact navigation

## 🎯 Active Route Highlighting

The sidebar automatically highlights the active route:
- Blue background for active item
- Gray hover for inactive items
- Font weight changes

## 🔔 Notifications

The navbar includes a notification center:
- Unread count badge
- Dropdown with recent notifications
- Click to view all notifications
- Mark as read functionality

## 👤 User Profile Dropdown

The navbar includes a user profile dropdown:
- User info (phone, email, role)
- My Profile link
- Settings link
- System Settings (Super Admin only)
- Logout button

## 🚀 Best Practices

1. **Always wrap pages with DashboardLayout**
   ```typescript
   <DashboardLayout>{children}</DashboardLayout>
   ```

2. **Use role protection in pages**
   ```typescript
   useEffect(() => {
     requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
   }, [requireAnyRole]);
   ```

3. **Custom breadcrumbs for complex routes**
   ```typescript
   <DashboardLayout showBreadcrumb={false}>
     <CustomBreadcrumb items={customItems} />
   </DashboardLayout>
   ```

4. **Mobile-first design**
   - Test on mobile devices
   - Ensure sidebar closes after navigation
   - Verify dropdowns work on touch devices

## 📚 Documentation

For detailed documentation, see:
- [Navigation Documentation](../../docs/NAVIGATION.md)
- [Dashboard Layouts](../../docs/DASHBOARDS.md)
- [useAuth Hook](../hooks/README.md)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
