# Multi-Role Dashboard Layouts Documentation

## 📚 Overview

Comprehensive dashboard layouts for different user roles in the Mobile Travel App. Each dashboard is tailored to the specific needs and permissions of each role type.

## 🎯 Dashboard Types

### 1. **Admin Dashboard** (SUPER_ADMIN & ADMIN)
- **Route**: `/admin/dashboard`
- **Roles**: `SUPER_ADMIN`, `ADMIN`
- **Primary Functions**: System management, bookings, coin management

### 2. **Driver Dashboard** (DRIVER)
- **Route**: `/driver/dashboard`
- **Role**: `DRIVER`
- **Primary Functions**: Trip management, passenger lists, status updates

## 🔐 Access Control

All dashboards are protected by:
1. **Middleware**: Server-side route protection
2. **useAuth Hook**: Client-side role verification

```typescript
// Auto-redirect if not authorized
useEffect(() => {
  requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
}, []);
```

---

## 1️⃣ Admin Dashboard

### 📊 Features

#### **Quick Stats** (Top Row)
- Total Schedules
- Active Tickets
- Total Revenue
- Pending Approvals

#### **Quick Actions**
- ✅ Create Schedule
- ✅ Book Ticket
- ✅ Travel Document
- ✅ Manage Vehicles
- ✅ Manage Routes
- ✅ Manage Users (SUPER_ADMIN only)

#### **Coin Management**
- Current Balance Display
- Usage Breakdown:
  - Ticket Bookings (12 × 10k)
  - Travel Documents (3 × 10k)
- Request Top-Up Button
- Transaction Summary

#### **Recent Activities**
- Payment Approvals
- New Bookings
- Schedule Updates
- Pending Payments

#### **Pending Approvals**
- Payment Proofs (5 pending)
- Coin Requests (3 pending - SUPER_ADMIN only)
- New Drivers (2 pending)

#### **Super Admin Tools** (SUPER_ADMIN only)
- System Settings
- Manage Admins
- View All Balances
- System Reports

### 🎨 Layout Structure

```
┌─────────────────────────────────────────────────┐
│ Header (Role Badge, Welcome Message)           │
└─────────────────────────────────────────────────┘
┌─────────┬─────────┬─────────┬─────────┐
│ Stat 1  │ Stat 2  │ Stat 3  │ Stat 4  │
└─────────┴─────────┴─────────┴─────────┘
┌───────────────────────┬─────────────────┐
│ Quick Actions         │ Coin Balance    │
│                       ├─────────────────┤
│                       │ Pending         │
│                       │ Approvals       │
├───────────────────────┼─────────────────┤
│ Recent Activities     │ Super Admin     │
│                       │ Tools           │
│                       │ (if applicable) │
└───────────────────────┴─────────────────┘
```

### 💡 Usage Example

```typescript
// Accessing admin dashboard
// User must be ADMIN or SUPER_ADMIN
// Middleware auto-redirects if not authorized

// src/app/admin/dashboard/page.tsx
export default function AdminDashboard() {
  const { requireAnyRole, isSuperAdmin } = useAuth();

  useEffect(() => {
    requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }, []);

  return (
    <div>
      {/* Admin content */}

      {/* Super Admin only section */}
      {isSuperAdmin && (
        <SuperAdminTools />
      )}
    </div>
  );
}
```

---

## 2️⃣ Driver Dashboard

### 📊 Features

#### **Header**
- Personalized Welcome
- Status Badge (AVAILABLE, ON_TRIP, OFF_DUTY)

#### **Quick Stats**
- Trips Today (3 trips, 2 completed)
- Total Trips This Month (156)
- Total Passengers (Lifetime)
- Average Rating (4.8/5)

#### **Current Trip** (Highlighted Section)
- Route Information (Origin → Destination)
- Trip Status (IN TRANSIT, SCHEDULED, etc.)
- Passenger Count (12 passengers)
- Distance & ETA (150 KM, 2.5h)
- Quick Actions:
  - Update Location
  - View Passengers

#### **Today's Schedule**
- Morning Trip (08:00 AM - Completed)
- Afternoon Trip (01:00 PM - In Progress)
- Evening Trip (06:00 PM - Scheduled)

#### **Performance Metrics** (This Month)
- On-Time Rate (98%, +2%)
- Completion Rate (100%)
- Average Trip Time (3.2h, -5%)
- Customer Rating (4.8/5, +0.1)

#### **Quick Actions**
- ✅ Start Trip
- ✅ Update Status
- ✅ Passenger List
- ✅ Report Issue

