/**
 * Admin Management Types
 * Type definitions and schemas for admin CRUD operations
 */

import { z } from 'zod'
import type { Admin, UserStatus } from './user.types'

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

export interface GetAdminsResponse {
  success: boolean
  data: Admin[]
  pagination: PaginationInfo
}

export interface GetAdminResponse {
  success: boolean
  data: Admin
}

export interface CreateAdminResponse {
  success: boolean
  data: Admin
  message: string
}

export interface UpdateAdminResponse {
  success: boolean
  data: Admin
  message: string
}

export interface DeleteAdminResponse {
  success: boolean
  message: string
}

// ============================================================================
// Request Payload Types
// ============================================================================

export interface CreateAdminRequest {
  email: string
  password: string
  name: string
  phone: string
}

export interface UpdateAdminRequest {
  email?: string
  name?: string
  phone?: string
  address?: string
  status?: UserStatus
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Schema for creating a new admin
 */
export const createAdminSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

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
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Phone must start with +62, 62, or 0, followed by 9-12 digits (e.g., 081234567890)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

/**
 * Schema for editing an existing admin
 */
export const editAdminSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        // Remove spaces, dashes, parentheses for validation
        const normalized = val.replace(/[\s\-()]/g, '')
        return /^(\+62|62|0)[0-9]{9,12}$/.test(normalized)
      },
      {
        message: 'Phone must start with +62, 62, or 0, followed by 9-12 digits (e.g., 081234567890)',
      }
    ),

  // address: z
  //   .string()
  //   .min(10, 'Address must be at least 10 characters')
  //   .max(500, 'Address must not exceed 500 characters'),

  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
})

// ============================================================================
// Form Data Types (inferred from schemas)
// ============================================================================

export type CreateAdminFormData = z.infer<typeof createAdminSchema>
export type EditAdminFormData = z.infer<typeof editAdminSchema>

// ============================================================================
// Query Key Factory
// ============================================================================

export const ADMIN_QUERY_KEYS = {
  all: ['admins'] as const,
  lists: () => [...ADMIN_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: { search?: string; isActive?: boolean }) =>
    [...ADMIN_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ADMIN_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ADMIN_QUERY_KEYS.details(), id] as const,
}
