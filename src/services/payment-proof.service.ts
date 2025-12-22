/**
 * Payment Proof Service
 * Handles all payment proof-related API calls
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  PaymentProof,
  GetPaymentProofsResponse,
  GetPaymentProofResponse,
  ApprovePaymentProofResponse,
  RejectPaymentProofResponse,
} from '@/types/payment-proof.types'
import type { PaymentProofStatus } from '@/lib/constants'

/**
 * Payment Proof Service Class
 */
class PaymentProofService {
  /**
   * Get payment proofs list dengan optional filtering dan pagination
   * @param params - Query parameters (status, page, limit)
   * @returns Paginated list of payment proofs
   */
  async getPaymentProofs(params?: {
    status?: PaymentProofStatus
    page?: number
    limit?: number
  }): Promise<GetPaymentProofsResponse> {
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

      const url = `${API_ENDPOINTS.PAYMENT_PROOFS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response: unknown = await apiClient.get(url)
      return response as GetPaymentProofsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get a single payment proof by ID
   * @param id - Payment proof ID
   * @returns Payment proof details dengan populated data
   */
  async getPaymentProofById(id: string): Promise<PaymentProof> {
    try {
      const response: unknown = await apiClient.get(
        `${API_ENDPOINTS.PAYMENT_PROOFS}/${id}`
      )
      // API returns { data: PaymentProof }
      const data = response as GetPaymentProofResponse
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Approve payment proof
   * Automatically creates CONFIRMED ticket dan deducts coins
   * @param proofId - Payment proof ID to approve
   * @param notes - Optional approval notes
   * @returns Updated payment proof dengan auto-created ticket
   */
  async approvePaymentProof(
    proofId: string,
    notes?: string
  ): Promise<ApprovePaymentProofResponse> {
    try {
      const response: unknown = await apiClient.patch(
        `${API_ENDPOINTS.PAYMENT_PROOFS}/${proofId}/approve`,
        notes ? { notes } : undefined
      )
      return response as ApprovePaymentProofResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Reject payment proof
   * Requires rejection reason for audit trail
   * @param proofId - Payment proof ID to reject
   * @param rejectedReason - Reason for rejection (10-500 characters)
   * @returns Updated payment proof dengan rejection details
   */
  async rejectPaymentProof(
    proofId: string,
    rejectedReason: string
  ): Promise<RejectPaymentProofResponse> {
    try {
      // Backend expects 'rejectionReason' (without 'd') based on Prisma schema
      // API documentation shows 'rejectedReason' but actual backend uses 'rejectionReason'
      const response: unknown = await apiClient.patch(
        `${API_ENDPOINTS.PAYMENT_PROOFS}/${proofId}/reject`,
        { rejectionReason: rejectedReason }
      )
      return response as RejectPaymentProofResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const paymentProofService = new PaymentProofService()
export default paymentProofService