#### **Next Trip Info**
- Departure Time
- Route
- Vehicle
- Passenger Count
- Countdown Timer

#### **Assigned Vehicle**
- Vehicle Number (B 1234 ABC)
- Type (EKSEKUTIF)
- Model (Mercedes Sprinter)
- Capacity (16 seats)

#### **Driver Tips**
- Update location every 10-15 minutes
- Check passenger list before departure
- Report vehicle issues immediately
- Maintain passenger communication

### 🎨 Layout Structure

```
┌─────────────────────────────────────────────────┐
│ Header (Status Badge, Welcome)                  │
└─────────────────────────────────────────────────┘
┌─────────┬─────────┬─────────┬─────────┐
│ Trips   │ Total   │ Pass    │ Rating  │
│ Today   │ Trips   │ Count   │ 4.8/5   │
└─────────┴─────────┴─────────┴─────────┘
┌───────────────────────┬─────────────────┐
│ ┏━━━━━━━━━━━━━━━━━┓  │ Quick Actions   │
│ ┃ Current Trip    ┃  ├─────────────────┤
│ ┃ (Highlighted)   ┃  │ Next Trip       │
│ ┗━━━━━━━━━━━━━━━━━┛  │                 │
├───────────────────────┼─────────────────┤
│ Today's Schedule      │ Assigned        │
│                       │ Vehicle         │
├───────────────────────┼─────────────────┤
│ Performance           │ Driver Tips     │
│ This Month            │                 │
└───────────────────────┴─────────────────┘
```

### 💡 Usage Example

```typescript
// Accessing driver dashboard
// User must be DRIVER
// Middleware auto-redirects if not authorized

// src/app/driver/dashboard/page.tsx
export default function DriverDashboard() {
  const { requireRole, user } = useAuth();

  useEffect(() => {
    requireRole(UserRole.DRIVER);
  }, []);

  return (
    <div>
      {/* Driver content */}
      <CurrentTrip />
      <TodaySchedule />
      <PerformanceMetrics />
    </div>
  );
}
```

---

## 🎨 Design System

### Color Palette

```typescript
// Admin Dashboard
{
  primary: 'blue-600',
  secondary: 'gray-600',
  accent: 'purple-600',
  success: 'green-600',
  warning: 'orange-600',
}

// Driver Dashboard
{
  primary: 'blue-600',
  secondary: 'gray-700',
  accent: 'purple-600',
  success: 'green-600',
  info: 'blue-500',
}
```

### Status Colors

```typescript
// Trip Status
{
  'completed': 'green',
  'in-progress': 'blue',
  'scheduled': 'gray',
  'cancelled': 'red',
}

// User Status
{
  'AVAILABLE': 'green',
  'ON_TRIP': 'blue',
  'OFF_DUTY': 'gray',
}

// Approval Status
{
  'PENDING': 'orange',
  'APPROVED': 'green',
  'REJECTED': 'red',
}
```

---

## 🔧 Component Library

### Reusable Components

#### **StatCard**
```typescript
<StatCard
  title="Total Schedules"
  value="24"
  change="+12%"
  icon={<Calendar />}
  trend="up"
/>
```

#### **ActionButton**
```typescript
<ActionButton
  icon={<Calendar />}
  label="Create Schedule"
  href="/admin/schedules/create"
  superAdminOnly={true}
/>
```

#### **ActivityItem**
```typescript
<ActivityItem
  icon={<CheckCircle />}
  title="Payment Approved"
  description="Ticket TKT-20251215-00123"
  time="5 minutes ago"
/>
```

#### **TripCard** (Driver)
```typescript
<TripCard
  time="08:00 AM"
  route="Jakarta - Bandung"
  status="completed"
  passengers={16}
  vehicle="B 1234 ABC"
/>
```

---

## 📊 Data Integration

### API Endpoints Used

#### Admin Dashboard
```typescript
// Stats
GET /api/v1/schedules?page=1&limit=100
GET /api/v1/tickets?status=CONFIRMED
GET /api/v1/coin-transactions/balance

// Pending Items
GET /api/v1/payment-proofs?status=PENDING
GET /api/v1/coin-requests?status=PENDING
GET /api/v1/drivers?status=PENDING_APPROVAL
```

#### Driver Dashboard
```typescript
// Trips
GET /api/v1/driver/trips?status=SCHEDULED
GET /api/v1/driver/trips/:scheduleId
GET /api/v1/driver/trips/:scheduleId/passengers

// Profile & Stats
GET /api/v1/driver/profile
GET /api/v1/schedules/:id

// Status Updates
POST /api/v1/driver/trips/:scheduleId/status
```

---

