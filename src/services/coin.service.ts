/**
 * Coin Service
 * Handles all coin-related API calls (requests, transactions, balance)
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  CoinRequest,
  GetCoinRequestsResponse,
  CoinRequestActionResponse,
  GetCoinTransactionsResponse,
} from '@/types/coin.types'
import type { CoinRequestStatus, CoinTransactionType } from '@/lib/constants'

/**
 * Coin Service Class
 */
class CoinService {
  /**
   * Get coin requests list with optional filtering and pagination
   * @param params - Query parameters (status, page, limit)
   * @returns Paginated list of coin requests
   */
  async getCoinRequests(params?: {
    status?: CoinRequestStatus
    page?: number
    limit?: number
  }): Promise<GetCoinRequestsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.status) {
        queryParams.append('status', params.status)
      }
      if (params?.page) {
        queryParams.append('page', String(params.page))
      }
      if (params?.limit) {
        queryParams.append('limit', String(params.limit))
      }

      const url = `${API_ENDPOINTS.COINS.REQUESTS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCoinRequestsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get a single coin request by ID
   * @param id - Coin request ID
   * @returns Coin request details
   */
  async getCoinRequestById(id: string): Promise<CoinRequest> {
    try {
      const response: unknown = await apiClient.get(
        `${API_ENDPOINTS.COINS.REQUESTS}/${id}`
      )
      return response as CoinRequest
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Approve a coin request
   * Credits the admin's account with the requested coin amount
   * @param requestId - Coin request ID to approve
   * @returns Updated coin request with approval details
   */
  async approveCoinRequest(requestId: string): Promise<CoinRequestActionResponse> {
    try {
      const response: unknown = await apiClient.post(
        `${API_ENDPOINTS.COINS.REQUESTS}/${requestId}/approve`
      )
      return response as CoinRequestActionResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Reject a coin request
   * Requires a rejection reason for audit trail
   * @param requestId - Coin request ID to reject
   * @param rejectionReason - Reason for rejection (10-500 characters)
   * @returns Updated coin request with rejection details
   */
  async rejectCoinRequest(
    requestId: string,
    rejectionReason: string
  ): Promise<CoinRequestActionResponse> {
    try {
      const response: unknown = await apiClient.post(
        `${API_ENDPOINTS.COINS.REQUESTS}/${requestId}/reject`,
        { rejectionReason }
      )
      return response as CoinRequestActionResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get coin transactions history
   * Optionally filter by admin ID
   * @param adminId - Optional admin ID to filter transactions
   * @param params - Query parameters (page, limit)
   * @returns Paginated list of coin transactions
   */
  async getCoinTransactions(
    adminId?: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<GetCoinTransactionsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (adminId) {
        queryParams.append('adminId', adminId)
      }
      if (params?.page) {
        queryParams.append('page', String(params.page))
      }
      if (params?.limit) {
        queryParams.append('limit', String(params.limit))
      }

      const url = `${API_ENDPOINTS.COINS.TRANSACTIONS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCoinTransactionsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get current authenticated user's coin balance
   * @returns Current coin balance with user info
   */
  async getCurrentCoinBalance(): Promise<{
    id: string
    name: string
    coinBalance: number
  }> {
    try {
      const response: unknown = await apiClient.get(
        `${API_ENDPOINTS.COINS.TRANSACTIONS}/balance`
      )
      return response as { id: string; name: string; coinBalance: number }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get specific admin's coin balance (SUPER_ADMIN only)
   * @param adminId - Admin ID
   * @returns Admin's coin balance
   */
  async getAdminCoinBalance(adminId: string): Promise<{ balance: number }> {
    try {
      const response: unknown = await apiClient.get(
        `/admins/${adminId}/coin-balance`
      )
      return response as { balance: number }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get specific admin's coin transactions
   * @param adminId - Admin ID
   * @param params - Query parameters (page, limit)
   * @returns Admin's transaction history
   */
  async getAdminCoinTransactions(
    adminId: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<GetCoinTransactionsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) {
        queryParams.append('page', String(params.page))
      }
      if (params?.limit) {
        queryParams.append('limit', String(params.limit))
      }

      const url = `/admins/${adminId}/coin-transactions${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCoinTransactionsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get current ADMIN's own coin transactions
   * @param filters - Filter parameters (type, date range, pagination)
   * @returns Paginated list of transactions
   */
  async getMyTransactions(filters?: {
    type?: CoinTransactionType
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<GetCoinTransactionsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.type) {
        queryParams.append('type', filters.type)
      }
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate)
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate)
      }
      if (filters?.page) {
        queryParams.append('page', String(filters.page))
      }
      if (filters?.limit) {
        queryParams.append('limit', String(filters.limit))
      }

      const url = `${API_ENDPOINTS.COINS.TRANSACTIONS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCoinTransactionsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get current ADMIN's own coin requests
   * @param status - Filter by status
   * @returns List of coin requests
   */
  async getMyCoinRequests(params?: {
    status?: CoinRequestStatus
    page?: number
    limit?: number
  }): Promise<GetCoinRequestsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.status) {
        queryParams.append('status', params.status)
      }
      if (params?.page) {
        queryParams.append('page', String(params.page))
      }
      if (params?.limit) {
        queryParams.append('limit', String(params.limit))
      }

      const url = `${API_ENDPOINTS.COINS.REQUESTS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetCoinRequestsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create a new coin top-up request
   * @param data - Request data (amount, notes)
   * @returns Created coin request
   */
  async createCoinRequest(data: {
    amount: number
    notes?: string
  }): Promise<{ success: boolean; data: CoinRequest; message: string }> {
    try {
      const response: unknown = await apiClient.post(
        API_ENDPOINTS.COINS.REQUESTS,
        data
      )
      return response as { success: boolean; data: CoinRequest; message: string }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const coinService = new CoinService()
export default coinService
