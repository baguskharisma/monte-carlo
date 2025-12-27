import { z } from 'zod'
import type { Schedule, ScheduleStatus } from './schedule.types'

// ==================== ENUMS & TYPES ====================

/**
 * Trip view filter types for tab navigation
 */
export type TripViewType = 'upcoming' | 'in_progress' | 'completed'

/**
 * Passenger check-in status
 */
export type PassengerCheckInStatus = 'not_checked_in' | 'checked_in'

// ==================== INTERFACES ====================

/**
 * Extended schedule for driver view
 * Includes trip logs and passenger check-in data
 */
export interface DriverTrip extends Schedule {
  tripLogs?: TripLog[]
  passengerCheckIns?: PassengerCheckIn[]
  currentLocation?: string // Derived from latest trip log
  lastUpdateTime?: string // Derived from latest trip log
}

/**
 * Trip log entry (status updates with location/notes)
 */
export interface TripLog {
  id: string
  scheduleId: string
  driverId: string
  status: ScheduleStatus
  location: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  timestamp: string
}

/**
 * Passenger check-in tracking
 */
export interface PassengerCheckIn {
  id: string
  scheduleId: string
  passengerId: string
  passengerName: string
  seatNumber: string | null
  checkedInAt: string | null
  checkedInBy: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Passenger manifest item (from API response)
 * Based on /driver/trips/{scheduleId}/passengers endpoint
 */
export interface PassengerManifestItem {
  passengerId: string
  ticketNumber: string
  passengerName: string
  customerName: string
  identityNumber: string | null
  phone: string | null
  seatNumber: string | null
  pickupAddress?: string // May not be available from API
  dropoffAddress?: string // May not be available from API
  isCheckedIn?: boolean // Will be added when check-in feature is implemented
  checkedInAt?: string | null
}

// ==================== API RESPONSES ====================

export interface DriverTripsResponse {
  data: DriverTrip[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface DriverTripResponse {
  data: DriverTrip
}

export interface PassengerManifestResponse {
  data: {
    schedule: Schedule
    passengers: PassengerManifestItem[]
    tripLogs: TripLog[]
  }
}

// ==================== REQUEST PAYLOADS ====================

export interface GetDriverTripsParams {
  driverId: string
  page?: number
  limit?: number
  status?: ScheduleStatus // SCHEDULED, DEPARTED, ARRIVED
  dateFrom?: string
  dateTo?: string
}

export interface UpdateTripStatusRequest {
  status: ScheduleStatus // DEPARTED or ARRIVED
  location?: string // Text description of location
  notes?: string
}

export interface CheckInPassengerRequest {
  passengerId: string
}

export interface BulkCheckInRequest {
  passengerIds: string[]
}

// ==================== TRIP HISTORY ====================

/**
 * Filter parameters for trip history page
 */
export interface TripHistoryFilters {
  dateFrom: string | null
  dateTo: string | null
  search: string | null
  page: number
  limit: number
}

/**
 * Date range preset options
 */
export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'last_3_months' | 'custom'

/**
 * Date range value
 */
export interface DateRange {
  from: Date | null
  to: Date | null
}

// ==================== ZOD SCHEMAS ====================

export const updateTripStatusSchema = z.object({
  status: z.enum(['DEPARTED', 'ARRIVED'], {
    message: 'Status is required',
  }),
  location: z.string().min(3, 'Location must be at least 3 characters').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional().or(z.literal('')),
})

export const checkInPassengerSchema = z.object({
  passengerId: z.string().min(1, 'Passenger ID is required'),
})

// ==================== FORM DATA TYPES ====================

export type UpdateTripStatusFormData = z.infer<typeof updateTripStatusSchema>
export type CheckInPassengerFormData = z.infer<typeof checkInPassengerSchema>

// ==================== QUERY KEYS ====================

export const DRIVER_TRIP_QUERY_KEYS = {
  all: ['driver-trips'] as const,
  lists: () => [...DRIVER_TRIP_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: GetDriverTripsParams) => [...DRIVER_TRIP_QUERY_KEYS.lists(), filters] as const,
  details: () => [...DRIVER_TRIP_QUERY_KEYS.all, 'detail'] as const,
  detail: (scheduleId: string) => [...DRIVER_TRIP_QUERY_KEYS.details(), scheduleId] as const,
  manifest: (scheduleId: string) => [...DRIVER_TRIP_QUERY_KEYS.detail(scheduleId), 'manifest'] as const,
  history: (filters?: TripHistoryFilters) => [...DRIVER_TRIP_QUERY_KEYS.all, 'history', filters] as const,
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Determine trip view type based on schedule status
 */
export function getTripViewType(status: ScheduleStatus): TripViewType {
  switch (status) {
    case 'SCHEDULED':
      return 'upcoming'
    case 'DEPARTED':
      return 'in_progress'
    case 'ARRIVED':
    case 'CANCELLED':
      return 'completed'
    default:
      return 'upcoming'
  }
}

/**
 * Check if status update is allowed
 */
export function canUpdateTripStatus(currentStatus: ScheduleStatus, newStatus: ScheduleStatus): boolean {
  // SCHEDULED -> DEPARTED
  if (currentStatus === 'SCHEDULED' && newStatus === 'DEPARTED') return true
  // DEPARTED -> ARRIVED
  if (currentStatus === 'DEPARTED' && newStatus === 'ARRIVED') return true
  return false
}

/**
 * Get next available status for a trip
 */
export function getNextTripStatus(currentStatus: ScheduleStatus): ScheduleStatus | null {
  if (currentStatus === 'SCHEDULED') return 'DEPARTED'
  if (currentStatus === 'DEPARTED') return 'ARRIVED'
  return null
}

/**
 * Get status label for display
 */
export function getTripStatusLabel(status: ScheduleStatus): string {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled'
    case 'DEPARTED':
      return 'In Progress'
    case 'ARRIVED':
      return 'Arrived'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}
