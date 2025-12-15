/**
 * EXAMPLES - Contoh penggunaan shared components
 *
 * File ini berisi contoh-contoh implementasi shared components.
 * Bisa digunakan sebagai referensi saat menggunakan komponen.
 */

import React from 'react'
import {
  DataTable,
  StatCard,
  MetricCard,
  EmptyState,
  NoData,
  ErrorState,
  ErrorBoundary,
  StatCardSkeleton,
  TableSkeleton,
} from '@/components/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'

// ============================================
// Example 1: DataTable dengan custom rendering
// ============================================

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
}

function UsersTableExample() {
  const [users, setUsers] = React.useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'inactive',
      lastLogin: '2024-01-10',
    },
  ])

  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      width: '200px',
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      width: '100px',
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      sortable: true,
      width: '150px',
    },
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      searchable
      searchPlaceholder="Search users..."
      pageSize={10}
      pageSizeOptions={[5, 10, 20, 50]}
    />
  )
}

// ============================================
// Example 2: Dashboard dengan Stats Cards
// ============================================

function DashboardStatsExample() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 2000)
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value="$85,420"
        icon={<DollarSign className="h-4 w-4" />}
        description="Total revenue this month"
        trend={{ value: 12.5, isPositive: true }}
      />
      <StatCard
        title="Total Bookings"
        value="1,234"
        icon={<ShoppingBag className="h-4 w-4" />}
        description="Total bookings this month"
        trend={{ value: 8.2, isPositive: true }}
      />
      <StatCard
        title="Active Trips"
        value="456"
        icon={<TrendingUp className="h-4 w-4" />}
        description="Currently active trips"
        trend={{ value: -3.1, isPositive: false }}
      />
      <StatCard
        title="Total Users"
        value="8,945"
        icon={<Users className="h-4 w-4" />}
        description="Registered users"
        trend={{ value: 15.3, isPositive: true }}
      />
    </div>
  )
}

// ============================================
// Example 3: Metric Cards dengan variants
// ============================================

function MetricsExample() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Total Sales"
        value="$24,500"
        icon={<DollarSign className="h-5 w-5" />}
        change={{ value: 12.5, period: 'last month' }}
        variant="success"
      />
      <MetricCard
        label="Pending Orders"
        value="23"
        icon={<ShoppingBag className="h-5 w-5" />}
        change={{ value: -5.2, period: 'last week' }}
        variant="warning"
      />
      <MetricCard
        label="Failed Transactions"
        value="3"
        icon={<TrendingUp className="h-5 w-5" />}
        change={{ value: -50, period: 'yesterday' }}
        variant="danger"
      />
    </div>
  )
}

// ============================================
// Example 4: Empty States
// ============================================

function EmptyStatesExample() {
  const [hasData, setHasData] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('test')

  if (!hasData && !searchQuery) {
    return (
      <NoData
        resource="bookings"
        onAdd={() => console.log('Add booking')}
      />
    )
  }

  if (!hasData && searchQuery) {
    return (
      <NoSearchResults
        searchTerm={searchQuery}
        onClear={() => setSearchQuery('')}
      />
    )
  }

  return null
}

// ============================================
// Example 5: Error Boundary dengan Error State
// ============================================

function ErrorBoundaryExample() {
  const [hasError, setHasError] = React.useState(false)

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load bookings"
        description="We couldn't load your bookings. Please try again."
        onRetry={() => setHasError(false)}
      />
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught:', error, errorInfo)
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  )
}

function YourComponent() {
  return <div>Your content here</div>
}

// ============================================
// Example 6: Modal/Dialog dengan Form
// ============================================

function DialogExample() {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Booking</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Form fields here */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Example 7: DataTable dengan Loading State
// ============================================

function DataTableWithLoadingExample() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<User[]>([])

  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          status: 'active',
          lastLogin: '2024-01-15',
        },
      ])
      setLoading(false)
    }, 2000)
  }, [])

  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'role', title: 'Role', sortable: true },
  ]

  if (loading) {
    return <TableSkeleton rows={5} columns={3} />
  }

  if (data.length === 0) {
    return (
      <NoData
        resource="users"
        onAdd={() => console.log('Add user')}
      />
    )
  }

  return <DataTable data={data} columns={columns} />
}

// ============================================
// Example 8: Complete Page Example
// ============================================

function CompletePage() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening.
          </p>
        </div>

        {/* Stats */}
        <DashboardStatsExample />

        {/* Metrics */}
        <MetricsExample />

        {/* Table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <DialogExample />
          </div>
          <UsersTableExample />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export {
  UsersTableExample,
  DashboardStatsExample,
  MetricsExample,
  EmptyStatesExample,
  ErrorBoundaryExample,
  DialogExample,
  DataTableWithLoadingExample,
  CompletePage,
}
