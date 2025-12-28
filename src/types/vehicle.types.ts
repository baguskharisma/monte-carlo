/**
 * Vehicle Management Types
 * Type definitions and schemas for vehicle CRUD operations
 */

import { z } from 'zod'

// ============================================================================
// Enums
// ============================================================================

export type VehicleType = 'EKSEKUTIF' | 'REGULAR'
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED'

// ============================================================================
// Main Vehicle Interface
// ============================================================================

export interface Vehicle {
  id: string
  vehicleNumber: string // License plate (e.g., "B 1234 ABC")
  type: VehicleType
  brand: string
  model: string
  capacity: number // Number of seats
  status: VehicleStatus
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
// API Response Types
// ============================================================================

export interface GetVehiclesResponse {
  success: boolean
  data: Vehicle[]
  pagination: PaginationInfo
}

export interface GetVehicleResponse {
  success: boolean
  data: Vehicle
}

export interface CreateVehicleResponse {
  success: boolean
  data: Vehicle
  message: string
}

export interface UpdateVehicleResponse {
  success: boolean
  data: Vehicle
  message: string
}

export interface DeleteVehicleResponse {
  success: boolean
  message: string
}

// ============================================================================
// Request Payload Types
// ============================================================================

export interface CreateVehicleRequest {
  vehicleNumber: string
  type: VehicleType
  brand: string
  model: string
  capacity: number
}

export interface UpdateVehicleRequest {
  vehicleNumber?: string
  type?: VehicleType
  brand?: string
  model?: string
  capacity?: number
  status?: VehicleStatus
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Schema for creating a new vehicle
 */
export const createVehicleSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .regex(
      /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/,
      'Invalid plate format. Use format: B 1234 ABC'
    )
    .transform((val) => {
      // Normalize to format: "B 1234 ABC" (single spaces)
      return val.toUpperCase().replace(/\s+/g, ' ').trim()
    }),

  type: z.enum(['EKSEKUTIF', 'REGULAR'], {
    message: 'Vehicle type must be either EKSEKUTIF or REGULAR',
  }),

  brand: z
    .string()
    .min(2, 'Brand must be at least 2 characters')
    .max(50, 'Brand must not exceed 50 characters')
    .trim(),

  model: z
    .string()
    .min(2, 'Model must be at least 2 characters')
    .max(50, 'Model must not exceed 50 characters')
    .trim(),

  capacity: z
    .number({
      message: 'Capacity must be a number',
    })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1 seat')
    .max(100, 'Capacity must not exceed 100 seats'),
})

/**
 * Schema for editing an existing vehicle
 * All fields are required in the form, but service will handle optional updates
 */
export const editVehicleSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .regex(
      /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/,
      'Invalid plate format. Use format: B 1234 ABC'
    )
    .transform((val) => {
      // Normalize to format: "B 1234 ABC" (single spaces)
      return val.toUpperCase().replace(/\s+/g, ' ').trim()
    }),

  type: z.enum(['EKSEKUTIF', 'REGULAR'], {
    message: 'Vehicle type is required',
  }),

  brand: z
    .string()
    .min(2, 'Brand must be at least 2 characters')
    .max(50, 'Brand must not exceed 50 characters')
    .trim(),

  model: z
    .string()
    .min(2, 'Model must be at least 2 characters')
    .max(50, 'Model must not exceed 50 characters')
    .trim(),

  capacity: z
    .number({
      message: 'Capacity must be a number',
    })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1 seat')
    .max(100, 'Capacity must not exceed 100 seats'),

  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'], {
    message: 'Status is required',
  }),
})

/**
 * Schema for updating vehicle status only
 */
export const updateVehicleStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'], {
    message: 'Status is required',
  }),
})

// ============================================================================
// Form Data Types (inferred from schemas)
// ============================================================================

export type CreateVehicleFormData = z.infer<typeof createVehicleSchema>
export type EditVehicleFormData = z.infer<typeof editVehicleSchema>

// ============================================================================
// Query Key Factory
// ============================================================================

export const VEHICLE_QUERY_KEYS = {
  all: ['vehicles'] as const,
  lists: () => [...VEHICLE_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: {
    search?: string
    type?: VehicleType
    status?: VehicleStatus
  }) => [...VEHICLE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...VEHICLE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VEHICLE_QUERY_KEYS.details(), id] as const,
}

// ============================================================================
// Query Options Types
// ============================================================================

export interface GetVehiclesParams {
  page?: number
  limit?: number
  search?: string
  type?: VehicleType
  status?: VehicleStatus
}
