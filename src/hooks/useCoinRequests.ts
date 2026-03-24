/**
 * React Query Hooks for Coin Requests
 * Custom hooks for fetching and mutating coin request data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { coinService } from '@/services/coin.service'
import { COIN_QUERY_KEYS } from '@/types/coin.types'
import apiClient from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CoinRequestStatus } from '@/lib/constants'
import type { CoinTransactionType } from '@/lib/constants'

/**
 * Hook to fetch coin requests list
 * @param status - Filter by status (PENDING, APPROVED, REJECTED)
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 */
export function useCoinRequests(
  status?: CoinRequestStatus,
  page: number = 1,
  limit: number = 50
) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.list(status),
    queryFn: () => coinService.getCoinRequests({ status, page, limit }),
    staleTime: 120000, // 2 minutes - reduce API calls
    refetchOnWindowFocus: false, // Disable refetch on window focus to avoid rate limits
    refetchInterval: false, // Disable automatic polling
  })
}

/**
 * Hook to fetch a single coin request by ID
 * @param id - Coin request ID
 */
export function useCoinRequest(id: string) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.detail(id),
    queryFn: () => coinService.getCoinRequestById(id),
    staleTime: 30000,
    enabled: !!id, // Only run query if ID is provided
  })
}

/**
 * Hook to get coin request statistics (counts by status)
 * Uses the new /coin-requests/statistics endpoint for better performance
 */
export function useCoinRequestStats() {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.stats(),
    queryFn: async () => {
      // Use the new statistics endpoint (single API call instead of 3)
      const response: unknown = await apiClient.get(API_ENDPOINTS.COINS.STATISTICS)
      const stats = response as { pending: number; approved: number; rejected: number }

      return {
        pending: stats.pending,
        approved: stats.approved,
        rejected: stats.rejected,
        total: stats.pending + stats.approved + stats.rejected,
      }
    },
    staleTime: 60000, // 1 minute - stats change when requests are processed
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  })
}

/**
 * Hook to approve a coin request
 * Invalidates coin request queries on success
 */
export function useApproveCoinRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => coinService.approveCoinRequest(requestId),
    onSuccess: (data) => {
      // Invalidate all coin request lists to trigger refetch
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.lists(),
      })

      // Also invalidate stats
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.stats(),
      })

      // Show success toast with defensive coding
      const amount = data.data?.amount
      toast.success('Coin request approved successfully', {
        description: amount
          ? `${amount.toLocaleString()} coins have been credited to the admin's account`
          : 'Coins have been credited successfully',
      })
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error('Failed to approve coin request', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to reject a coin request
 * Requires rejection reason
 * Invalidates coin request queries on success
 */
export function useRejectCoinRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      rejectionReason,
    }: {
      requestId: string
      rejectionReason: string
    }) => coinService.rejectCoinRequest(requestId, rejectionReason),
    onSuccess: () => {
      // Invalidate all coin request lists to trigger refetch
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.lists(),
      })

      // Also invalidate stats
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.stats(),
      })

      // Show success toast
      toast.success('Coin request rejected', {
        description: 'The admin has been notified of the rejection',
      })
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error('Failed to reject coin request', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to fetch coin transactions
 * @param adminId - Optional admin ID to filter transactions
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 */
export function useCoinTransactions(
  adminId?: string,
  page: number = 1,
  limit: number = 50
) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.transactions.list(adminId),
    queryFn: () => coinService.getCoinTransactions(adminId, { page, limit }),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to fetch specific admin's coin transaction history
 * Uses the correct endpoint: /admins/{adminId}/coin-transactions
 * @param adminId - Admin ID (required)
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 */
export function useAdminCoinTransactions(
  adminId: string,
  page: number = 1,
  limit: number = 50
) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.transactions.list(adminId),
    queryFn: () => coinService.getAdminCoinTransactions(adminId, { page, limit }),
    enabled: !!adminId, // Only run query if adminId is provided
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to fetch current authenticated user's coin balance
 * @returns Current coin balance
 */
export function useCoinBalance() {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.balance.current(),
    queryFn: () => coinService.getCurrentCoinBalance(),
    staleTime: 60000, // 1 minute - balance can change frequently
    refetchOnWindowFocus: true, // Refetch when window gains focus to show latest balance
  })
}

/**
 * Hook to fetch specific admin's coin balance (SUPER_ADMIN only)
 * @param adminId - Admin ID (required)
 * @returns Admin's coin balance
 */
export function useAdminCoinBalance(adminId: string) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.balance.admin(adminId),
    queryFn: () => coinService.getAdminCoinBalance(adminId),
    enabled: !!adminId, // Only run query if adminId is provided
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch current ADMIN's own transaction history
 * @param filters - Filter parameters (type, date range, pagination)
 */
export function useMyTransactions(filters?: {
  type?: CoinTransactionType
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.myTransactions.list(filters),
    queryFn: () => coinService.getMyTransactions(filters),
    staleTime: 30000, // 30 seconds - balance changes frequently
    refetchOnWindowFocus: false, // Manual refresh only
  })
}

/**
 * Hook to fetch current ADMIN's own coin requests
 * @param status - Filter by status
 */
export function useMyCoinRequests(status?: CoinRequestStatus) {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.myRequests.list(status),
    queryFn: () => coinService.getMyCoinRequests({ status }),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to create a new coin top-up request
 * Creates a request for coin top-up
 */
export function useCreateCoinRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      amount: number
      notes?: string
    }) => coinService.createCoinRequest(data),
    onSuccess: (response) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.myRequests.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.balance.current(),
      })
      queryClient.invalidateQueries({
        queryKey: COIN_QUERY_KEYS.myTransactions.lists(),
      })

      // Show success message with amount if available
      const amount = response.data?.amount
      toast.success('Top-up request submitted successfully', {
        description: amount
          ? `Request for ${amount.toLocaleString()} coins is pending approval`
          : 'Your request is pending approval',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to submit top-up request', {
        description: error.message || 'Please try again later',
      })
    },
  })
}
