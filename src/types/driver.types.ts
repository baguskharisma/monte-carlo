/**
 * Driver Management Types
 * Type definitions and schemas for driver CRUD operations
 */

import { z } from 'zod'
import type { Driver, UserStatus, DriverStatus } from './user.types'

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

export interface GetDriversResponse {
  success: boolean
  data: Driver[]
  pagination: PaginationInfo
}

export interface GetDriverResponse {
  success: boolean
  data: Driver
}

export interface CreateDriverResponse {
  success: boolean
  data: Driver
  message: string
}

export interface UpdateDriverResponse {
  success: boolean
  data: Driver
  message: string
}

export interface DeleteDriverResponse {
  success: boolean
  message: string
}

// ============================================================================
// Request Payload Types
// ============================================================================

export interface CreateDriverRequest {
  email?: string
  password: string
  name: string
  phone: string
  licenseNumber: string
  // Note: licenseExpiryDate is NOT supported by the API
  address?: string
  birthDate?: string
  gender?: 'MALE' | 'FEMALE'
}

export interface UpdateDriverRequest {
  email?: string
  name?: string
  phone?: string
  licenseNumber?: string
  // Note: licenseExpiryDate is NOT supported by the API
  address?: string
  birthDate?: string
  gender?: 'MALE' | 'FEMALE'
  status?: UserStatus
  driverStatus?: DriverStatus
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Schema for creating a new driver
 */
export const createDriverSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  confirmPassword: z.string().min(1, 'Please confirm your password'),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Phone must start with +62, 62, or 0, followed by 9-12 digits'),

  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .max(50, 'License number must not exceed 50 characters'),

  // Note: licenseExpiryDate is NOT supported by the API backend

  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in format YYYY-MM-DD')
    .optional()
    .or(z.literal('')),

  gender: z.enum(['MALE', 'FEMALE']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

/**
 * Schema for editing an existing driver
 */
export const editDriverSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        const normalized = val.replace(/[\s\-()]/g, '')
        return /^(\+62|62|0)[0-9]{9,12}$/.test(normalized)
      },
      {
        message: 'Phone must start with +62, 62, or 0, followed by 9-12 digits',
      }
    ),

  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .max(50, 'License number must not exceed 50 characters'),

  // Note: licenseExpiryDate is NOT supported by the API backend

  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in format YYYY-MM-DD')
    .optional()
    .or(z.literal('')),

  gender: z.enum(['MALE', 'FEMALE']).optional(),

  // Status fields are read-only in the form (API doesn't support updating them properly)
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),

  driverStatus: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY']).optional(),
})

// ============================================================================
// Form Data Types (inferred from schemas)
// ============================================================================

export type CreateDriverFormData = z.infer<typeof createDriverSchema>
export type EditDriverFormData = z.infer<typeof editDriverSchema>

// ============================================================================
// Query Key Factory
// ============================================================================

export const DRIVER_QUERY_KEYS = {
  all: ['drivers'] as const,
  lists: () => [...DRIVER_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: { search?: string; status?: UserStatus; driverStatus?: DriverStatus }) =>
    [...DRIVER_QUERY_KEYS.lists(), filters] as const,
  details: () => [...DRIVER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DRIVER_QUERY_KEYS.details(), id] as const,
}

// ============================================================================
// Query Options Types
// ============================================================================

export interface GetDriversParams {
  page?: number
  limit?: number
  search?: string
  status?: UserStatus
  driverStatus?: DriverStatus
}
