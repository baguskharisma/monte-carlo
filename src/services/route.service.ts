/**
 * Route Service
 * Service layer for route CRUD operations
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  GetRoutesResponse,
  GetRouteResponse,
  CreateRouteResponse,
  UpdateRouteResponse,
  DeleteRouteResponse,
  CreateRouteRequest,
  UpdateRouteRequest,
  GetRoutesParams,
} from '@/types/route.types'

class RouteService {
  /**
   * Fetch all routes with optional filters
   */
  async getRoutes(params?: GetRoutesParams): Promise<GetRoutesResponse> {
    try {
      const response: unknown = await apiClient.get('/routes', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          origin: params?.origin,
          destination: params?.destination,
          isActive: params?.isActive,
        },
      })
      return response as GetRoutesResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Fetch a single route by ID
   */
  async getRouteById(id: string): Promise<GetRouteResponse> {
    try {
      const response: unknown = await apiClient.get(`/routes/${id}`)
      return response as GetRouteResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create a new route
   */
  async createRoute(data: CreateRouteRequest): Promise<CreateRouteResponse> {
    try {
      const payload = {
        routeCode: data.routeCode.toUpperCase().trim(),
        origin: data.origin.trim(),
        destination: data.destination.trim(),
        distance: data.distance,
        estimatedDuration: data.estimatedDuration,
        basePrice: data.basePrice,
      }

      console.log('Sending route payload:', payload)
      const response: unknown = await apiClient.post('/routes', payload)
      return response as CreateRouteResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Full API error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      })

      // Extract detailed validation errors from API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)

      // If there are validation errors, include them
      if (error?.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        throw new Error(`${errorMessage} - ${validationErrors}`)
      }

      // If there's a details array, include it
      if (error?.response?.data?.details) {
        const details = Array.isArray(error.response.data.details)
          ? error.response.data.details.map((d: any) => d.message || d).join(', ')
          : error.response.data.details
        throw new Error(`${errorMessage} - ${details}`)
      }

      throw new Error(errorMessage)
    }
  }

  /**
   * Update an existing route
   */
  async updateRoute(
    id: string,
    data: UpdateRouteRequest
  ): Promise<UpdateRouteResponse> {
    try {
      const payload: UpdateRouteRequest = {}

      // Only include fields that are provided
      if (data.routeCode !== undefined && data.routeCode.trim() !== '') {
        payload.routeCode = data.routeCode.toUpperCase().trim()
      }
      if (data.origin !== undefined && data.origin.trim() !== '') {
        payload.origin = data.origin.trim()
      }
      if (data.destination !== undefined && data.destination.trim() !== '') {
        payload.destination = data.destination.trim()
      }
      if (data.distance !== undefined) {
        payload.distance = data.distance
      }
      if (data.estimatedDuration !== undefined) {
        payload.estimatedDuration = data.estimatedDuration
      }
      if (data.basePrice !== undefined) {
        payload.basePrice = data.basePrice
      }
      if (data.isActive !== undefined) {
        payload.isActive = data.isActive
      }

      // Don't send empty payload
      if (Object.keys(payload).length === 0) {
        throw new Error('At least one field must be provided for update')
      }

      console.log('Update route payload:', payload)
      const response: unknown = await apiClient.patch(`/routes/${id}`, payload)
      return response as UpdateRouteResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Update route error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      })

      // Extract detailed validation errors from API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)

      // If there are validation errors, include them
      if (error?.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        throw new Error(`${errorMessage} - ${validationErrors}`)
      }

      // If there's a details array, include it
      if (error?.response?.data?.details) {
        const details = Array.isArray(error.response.data.details)
          ? error.response.data.details.map((d: any) => d.message || d).join(', ')
          : error.response.data.details
        throw new Error(`${errorMessage} - ${details}`)
      }

      throw new Error(errorMessage)
    }
  }

  /**
   * Delete a route (soft delete via isActive flag)
   */
  async deleteRoute(id: string): Promise<DeleteRouteResponse> {
    try {
      const response: unknown = await apiClient.delete(`/routes/${id}`)
      return response as DeleteRouteResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const routeService = new RouteService()
