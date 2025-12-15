import { StatCard } from '@/components/features/dashboard/StatCard'
import { RevenueChart } from '@/components/features/dashboard/RevenueChart'
import { BookingTrendChart } from '@/components/features/dashboard/BookingTrendChart'
import { RecentActivityList } from '@/components/features/dashboard/RecentActivityList'
import { CoinRequestTable } from '@/components/features/coins/CoinRequestTable'
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Stats Cards */}
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
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Total Users"
          value="8,945"
          icon={<Users className="h-4 w-4" />}
          description="Registered users"
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart />
        <BookingTrendChart />
      </div>

      {/* Tables and Activity Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <CoinRequestTable />
        <RecentActivityList />
      </div>
    </div>
  )
}
