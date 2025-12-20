/**
 * Customer Management Types
 * Type definitions and schemas for customer management operations
 * Note: Customers register via mobile app - no create functionality in admin panel
 */

import { z } from 'zod'
import type { Customer, UserStatus } from './user.types'

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

export interface GetCustomersResponse {
  success: boolean
  data: Customer[]
  pagination: PaginationInfo
}

export interface GetCustomerResponse {
  success: boolean
  data: Customer
}

export interface UpdateCustomerResponse {
  success: boolean
  data: Customer
  message: string
}

export interface DeleteCustomerResponse {
  success: boolean
  message: string
}

// ============================================================================
// Request Payload Types
// ============================================================================

// Note: No CreateCustomerRequest - customers register via mobile app

export interface UpdateCustomerRequest {
  email?: string
  name?: string
  phone?: string
  address?: string
  birthDate?: string
  gender?: 'MALE' | 'FEMALE'
  status?: UserStatus
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Schema for editing an existing customer
 * Note: No create schema - customers register via mobile app
 */
export const editCustomerSchema = z.object({
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

  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
})

// ============================================================================
// Form Data Types (inferred from schemas)
// ============================================================================

export type EditCustomerFormData = z.infer<typeof editCustomerSchema>

// ============================================================================
// Query Key Factory
// ============================================================================

export const CUSTOMER_QUERY_KEYS = {
  all: ['customers'] as const,
  lists: () => [...CUSTOMER_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: { search?: string; status?: UserStatus }) =>
    [...CUSTOMER_QUERY_KEYS.lists(), filters] as const,
  details: () => [...CUSTOMER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CUSTOMER_QUERY_KEYS.details(), id] as const,
}

// ============================================================================
// Query Options Types
// ============================================================================

export interface GetCustomersParams {
  page?: number
  limit?: number
  search?: string
  status?: UserStatus
}
