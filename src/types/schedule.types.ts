import { z } from 'zod'

// ==================== ENUMS & TYPES ====================

export type ScheduleStatus = 'SCHEDULED' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED'

// ==================== INTERFACES ====================

export interface Schedule {
  id: string
  routeId: string
  vehicleId: string
  driverId: string | null
  departureTime: string // ISO 8601
  arrivalTime: string | null
  price: number
  availableSeats: number
  fuelCost: number | null
  driverWage: number | null
  snackCost: number | null
  status: ScheduleStatus
  cancelledAt: string | null
  cancelledBy: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string

  // Nested relations (when included)
  route?: Route
  vehicle?: Vehicle
  driver?: Driver
  tickets?: Ticket[]
  _count?: {
    tickets: number
  }
}

export interface Route {
  id: string
  routeCode: string
  origin: string
  destination: string
  distance: number | null
  estimatedDuration: number | null
  basePrice: number
  isActive: boolean
}

export interface Vehicle {
  id: string
  vehicleNumber: string
  type: 'EKSEKUTIF' | 'REGULAR'
  brand: string | null
  model: string | null
  capacity: number
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED'
  imageUrl: string | null
}

export interface Driver {
  id: string
  userId: string
  name: string
  phone: string
  licenseNumber: string | null
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY'
  profileImageUrl: string | null
}

export interface Ticket {
  id: string
  ticketNumber: string
  scheduleId: string
  customerId: string | null
  totalPassengers: number
  totalPrice: number
  status: string
}

// ==================== API RESPONSES ====================

export interface SchedulesResponse {
  data: Schedule[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ScheduleResponse {
  data: Schedule
}

export interface UpcomingSchedulesResponse {
  data: Schedule[]
  total: number
}

export interface BookedSeatsResponse {
  bookedSeats: number[]
  bookedSeatsWithStatus: Array<{
    seatNumber: number
    status: 'PENDING' | 'APPROVED'
  }>
}

// ==================== REQUEST PAYLOADS ====================

export interface GetSchedulesParams {
  page?: number
  limit?: number
  routeId?: string
  vehicleId?: string
  driverId?: string
  status?: ScheduleStatus
  origin?: string
  destination?: string
  dateFrom?: string // ISO 8601
  dateTo?: string // ISO 8601
  sortBy?: 'nearest' | 'farthest' | 'cheapest' | 'expensive'
}

export interface CreateScheduleRequest {
  routeId: string
  vehicleId: string
  driverId?: string
  departureTime: string // ISO 8601
  arrivalTime?: string // ISO 8601
  price: number
  availableSeats?: number // Optional - defaults to vehicle capacity
  fuelCost?: number
  driverWage?: number
  snackCost?: number
}

export interface UpdateScheduleRequest {
  routeId?: string
  vehicleId?: string
  driverId?: string
  departureTime?: string
  arrivalTime?: string
  price?: number
  availableSeats?: number
  fuelCost?: number
  driverWage?: number
  snackCost?: number
}

export interface AssignDriverRequest {
  driverId: string
}

// ==================== ZOD SCHEMAS ====================

export const createScheduleSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().optional(),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().optional(),
  price: z.number().min(1, 'Price must be at least 1'),
  availableSeats: z.number().optional(),
  fuelCost: z.number().min(0).optional(),
  driverWage: z.number().min(0).optional(),
  snackCost: z.number().min(0).optional(),
})

export const updateScheduleSchema = createScheduleSchema.partial()

export const assignDriverSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
})

// ==================== FORM DATA TYPES ====================

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>
export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>
export type AssignDriverFormData = z.infer<typeof assignDriverSchema>

// ==================== QUERY KEYS ====================

export const SCHEDULE_QUERY_KEYS = {
  all: ['schedules'] as const,
  lists: () => [...SCHEDULE_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: GetSchedulesParams) => [...SCHEDULE_QUERY_KEYS.lists(), filters] as const,
  upcoming: (limit?: number) => [...SCHEDULE_QUERY_KEYS.all, 'upcoming', limit] as const,
  details: () => [...SCHEDULE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SCHEDULE_QUERY_KEYS.details(), id] as const,
}
