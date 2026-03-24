/**
 * Travel Document (Surat Jalan) System Type Definitions
 * Following Prisma schema and existing type patterns
 */

import { z } from 'zod'
import type { Schedule } from '@/types/schedule.types'
import type { CoinTransaction } from '@/types/coin.types'
import type { TicketPassenger } from '@/types/ticket.types'

// ==================== TYPE DEFINITIONS ====================

/**
 * Travel Document Status
 */
export type TravelDocumentStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED'

/**
 * Admin interface (simplified for travel document responses)
 */
export interface Admin {
  id: string
  userId: string
  name: string
  phone: string
  profileImageUrl: string | null
}

/**
 * Driver interface (simplified for travel document responses)
 */
export interface Driver {
  id: string
  userId: string
  name: string
  phone: string
  profileImageUrl: string | null
  licenseNumber: string | null
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY'
}

// ==================== MAIN INTERFACE ====================

/**
 * Main Travel Document interface
 */
export interface TravelDocument {
  id: string
  documentNumber: string
  scheduleId: string
  vehicleId: string
  driverName: string
  driverPhone: string
  totalPassengers: number
  departureDate: string
  status: TravelDocumentStatus
  notes: string | null

  // Issue tracking
  issuedAt: string | null
  issuedById: string | null

  // Cancellation tracking
  cancelledAt: string | null
  cancelledById: string | null
  cancelReason: string | null

  // Timestamps
  createdAt: string
  updatedAt: string

  // NEW: Aggregated passenger list from tickets
  passengers?: TicketPassenger[]

  // NEW: Cost breakdown from schedule
  fuelCost?: number | null
  driverWage?: number | null
  snackCost?: number | null

  // Populated relations
  schedule?: Schedule
  issuedBy?: Admin
  cancelledBy?: Admin
  coinTransaction?: CoinTransaction
}

// ==================== API RESPONSE INTERFACES ====================

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TravelDocumentsResponse {
  data: TravelDocument[]
  meta: PaginationInfo
}

export interface TravelDocumentResponse {
  data: TravelDocument
}

// ==================== REQUEST PAYLOAD INTERFACES ====================

export interface GetTravelDocumentsParams {
  page?: number
  limit?: number
  status?: TravelDocumentStatus
  search?: string
}

export interface CreateTravelDocumentRequest {
  scheduleId: string
  vehicleId: string
  driverName: string
  driverPhone: string
  totalPassengers: number
  departureDate: string // ISO 8601 format
  notes?: string
}

export interface IssueTravelDocumentRequest {
  // Empty - server will handle coin deduction
}

export interface CancelTravelDocumentRequest {
  cancelReason: string
}

// ==================== STATISTICS ====================

export interface TravelDocumentStats {
  draft: number
  issued: number
  cancelled: number
  total: number
}

// ==================== ZOD VALIDATION SCHEMAS ====================

/**
 * Schema for creating a travel document (DRAFT)
 */
export const createTravelDocumentSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverName: z.string().min(1, 'Driver name is required'),
  driverPhone: z.string().min(1, 'Driver phone is required'),
  totalPassengers: z
    .number()
    .min(1, 'At least 1 passenger is required')
    .max(100, 'Maximum 100 passengers allowed'),
  departureDate: z.string().min(1, 'Departure date is required'),
  notes: z.string().optional(),
})

/**
 * Schema for cancelling a travel document
 */
export const cancelTravelDocumentSchema = z.object({
  cancelReason: z
    .string()
    .min(10, 'Cancellation reason must be at least 10 characters')
    .max(500, 'Cancellation reason must not exceed 500 characters'),
})

// ==================== FORM DATA TYPES ====================

export type CreateTravelDocumentFormData = z.infer<typeof createTravelDocumentSchema>
export type CancelTravelDocumentFormData = z.infer<typeof cancelTravelDocumentSchema>

// ==================== REACT QUERY KEYS ====================

/**
 * Query keys factory for React Query
 */
export const TRAVEL_DOCUMENT_QUERY_KEYS = {
  all: ['travel-documents'] as const,
  lists: () => [...TRAVEL_DOCUMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: GetTravelDocumentsParams) =>
    [...TRAVEL_DOCUMENT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...TRAVEL_DOCUMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TRAVEL_DOCUMENT_QUERY_KEYS.details(), id] as const,
  stats: () => [...TRAVEL_DOCUMENT_QUERY_KEYS.all, 'stats'] as const,
} as const
