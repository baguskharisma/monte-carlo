/**
 * Route Management Types
 * Type definitions and schemas for route CRUD operations
 */

import { z } from 'zod'

// ============================================================================
// Main Route Interface
// ============================================================================

export interface Route {
  id: string
  routeCode: string
  origin: string
  destination: string
  distance: number // in kilometers
  estimatedDuration: number // in minutes
  basePrice: number // in IDR
  isActive: boolean
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

export interface GetRoutesResponse {
  success: boolean
  data: Route[]
  pagination: PaginationInfo
}

export interface GetRouteResponse {
  success: boolean
  data: Route
}

export interface CreateRouteResponse {
  success: boolean
  data: Route
  message: string
}

export interface UpdateRouteResponse {
  success: boolean
  data: Route
  message: string
}

export interface DeleteRouteResponse {
  success: boolean
  message: string
}

// ============================================================================
// Request Payload Types
// ============================================================================

export interface CreateRouteRequest {
  routeCode: string
  origin: string
  destination: string
  distance: number
  estimatedDuration: number
  basePrice: number
}

export interface UpdateRouteRequest {
  routeCode?: string
  origin?: string
  destination?: string
  distance?: number
  estimatedDuration?: number
  basePrice?: number
  isActive?: boolean
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Schema for creating a new route
 */
export const createRouteSchema = z.object({
  routeCode: z
    .string()
    .min(1, 'Route code is required')
    .regex(
      /^[A-Z0-9]+-[A-Z0-9]+-\d+$/,
      'Route code must follow pattern: XXX-YYY-NNN (e.g., JKT-BDG-001)'
    )
    .transform((val) => val.toUpperCase()),

  origin: z
    .string()
    .min(2, 'Origin must be at least 2 characters')
    .max(100, 'Origin must not exceed 100 characters')
    .trim(),

  destination: z
    .string()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must not exceed 100 characters')
    .trim(),

  distance: z
    .number({
      message: 'Distance must be a number',
    })
    .min(1, 'Distance must be at least 1 km')
    .max(10000, 'Distance must not exceed 10,000 km'),

  estimatedDuration: z
    .number({
      message: 'Duration must be a number',
    })
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration must not exceed 1440 minutes (24 hours)'),

  basePrice: z
    .number({
      message: 'Base price must be a number',
    })
    .min(1000, 'Base price must be at least Rp 1,000')
    .max(10000000, 'Base price must not exceed Rp 10,000,000'),
})

/**
 * Schema for editing an existing route
 */
export const editRouteSchema = z.object({
  routeCode: z
    .string()
    .min(1, 'Route code is required')
    .regex(
      /^[A-Z0-9]+-[A-Z0-9]+-\d+$/,
      'Route code must follow pattern: XXX-YYY-NNN (e.g., JKT-BDG-001)'
    )
    .transform((val) => val.toUpperCase()),

  origin: z
    .string()
    .min(2, 'Origin must be at least 2 characters')
    .max(100, 'Origin must not exceed 100 characters')
    .trim(),

  destination: z
    .string()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must not exceed 100 characters')
    .trim(),

  distance: z
    .number({
      message: 'Distance must be a number',
    })
    .min(1, 'Distance must be at least 1 km')
    .max(10000, 'Distance must not exceed 10,000 km'),

  estimatedDuration: z
    .number({
      message: 'Duration must be a number',
    })
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration must not exceed 1440 minutes (24 hours)'),

  basePrice: z
    .number({
      message: 'Base price must be a number',
    })
    .min(1000, 'Base price must be at least Rp 1,000')
    .max(10000000, 'Base price must not exceed Rp 10,000,000'),

  isActive: z.boolean({
  }),
})

// ============================================================================
// Form Data Types (inferred from schemas)
// ============================================================================

export type CreateRouteFormData = z.infer<typeof createRouteSchema>
export type EditRouteFormData = z.infer<typeof editRouteSchema>

// ============================================================================
// Query Key Factory
// ============================================================================

export const ROUTE_QUERY_KEYS = {
  all: ['routes'] as const,
  lists: () => [...ROUTE_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: {
    search?: string
    origin?: string
    destination?: string
    isActive?: boolean
  }) => [...ROUTE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ROUTE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ROUTE_QUERY_KEYS.details(), id] as const,
}

// ============================================================================
// Query Options Types
// ============================================================================

export interface GetRoutesParams {
  page?: number
  limit?: number
  search?: string
  origin?: string
  destination?: string
  isActive?: boolean
}
