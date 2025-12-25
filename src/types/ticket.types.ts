import { z } from 'zod'
import type { TicketStatus, BookingSource } from '@/lib/constants'
import type { Schedule } from '@/types/schedule.types'
import type { CoinTransaction } from '@/types/coin.types'

// ==================== RE-EXPORT TYPES ====================

export type { TicketStatus, BookingSource }

// ==================== INTERFACES ====================

/**
 * Customer interface (simplified for ticket responses)
 */
export interface Customer {
  id: string
  userId: string
  name: string
  phone: string
  profileImageUrl: string | null
}

/**
 * Ticket Passenger interface
 */
export interface TicketPassenger {
  id: string
  ticketId: string
  name: string
  identityNumber: string | null
  phone: string | null
  seatNumber: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Main Ticket interface
 */
export interface Ticket {
  id: string
  ticketNumber: string
  scheduleId: string
  customerId: string | null
  bookingSource: BookingSource
  bookerPhone: string
  pickupAddress: string
  dropoffAddress: string
  totalPassengers: number
  totalPrice: number
  status: TicketStatus

  // Cancellation fields
  cancelledAt: string | null
  cancelledBy: string | null
  cancelReason: string | null

  // Coin deduction reference (for ADMIN_PANEL bookings)
  coinTransactionId: string | null

  createdAt: string
  updatedAt: string

  // Populated relations
  schedule?: Schedule
  customer?: Customer
  passengers?: TicketPassenger[]
  coinTransaction?: CoinTransaction
}

// ==================== API RESPONSE INTERFACES ====================

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TicketsResponse {
  data: Ticket[]
  meta: PaginationInfo
}

export interface TicketResponse {
  data: Ticket
}

// ==================== REQUEST PAYLOAD INTERFACES ====================

export interface GetTicketsParams {
  page?: number
  limit?: number
  status?: TicketStatus
  customerId?: string
  scheduleId?: string
  search?: string // Search by ticketNumber or bookerPhone
  bookingSource?: BookingSource
}

export interface CreateTicketRequest {
  scheduleId: string
  customerId?: string
  bookingSource: BookingSource
  bookerPhone: string
  pickupAddress: string
  dropoffAddress: string
  passengers: Array<{
    name: string
    identityNumber?: string
    phone?: string
    seatNumber?: string
  }>
}

export interface CancelTicketRequest {
  cancelReason: string
}

// ==================== ZOD SCHEMAS ====================

/**
 * Passenger schema for form validation
 */
export const passengerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  identityNumber: z.string().optional(),
  phone: z.string().optional(),
  seatNumber: z.string().optional(),
})

/**
 * Create ticket schema
 */
export const createTicketSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule is required'),
  bookerPhone: z.string().min(1, 'Booker phone is required'),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  dropoffAddress: z.string().min(1, 'Dropoff address is required'),
  passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
})

/**
 * Cancel ticket schema
 */
export const cancelTicketSchema = z.object({
  cancelReason: z.string().min(10, 'Reason must be at least 10 characters'),
})

// ==================== FORM DATA TYPES ====================

export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type PassengerFormData = z.infer<typeof passengerSchema>
export type CancelTicketFormData = z.infer<typeof cancelTicketSchema>

// ==================== QUERY KEYS ====================

export const TICKET_QUERY_KEYS = {
  all: ['tickets'] as const,
  lists: () => [...TICKET_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: GetTicketsParams) => [...TICKET_QUERY_KEYS.lists(), filters] as const,
  details: () => [...TICKET_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TICKET_QUERY_KEYS.details(), id] as const,
  stats: () => [...TICKET_QUERY_KEYS.all, 'stats'] as const,
} as const
