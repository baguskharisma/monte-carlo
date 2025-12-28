/**
 * Analytics Service
 * Handles all analytics-related API calls for SUPER_ADMIN dashboard
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  GetDashboardStatsResponse,
  GetCoinTrendsResponse,
  GetRecentCoinRequestsResponse,
  GetCoinRequestStatisticsResponse,
  GetRevenueByRouteResponse,
  GetRevenueTrendsResponse,
  GetCostBreakdownResponse,
  GetUtilizationMetricsResponse,
  CoinTrendsParams,
  RevenueAnalyticsParams,
  AnalyticsDateRange,
} from '@/types/analytics.types'

/**
 * Analytics Service Class
 */
class AnalyticsService {
  /**
   * Get dashboard statistics
   * Returns overview metrics for SUPER_ADMIN dashboard
   * @returns Dashboard stats with totals and growth metrics
   */
  async getDashboardStats(): Promise<GetDashboardStatsResponse> {
    try {
      const response: unknown = await apiClient.get(
        API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS
      )
      return response as GetDashboardStatsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get coin transaction trends over time
   * Returns aggregated coin transactions (TOP_UP, DEDUCTION, REFUND) grouped by date
   * @param params - Optional filters (days, startDate, endDate)
   * @returns Time-series data for coin transactions
   */
  async getCoinTransactionTrends(
    params?: CoinTrendsParams
  ): Promise<GetCoinTrendsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.days) {
        queryParams.append('days', String(params.days))
      }
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate)
      }

      const url = `${API_ENDPOINTS.ANALYTICS.COIN_TRENDS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCoinTrendsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get recent coin requests
   * Returns latest coin requests for dashboard display
   * @param limit - Number of requests to return (default: 5)
   * @returns List of recent coin requests
   */
  async getRecentCoinRequests(
    limit: number = 5
  ): Promise<GetRecentCoinRequestsResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('limit', String(limit))

      const url = `${API_ENDPOINTS.ANALYTICS.RECENT_REQUESTS}?${queryParams.toString()}`

      const response: unknown = await apiClient.get(url)
      return response as GetRecentCoinRequestsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get coin request statistics
   * Returns counts by status (pending, approved, rejected)
   * Role-based: Super Admin sees all, Regular Admin sees only their own
   * @returns Coin request statistics
   */
  async getCoinRequestStatistics(): Promise<GetCoinRequestStatisticsResponse> {
    try {
      const response: unknown = await apiClient.get(API_ENDPOINTS.COINS.STATISTICS)
      return response as GetCoinRequestStatisticsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get revenue breakdown by route
   * Returns revenue metrics grouped by route
   * @param params - Optional filters (date range, sorting)
   * @returns Revenue data by route
   */
  async getRevenueByRoute(
    params?: RevenueAnalyticsParams
  ): Promise<GetRevenueByRouteResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate)
      }
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy)
      }
      if (params?.order) {
        queryParams.append('order', params.order)
      }

      const url = `${API_ENDPOINTS.ANALYTICS.REVENUE_BY_ROUTE}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetRevenueByRouteResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get revenue trends over time
   * Returns revenue data grouped by time period (day/week/month)
   * @param params - Optional filters (date range, groupBy, sorting)
   * @returns Time-series revenue data
   */
  async getRevenueTrends(
    params?: RevenueAnalyticsParams
  ): Promise<GetRevenueTrendsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate)
      }
      if (params?.groupBy) {
        queryParams.append('groupBy', params.groupBy)
      }

      const url = `${API_ENDPOINTS.ANALYTICS.REVENUE_TRENDS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetRevenueTrendsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get cost breakdown analysis
   * Returns operational costs vs revenue with profit margins
   * @param params - Optional date range filter
   * @returns Cost breakdown summary and categories
   */
  async getCostBreakdown(
    params?: AnalyticsDateRange
  ): Promise<GetCostBreakdownResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate)
      }

      const url = `${API_ENDPOINTS.ANALYTICS.COST_BREAKDOWN}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCostBreakdownResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get schedule utilization metrics
   * Returns capacity utilization and efficiency metrics
   * @param params - Optional date range filter
   * @returns Utilization summary and breakdown by route
   */
  async getUtilizationMetrics(
    params?: AnalyticsDateRange
  ): Promise<GetUtilizationMetricsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate)
      }

      const url = `${API_ENDPOINTS.ANALYTICS.UTILIZATION_METRICS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetUtilizationMetricsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
export default analyticsService
