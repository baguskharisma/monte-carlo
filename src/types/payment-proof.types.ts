/**
 * Payment Proof System Type Definitions
 * Sesuai dengan Prisma schema dan API documentation
 */

import { z } from 'zod'
import type { PaymentProofStatus, BookingSource } from '@/lib/constants'
import type { Customer } from './user.types'

// Temporary interface - will be replaced when schedule.types.ts and ticket.types.ts are created
interface Schedule {
  id: string
  [key: string]: any
}

interface Ticket {
  id: string
  [key: string]: any
}

// ============================================================================
// Payment Proof Passenger Types
// ============================================================================

/**
 * Payment Proof Passenger Interface
 * Represents passenger data dari payment proof (sebelum ticket dibuat)
 */
export interface PaymentProofPassenger {
  id: string
  paymentProofId: string
  name: string
  identityNumber: string | null
  phone: string | null
  seatNumber: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Payment Proof Types
// ============================================================================

/**
 * Payment Proof Interface
 * Represents bukti pembayaran yang diupload customer
 */
export interface PaymentProof {
  id: string
  proofNumber: string // Nomor unik bukti pembayaran
  scheduleId: string
  customerId: string
  bookingSource: BookingSource
  bookerPhone: string
  pickupAddress: string
  dropoffAddress: string
  totalPassengers: number
  totalPrice: number
  paymentProofUrl: string // URL file bukti pembayaran
  status: PaymentProofStatus
  notes: string | null // Catatan dari customer

  // Approval fields
  reviewedBy: string | null // Admin ID yang review
  reviewedAt: string | null
  rejectionReason: string | null

  // Ticket reference (jika approved)
  ticketId: string | null

  createdAt: string
  updatedAt: string

  // Populated relations
  customer?: Customer
  schedule?: Schedule
  ticket?: Ticket
  passengers?: PaymentProofPassenger[]
}

/**
 * API Response untuk getting payment proofs list
 */
export interface GetPaymentProofsResponse {
  data: PaymentProof[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * API Response untuk getting single payment proof
 */
export interface GetPaymentProofResponse {
  data: PaymentProof
}

/**
 * Request payload untuk approving payment proof
 */
export interface ApprovePaymentProofRequest {
  notes?: string
}

/**
 * API Response untuk approve payment proof
 * Returns updated payment proof dan auto-created ticket
 */
export interface ApprovePaymentProofResponse {
  paymentProof: PaymentProof
  ticket: Ticket
  message: string
}

/**
 * Request payload untuk rejecting payment proof
 * NOTE: API menggunakan 'rejectedReason' (dengan 'd')
 */
export interface RejectPaymentProofRequest {
  rejectedReason: string
}

/**
 * API Response untuk reject payment proof
 */
export interface RejectPaymentProofResponse {
  paymentProof: PaymentProof
  message: string
}

// ============================================================================
// Form Validation Schemas
// ============================================================================

/**
 * Zod schema untuk rejection reason
 * Must be between 10-500 characters
 */
export const rejectPaymentProofSchema = z.object({
  rejectedReason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must not exceed 500 characters')
    .trim(),
})

/**
 * TypeScript type inferred from Zod schema
 */
export type RejectPaymentProofFormData = z.infer<typeof rejectPaymentProofSchema>

/**
 * Zod schema untuk approve notes (optional)
 */
export const approvePaymentProofSchema = z.object({
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .trim()
    .optional(),
})

/**
 * TypeScript type inferred from Zod schema
 */
export type ApprovePaymentProofFormData = z.infer<typeof approvePaymentProofSchema>

// ============================================================================
// React Query Key Factory
// ============================================================================

/**
 * Query key factory untuk payment proof queries
 * Provides type-safe and hierarchical query keys for React Query
 */
export const PAYMENT_PROOF_QUERY_KEYS = {
  all: ['payment-proofs'] as const,
  lists: () => [...PAYMENT_PROOF_QUERY_KEYS.all, 'list'] as const,
  list: (status?: PaymentProofStatus) =>
    [...PAYMENT_PROOF_QUERY_KEYS.lists(), { status }] as const,
  details: () => [...PAYMENT_PROOF_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PAYMENT_PROOF_QUERY_KEYS.details(), id] as const,
  stats: () => [...PAYMENT_PROOF_QUERY_KEYS.all, 'stats'] as const,
} as const

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Payment Proof Statistics
 * Used for dashboard metrics
 */
export interface PaymentProofStats {
  pending: number
  approved: number
  rejected: number
  total: number
}
