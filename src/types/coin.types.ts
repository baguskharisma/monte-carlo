/**
 * Coin System Type Definitions
 * Includes coin requests, transactions, and related types
 */

import { z } from 'zod'
import type { CoinRequestStatus, CoinTransactionType } from '@/lib/constants'

// Admin interface for Coin Request responses
// Note: API returns a flattened admin structure in coin request responses
interface CoinRequestAdmin {
  id: string
  userId: string
  name: string
  phone: string
  email: string | null
  profileImageUrl: string | null
  coinBalance: number
  createdAt: string
  updatedAt: string
}

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
  admin?: CoinRequestAdmin // Populated admin details (flattened structure)
  amount: number
  proofImageUrl: string
  status: CoinRequestStatus
  requestDate: string // ISO date string
  processedDate: string | null
  processedBy: string | null // SUPER_ADMIN user ID who processed
  processedByAdmin?: CoinRequestAdmin // Populated super admin details (flattened structure)
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
  admin?: CoinRequestAdmin // Populated admin details (flattened structure)
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
  // ADMIN's own transactions
  myTransactions: {
    all: ['my-coin-transactions'] as const,
    lists: () => [...COIN_QUERY_KEYS.myTransactions.all, 'list'] as const,
    list: (filters?: TransactionFilters) =>
      [...COIN_QUERY_KEYS.myTransactions.lists(), filters] as const,
  },
  // ADMIN's own coin requests
  myRequests: {
    all: ['my-coin-requests'] as const,
    lists: () => [...COIN_QUERY_KEYS.myRequests.all, 'list'] as const,
    list: (status?: CoinRequestStatus) =>
      [...COIN_QUERY_KEYS.myRequests.lists(), { status }] as const,
  },
} as const

// ============================================================================
// ADMIN Coin Request Types (for creating requests)
// ============================================================================

/**
 * Request payload for ADMIN to create a coin top-up request
 */
export interface CreateCoinRequestRequest {
  amount: number
  notes?: string // Optional notes for the request
}

/**
 * API Response for creating coin request
 */
export interface CreateCoinRequestResponse {
  success: boolean
  data: CoinRequest
  message: string
}

/**
 * Form data for coin top-up request
 */
export const createCoinRequestSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a number' })
    .min(10000, 'Minimum top-up amount is 10,000 coins')
    .max(10000000, 'Maximum top-up amount is 10,000,000 coins'),
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
})

export type CreateCoinRequestFormData = z.infer<typeof createCoinRequestSchema>

// ============================================================================
// Transaction Filtering Types
// ============================================================================

/**
 * Filter parameters for transaction history
 */
export interface TransactionFilters {
  type?: CoinTransactionType // Filter by transaction type
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  page?: number
  limit?: number
}

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
