/**
 * Admin Service
 * Service layer for admin CRUD operations
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  GetAdminsResponse,
  GetAdminResponse,
  CreateAdminResponse,
  UpdateAdminResponse,
  DeleteAdminResponse,
  CreateAdminRequest,
  UpdateAdminRequest,
} from '@/types/admin.types'
import { UserStatus } from '@/types/user.types'

interface GetAdminsParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

class AdminService {
  /**
   * Fetch all admins with optional filters
   */
  async getAdmins(params?: GetAdminsParams): Promise<GetAdminsResponse> {
    try {
      const response: unknown = await apiClient.get('/admins', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          isActive: params?.isActive,
        },
      })
      return response as GetAdminsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Fetch a single admin by ID
   */
  async getAdminById(id: string): Promise<GetAdminResponse> {
    try {
      const response: unknown = await apiClient.get(`/admins/${id}`)
      return response as GetAdminResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create a new admin
   */
  async createAdmin(data: CreateAdminRequest): Promise<CreateAdminResponse> {
    try {
      // Transform data to match backend API expectations
      // Only send required and optional fields (address not included)
      const payload = {
        name: data.name,
        phone: data.phone,
        password: data.password,
        email: data.email,
      }

      console.log('Sending payload:', payload)
      const response: unknown = await apiClient.post('/admins', payload)
      return response as CreateAdminResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Full API error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      })

      // Extract detailed validation errors from API response
      const errorMessage = error?.response?.data?.message ||
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
   * Update an existing admin
   * Note: Status must be updated separately via updateAdminStatus
   */
  async updateAdmin(
    id: string,
    data: UpdateAdminRequest
  ): Promise<UpdateAdminResponse> {
    try {
      // API only accepts: name, phone, email, birthDate, gender
      // Status and address are handled separately
      const payload: {
        name?: string
        phone?: string
        email?: string
      } = {}
      
      // Only include fields that are provided and not empty
      if (data.name !== undefined && data.name.trim() !== '') {
        payload.name = data.name.trim()
      }
      if (data.phone !== undefined && data.phone.trim() !== '') {
        // Normalize phone: remove spaces, dashes, parentheses for API
        const normalizedPhone = data.phone.trim().replace(/[\s\-()]/g, '')
        payload.phone = normalizedPhone
      }
      // Email is always included if provided (even if disabled in form)
      if (data.email !== undefined && data.email.trim() !== '') {
        payload.email = data.email.trim()
      }
      
      // Don't send empty payload
      if (Object.keys(payload).length === 0) {
        throw new Error('At least one field must be provided for update')
      }

      console.log('Update admin payload:', payload)
      console.log('Original data:', data)
      const response: unknown = await apiClient.patch(
        `/admins/${id}`,
        payload
      )
      return response as UpdateAdminResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Update admin error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      })

      // Extract detailed validation errors from API response
      const errorMessage = error?.response?.data?.message ||
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
   * Update admin status
   * Separate endpoint for updating admin account status
   */
  async updateAdminStatus(
    id: string,
    status: UserStatus
  ): Promise<UpdateAdminResponse> {
    try {
      const response: unknown = await apiClient.patch(
        `/admins/${id}/status`,
        { status }
      )
      return response as UpdateAdminResponse
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Delete an admin
   */
  async deleteAdmin(id: string): Promise<DeleteAdminResponse> {
    try {
      const response: unknown = await apiClient.delete(`/admins/${id}`)
      return response as DeleteAdminResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const adminService = new AdminService()
