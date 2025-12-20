/**
 * Payment Proof React Query Hooks
 * Handles all payment proof-related data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { paymentProofService } from '@/services/payment-proof.service'
import {
  PAYMENT_PROOF_QUERY_KEYS,
  type GetPaymentProofsResponse,
  type PaymentProof,
  type ApprovePaymentProofResponse,
  type RejectPaymentProofResponse,
  type ApprovePaymentProofFormData,
  type RejectPaymentProofFormData,
} from '@/types/payment-proof.types'
import type { PaymentProofStatus } from '@/lib/constants'

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook untuk fetching payment proofs list dengan optional filtering
 * @param status - Filter by payment proof status
 * @param page - Page number for pagination
 * @param limit - Items per page
 */
export function usePaymentProofs(params?: {
  status?: PaymentProofStatus
  page?: number
  limit?: number
}) {
  return useQuery<GetPaymentProofsResponse, Error>({
    queryKey: PAYMENT_PROOF_QUERY_KEYS.list(params?.status),
    queryFn: () => paymentProofService.getPaymentProofs(params),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook untuk fetching single payment proof detail dengan populated data
 * @param id - Payment proof ID
 * @param enabled - Whether to enable the query
 */
export function usePaymentProof(id: string, enabled = true) {
  return useQuery<PaymentProof, Error>({
    queryKey: PAYMENT_PROOF_QUERY_KEYS.detail(id),
    queryFn: () => paymentProofService.getPaymentProofById(id),
    enabled: enabled && !!id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook untuk fetching payment proof statistics
 * Returns counts for each status (PENDING, APPROVED, REJECTED)
 */
export function usePaymentProofStats() {
  return useQuery({
    queryKey: PAYMENT_PROOF_QUERY_KEYS.stats(),
    queryFn: async () => {
      // Fetch all proofs and calculate stats client-side
      // If API has dedicated stats endpoint, use that instead
      const response = await paymentProofService.getPaymentProofs()
      const proofs = response.data

      return {
        pending: proofs.filter((p) => p.status === 'PENDING').length,
        approved: proofs.filter((p) => p.status === 'APPROVED').length,
        rejected: proofs.filter((p) => p.status === 'REJECTED').length,
        total: proofs.length,
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook untuk approve payment proof
 * Automatically creates CONFIRMED ticket dan deducts coins
 */
export function useApprovePaymentProof() {
  const queryClient = useQueryClient()

  return useMutation<
    ApprovePaymentProofResponse,
    Error,
    { proofId: string; data: ApprovePaymentProofFormData }
  >({
    mutationFn: ({ proofId, data }) =>
      paymentProofService.approvePaymentProof(proofId, data.notes),

    onSuccess: (response, { proofId }) => {
      // Show success toast
      toast.success(
        response.message || 'Payment proof approved and ticket created successfully'
      )

      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: PAYMENT_PROOF_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: PAYMENT_PROOF_QUERY_KEYS.detail(proofId),
      })
      queryClient.invalidateQueries({
        queryKey: PAYMENT_PROOF_QUERY_KEYS.stats(),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to approve payment proof')
    },
  })
}

/**
 * Hook untuk reject payment proof
 * Requires rejection reason untuk audit trail
 */
export function useRejectPaymentProof() {
  const queryClient = useQueryClient()

  return useMutation<
    RejectPaymentProofResponse,
    Error,
    { proofId: string; data: RejectPaymentProofFormData }
  >({
    mutationFn: ({ proofId, data }) =>
      paymentProofService.rejectPaymentProof(proofId, data.rejectedReason),

    onSuccess: (response, { proofId }) => {
      // Show success toast
      toast.success(response.message || 'Payment proof rejected successfully')

      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: PAYMENT_PROOF_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: PAYMENT_PROOF_QUERY_KEYS.detail(proofId),
      })
      queryClient.invalidateQueries({
        queryKey: PAYMENT_PROOF_QUERY_KEYS.stats(),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to reject payment proof')
    },
  })
}
