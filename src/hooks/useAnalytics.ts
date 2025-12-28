/**
 * React Query Hooks for Analytics
 * Custom hooks for fetching analytics data for SUPER_ADMIN dashboard
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import { ANALYTICS_QUERY_KEYS } from '@/types/analytics.types'
import type {
  CoinTrendsParams,
  RevenueAnalyticsParams,
  AnalyticsDateRange,
} from '@/types/analytics.types'

/**
 * Hook to fetch dashboard statistics
 * @returns Dashboard stats with totals and growth metrics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboard.stats(),
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 120000, // 2 minutes - reduce API calls
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  })
}

/**
 * Hook to fetch coin transaction trends
 * @param params - Optional filters (days, startDate, endDate)
 * @returns Time-series data for coin transactions (TOP_UP, DEDUCTION, REFUND)
 */
export function useCoinTransactionTrends(params?: CoinTrendsParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.coins.trends(params),
    queryFn: () => analyticsService.getCoinTransactionTrends(params),
    staleTime: 180000, // 3 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch recent coin requests
 * @param limit - Number of requests to return (default: 5)
 * @returns List of recent coin requests for dashboard display
 */
export function useRecentCoinRequests(limit: number = 5) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.coins.recentRequests(limit),
    queryFn: () => analyticsService.getRecentCoinRequests(limit),
    staleTime: 60000, // 1 minute - recent requests change frequently
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch revenue breakdown by route
 * @param params - Optional filters (date range, sorting)
 * @returns Revenue metrics grouped by route
 */
export function useRevenueByRoute(params?: RevenueAnalyticsParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.revenue.byRoute(params),
    queryFn: () => analyticsService.getRevenueByRoute(params),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch revenue trends over time
 * @param params - Optional filters (date range, groupBy)
 * @returns Time-series revenue data
 */
export function useRevenueTrends(params?: RevenueAnalyticsParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.revenue.trends(params),
    queryFn: () => analyticsService.getRevenueTrends(params),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch cost breakdown analysis
 * @param params - Optional date range filter
 * @returns Cost breakdown summary and categories
 */
export function useCostBreakdown(params?: AnalyticsDateRange) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.costs.breakdown(params),
    queryFn: () => analyticsService.getCostBreakdown(params),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch schedule utilization metrics
 * @param params - Optional date range filter
 * @returns Utilization summary and breakdown by route
 */
export function useUtilizationMetrics(params?: AnalyticsDateRange) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.utilization.metrics(params),
    queryFn: () => analyticsService.getUtilizationMetrics(params),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