## 🔄 Real-Time Updates

### WebSocket Integration (Recommended)

```typescript
// Admin Dashboard
socket.on('payment-proof:updated', (data) => {
  // Refresh pending approvals
  refreshPendingApprovals();
});

socket.on('ticket:updated', (data) => {
  // Update active tickets count
  updateTicketStats();
});

// Driver Dashboard
socket.on('driver:trip-assigned', (schedule) => {
  // Show new trip notification
  showNewTripNotification(schedule);
});

socket.on('schedule:updated', (data) => {
  // Refresh today's schedule
  refreshSchedule();
});
```

---

## 🎯 Navigation Flow

### Admin Login Flow
```
Login as Admin
  ↓
Middleware validates role
  ↓
Redirects to /admin/dashboard
  ↓
Admin sees:
  - Quick stats
  - Coin balance
  - Pending approvals
  - Quick actions
```

### Driver Login Flow
```
Login as Driver
  ↓
Middleware validates role
  ↓
Redirects to /driver/dashboard
  ↓
Driver sees:
  - Current trip (if any)
  - Today's schedule
  - Performance metrics
  - Quick actions
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
// Mobile (< 768px)
- Single column layout
- Stacked cards
- Simplified navigation

// Tablet (768px - 1024px)
- Two column layout
- Grid-based stats

// Desktop (> 1024px)
- Three column layout
- Side-by-side panels
- Full feature set
```

---

## 🚀 Next Steps

### Admin Dashboard Enhancements
- [ ] Connect to real API endpoints
- [ ] Implement chart visualizations
- [ ] Add date range filters
- [ ] Export reports functionality
- [ ] Real-time notifications

### Driver Dashboard Enhancements
- [ ] Connect to real API endpoints
- [ ] GPS location tracking
- [ ] Trip navigation integration
- [ ] Offline mode support
- [ ] Push notifications

---

## 🧪 Testing Checklist

### Admin Dashboard
- [ ] Stats display correctly
- [ ] Coin balance accurate
- [ ] Quick actions navigate correctly
- [ ] Super Admin sections hidden for regular Admin
- [ ] Pending approvals show correct counts
- [ ] Recent activities update in real-time

### Driver Dashboard
- [ ] Current trip displayed when active
- [ ] Schedule shows today's trips only
- [ ] Performance metrics calculate correctly
- [ ] Quick actions work properly
- [ ] Vehicle info displays correctly
- [ ] Status updates work

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [MIDDLEWARE.md](./MIDDLEWARE.md) | Route protection middleware |
| [ROLE_BASED_REDIRECTS.md](./ROLE_BASED_REDIRECTS.md) | Login redirect system |
| [useAuth Hook](../src/hooks/README.md) | Authentication hook docs |
| [API Documentation](./README.md) | Backend API reference |

---

## 🎨 Screenshots

### Admin Dashboard
```
┌────────────────────────────────────────┐
│ 🎛️ SUPER ADMIN DASHBOARD              │
│ Welcome back, 081234567890             │
├────────┬────────┬────────┬────────────┤
│ 📅 24  │ 🎫 156 │ 📈 45M │ ⚠️ 8      │
│ Scheds │ Ticket │ Revenue│ Pending    │
├────────┴────────┴────────┴────────────┤
│ ⚡ Quick Actions                       │
│ [Create] [Book] [Document] [Vehicles] │
├────────────────────┬───────────────────┤
│ 📋 Recent          │ 💰 Coin Balance   │
│ Activities         │ 250,000 coins     │
│                    ├───────────────────┤
│                    │ ⏳ Pending        │
│                    │ Approvals         │
└────────────────────┴───────────────────┘
```

### Driver Dashboard
```
┌────────────────────────────────────────┐
│ 🚗 DRIVER PANEL         🟢 AVAILABLE  │
│ Welcome back, 081234567890             │
├────────┬────────┬────────┬────────────┤
│ 📅 3   │ 🚗 156 │ 👥 1.2K│ ⭐ 4.8    │
│ Today  │ Trips  │ Pass   │ Rating     │
├────────┴────────┴────────┴────────────┤
│ 🔵 CURRENT TRIP - IN TRANSIT          │
│ Jakarta → Bandung • 12 passengers     │
│ 150 KM • 2.5h ETA                     │
│ [Update Location] [View Passengers]   │
├────────────────────┬───────────────────┤
│ 📋 Today's         │ ⚡ Quick Actions  │
│ Schedule           │ [Start Trip]      │
│                    │ [Update Status]   │
└────────────────────┴───────────────────┘
```

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Aligned with**: Mobile Travel App API v2.0.0
