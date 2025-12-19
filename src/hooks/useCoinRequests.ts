/**
 * React Query Hooks for Coin Requests
 * Custom hooks for fetching and mutating coin request data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { coinService } from '@/services/coin.service'
import { COIN_QUERY_KEYS } from '@/types/coin.types'
import type { CoinRequestStatus } from '@/lib/constants'

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
 * Fetches counts for pending, approved, and rejected requests
 */
export function useCoinRequestStats() {
  return useQuery({
    queryKey: COIN_QUERY_KEYS.stats(),
    queryFn: async () => {
      // Fetch counts for all statuses in parallel
      const [pending, approved, rejected] = await Promise.all([
        coinService.getCoinRequests({ status: 'PENDING', limit: 1 }),
        coinService.getCoinRequests({ status: 'APPROVED', limit: 1 }),
        coinService.getCoinRequests({ status: 'REJECTED', limit: 1 }),
      ])

      return {
        pending: pending.pagination.total,
        approved: approved.pagination.total,
        rejected: rejected.pagination.total,
        total:
          pending.pagination.total +
          approved.pagination.total +
          rejected.pagination.total,
      }
    },
    staleTime: 300000, // 5 minutes - stats don't change frequently
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

      // Show success toast
      toast.success('Coin request approved successfully', {
        description: `${data.data.amount} coins have been credited to the admin's account`,
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
