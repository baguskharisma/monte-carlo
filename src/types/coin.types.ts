/**
 * Coin System Type Definitions
 * Includes coin requests, transactions, and related types
 */

import { z } from 'zod'
import type { CoinRequestStatus, CoinTransactionType } from '@/lib/constants'
import type { Admin } from './user.types'

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ============================================================================
// Coin Request Types
// ============================================================================

/**
 * Coin Request Interface
 * Represents a request from an ADMIN to top up their coin balance
 */
export interface CoinRequest {
  id: string
  adminId: string
  admin?: Admin // Populated admin details
  amount: number
  proofImageUrl: string
  status: CoinRequestStatus
  requestDate: string // ISO date string
  processedDate: string | null
  processedBy: string | null // SUPER_ADMIN user ID who processed
  processedByAdmin?: Admin // Populated super admin details
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

/**
 * API Response for getting coin requests list
 */
export interface GetCoinRequestsResponse {
  data: CoinRequest[]
  pagination: PaginationInfo
}

/**
 * Request payload for approving a coin request
 */
export interface ApproveCoinRequestRequest {
  requestId: string
}

/**
 * Request payload for rejecting a coin request
 */
export interface RejectCoinRequestRequest {
  requestId: string
  rejectionReason: string
}

/**
 * API Response for approve/reject actions
 */
export interface CoinRequestActionResponse {
  message: string
  data: CoinRequest
}

// ============================================================================
// Coin Transaction Types
// ============================================================================

/**
 * Coin Transaction Interface
 * Represents a coin balance transaction (top-up, deduction, refund)
 */
export interface CoinTransaction {
  id: string
  adminId: string
  admin?: Admin // Populated admin details
  type: CoinTransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  referenceId: string | null // Links to CoinRequest ID if applicable
  createdAt: string
  updatedAt: string
}

/**
 * API Response for getting coin transactions list
 */
export interface GetCoinTransactionsResponse {
  data: CoinTransaction[]
  pagination: PaginationInfo
}

// ============================================================================
// Form Validation Schemas
// ============================================================================

/**
 * Zod schema for rejection reason
 * Must be between 10-500 characters
 */
export const rejectCoinRequestSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must not exceed 500 characters')
    .trim(),
})

/**
 * TypeScript type inferred from Zod schema
 */
export type RejectCoinRequestFormData = z.infer<typeof rejectCoinRequestSchema>

// ============================================================================
// React Query Key Factory
// ============================================================================

/**
 * Query key factory for coin-related queries
 * Provides type-safe and hierarchical query keys for React Query
 */
export const COIN_QUERY_KEYS = {
  all: ['coin-requests'] as const,
  lists: () => [...COIN_QUERY_KEYS.all, 'list'] as const,
  list: (status?: CoinRequestStatus) =>
    [...COIN_QUERY_KEYS.lists(), { status }] as const,
  details: () => [...COIN_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COIN_QUERY_KEYS.details(), id] as const,
  stats: () => [...COIN_QUERY_KEYS.all, 'stats'] as const,
  balance: {
    current: () => ['coin-balance', 'current'] as const,
    admin: (adminId: string) => ['coin-balance', 'admin', adminId] as const,
  },
  transactions: {
    all: ['coin-transactions'] as const,
    lists: () => [...COIN_QUERY_KEYS.transactions.all, 'list'] as const,
    list: (adminId?: string) =>
      [...COIN_QUERY_KEYS.transactions.lists(), { adminId }] as const,
  },
} as const

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Coin Request Statistics
 * Used for dashboard metrics
 */
export interface CoinRequestStats {
  pending: number
  approved: number
  rejected: number
  total: number
}
