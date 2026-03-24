/**
 * Analytics Type Definitions
 * Types for dashboard statistics, revenue analytics, cost breakdown, and utilization metrics
 */

import type { CoinRequestStatus } from '@/lib/constants'

// ============================================================================
// Dashboard Stats Types
// ============================================================================

/**
 * Dashboard Statistics Response
 * Overview metrics for SUPER_ADMIN dashboard
 */
export interface DashboardStats {
  totalAdmins: number
  totalCoinsInCirculation: number
  activeSchedules: number
  totalBookings: number
  growth?: {
    bookingsToday: number
    bookingsYesterday: number
    bookingsGrowthPercentage: number
    revenueToday: number
    revenueYesterday: number
    revenueGrowthPercentage: number
  }
}

// Backend returns data directly without wrapper
export type GetDashboardStatsResponse = DashboardStats

// ============================================================================
// Coin Transaction Trends Types
// ============================================================================

/**
 * Coin Transaction Trend Data Point
 * Represents aggregated coin transactions for a specific date
 */
export interface CoinTrendDataPoint {
  date: string // ISO date string
  topUp: number // Total TOP_UP transactions
  deduction: number // Total DEDUCTION transactions
  refund: number // Total REFUND transactions
}

export interface GetCoinTrendsResponse {
  success: boolean
  data: CoinTrendDataPoint[]
}

// ============================================================================
// Recent Coin Requests Types
// ============================================================================

/**
 * Recent Coin Request (simplified for dashboard display)
 */
export interface RecentCoinRequest {
  id: string
  adminId: string
  adminName: string
  amount: number
  status: CoinRequestStatus
  createdAt: string
}

export interface GetRecentCoinRequestsResponse {
  success: boolean
  data: RecentCoinRequest[]
}

/**
 * Coin Request Statistics
 * Shows counts by status (pending, approved, rejected)
 */
export interface CoinRequestStatistics {
  pending: number
  approved: number
  rejected: number
}

export type GetCoinRequestStatisticsResponse = CoinRequestStatistics

// ============================================================================
// Revenue Analytics Types
// ============================================================================

/**
 * Revenue breakdown by route
 */
export interface RevenueByRoute {
  routeId: string
  origin: string
  destination: string
  totalBookings: number
  totalPassengers: number
  totalRevenue: number
  averagePrice: number
}

export interface GetRevenueByRouteResponse {
  success: boolean
  data: RevenueByRoute[]
}

/**
 * Revenue trend over time
 */
export interface RevenueTrendDataPoint {
  date: string // ISO date string
  revenue: number
  bookings: number
  growthRate?: number // Percentage growth compared to previous period
}

export interface GetRevenueTrendsResponse {
  success: boolean
  data: RevenueTrendDataPoint[]
}

// ============================================================================
// Cost Breakdown Types
// ============================================================================

/**
 * Cost breakdown summary
 */
export interface CostBreakdown {
  totalRevenue: number
  totalFuelCost: number
  totalDriverWage: number
  totalSnackCost: number
  totalCost: number
  netProfit: number
  profitMargin: number // Percentage
}

/**
 * Individual cost category
 */
export interface CostCategory {
  name: string
  amount: number
  percentage: number
  [key: string]: string | number // Index signature for Recharts compatibility
}

export interface GetCostBreakdownResponse {
  success: boolean
  data: {
    summary: CostBreakdown
    categories: CostCategory[]
  }
}

// ============================================================================
// Schedule Utilization Types
// ============================================================================

/**
 * Overall schedule utilization metrics
 */
export interface ScheduleUtilization {
  totalSchedules: number
  completedSchedules: number
  totalCapacity: number
  totalBooked: number
  utilizationRate: number // Percentage (0-100)
  averageOccupancy: number // Average seats per schedule
}

/**
 * Utilization breakdown by route
 */
export interface UtilizationByRoute {
  routeId: string
  origin: string
  destination: string
  capacity: number
  booked: number
  utilizationRate: number // Percentage (0-100)
}

export interface GetUtilizationMetricsResponse {
  success: boolean
  data: {
    summary: ScheduleUtilization
    byRoute: UtilizationByRoute[]
  }
}

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Base date range filter
 */
export interface AnalyticsDateRange {
  startDate?: string // ISO date string
  endDate?: string // ISO date string
}

/**
 * Coin trends query parameters
 */
export interface CoinTrendsParams extends AnalyticsDateRange {
  days?: number // Preset: 7, 30, 90
}

/**
 * Revenue analytics query parameters
 */
export interface RevenueAnalyticsParams extends AnalyticsDateRange {
  groupBy?: 'day' | 'week' | 'month'
  sortBy?: 'revenue' | 'bookings'
  order?: 'asc' | 'desc'
}

// ============================================================================
// React Query Key Factory
// ============================================================================

/**
 * Query key factory for analytics-related queries
 * Provides type-safe and hierarchical query keys for React Query
 */
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,

  dashboard: {
    all: ['analytics', 'dashboard'] as const,
    stats: () => ['analytics', 'dashboard', 'stats'] as const,
  },

  coins: {
    all: ['analytics', 'coins'] as const,
    trends: (params?: CoinTrendsParams) =>
      ['analytics', 'coins', 'trends', params] as const,
    recentRequests: (limit?: number) =>
      ['analytics', 'coins', 'recent-requests', limit] as const,
    statistics: () => ['analytics', 'coins', 'statistics'] as const,
  },

  revenue: {
    all: ['analytics', 'revenue'] as const,
    byRoute: (params?: RevenueAnalyticsParams) =>
      ['analytics', 'revenue', 'by-route', params] as const,
    trends: (params?: RevenueAnalyticsParams) =>
      ['analytics', 'revenue', 'trends', params] as const,
  },

  costs: {
    all: ['analytics', 'costs'] as const,
    breakdown: (params?: AnalyticsDateRange) =>
      ['analytics', 'costs', 'breakdown', params] as const,
  },

  utilization: {
    all: ['analytics', 'utilization'] as const,
    metrics: (params?: AnalyticsDateRange) =>
      ['analytics', 'utilization', 'metrics', params] as const,
  },
} as const
