<<<<<<< HEAD
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
=======
/**
 * Super Admin Dashboard Page
 */

'use client'

import { StatCard } from '@/components/ui/StatCard'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { CoinConsumptionChart } from '@/components/charts/CoinConsumptionChart'
import { RecentCoinRequestsTable } from '@/components/analytics/RecentCoinRequestsTable'
import {
  useDashboardStats,
  useCoinTransactionTrends,
  useRecentCoinRequests,
} from '@/hooks/useAnalytics'
import { Users, Coins, Calendar, Ticket } from 'lucide-react'

export default function SuperAdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: revenueTrendsResponse, isLoading: revenueLoading } =
    useCoinTransactionTrends({ days: 7 })
  const { data: consumptionTrendsResponse, isLoading: consumptionLoading } =
    useCoinTransactionTrends({ days: 30 })
  const { data: recentRequestsResponse, isLoading: requestsLoading } =
    useRecentCoinRequests(5)

  // Extract data from responses (backend returns data directly for stats, but wrapped for others)
  const revenueTrends = revenueTrendsResponse?.data || []
  const consumptionTrends = consumptionTrendsResponse?.data || []
  const recentRequests = recentRequestsResponse?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to the Monte Carlo Super Admin dashboard.
        </p>
      </div>

      {/* Stats Grid - 4 StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Admins"
          value={stats?.totalAdmins || 0}
          icon={<Users className="h-4 w-4" />}
          loading={statsLoading}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title="Total Coins"
          value={stats?.totalCoinsInCirculation || 0}
          icon={<Coins className="h-4 w-4" />}
          loading={statsLoading}
          iconClassName="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
        />
        <StatCard
          title="Active Schedules"
          value={stats?.activeSchedules || 0}
          icon={<Calendar className="h-4 w-4" />}
          loading={statsLoading}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={<Ticket className="h-4 w-4" />}
          trend={stats?.growth?.bookingsGrowthPercentage}
          trendLabel="vs yesterday"
          loading={statsLoading}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueTrends} loading={revenueLoading} />
        <CoinConsumptionChart
          data={consumptionTrends}
          loading={consumptionLoading}
        />
      </div>

      {/* Recent Coin Requests */}
      <RecentCoinRequestsTable
        requests={recentRequests}
        loading={requestsLoading}
      />
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
    </div>
  )
}
