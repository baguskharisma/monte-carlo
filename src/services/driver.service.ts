/**
 * Driver Service
 * Service layer for driver CRUD operations
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  GetDriversResponse,
  GetDriverResponse,
  CreateDriverResponse,
  UpdateDriverResponse,
  DeleteDriverResponse,
  CreateDriverRequest,
  UpdateDriverRequest,
  GetDriversParams,
} from '@/types/driver.types'
import type { UserStatus, DriverStatus } from '@/types/user.types'

class DriverService {
  /**
   * Fetch all drivers with optional filters
   */
  async getDrivers(params?: GetDriversParams): Promise<GetDriversResponse> {
    try {
      console.log('Fetching drivers with params:', params)
      const response: unknown = await apiClient.get('/drivers', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          status: params?.status,
          driverStatus: params?.driverStatus,
        },
      })
      console.log('Drivers API response:', response)
      return response as GetDriversResponse
    } catch (error: any) {
      console.error('Get drivers error:', {
        params,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      })
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Fetch a single driver by ID
   */
  async getDriverById(id: string): Promise<GetDriverResponse> {
    try {
      console.log('Fetching driver with ID:', id)
      const response: unknown = await apiClient.get(`/drivers/${id}`)
      console.log('Driver API response:', response)
      return response as GetDriverResponse
    } catch (error: any) {
      console.error('Get driver by ID error:', {
        driverId: id,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      })
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create a new driver
   */
  async createDriver(data: CreateDriverRequest): Promise<CreateDriverResponse> {
    try {
      const payload: any = {
        name: data.name.trim(),
        phone: data.phone.trim().replace(/[\s\-()]/g, ''),
        password: data.password,
        licenseNumber: data.licenseNumber.trim(),
        // Note: licenseExpiryDate is not supported by the API
      }

      // Add optional fields if provided
      if (data.email && data.email.trim() !== '') {
        payload.email = data.email.trim()
      }
      if (data.address && data.address.trim() !== '') {
        payload.address = data.address.trim()
      }
      if (data.birthDate && data.birthDate.trim() !== '') {
        // Keep in YYYY-MM-DD format
        payload.birthDate = data.birthDate.trim()
      }
      if (data.gender) {
        payload.gender = data.gender
      }

      console.log('Sending driver payload:', payload)
      const response: unknown = await apiClient.post('/drivers', payload)
      return response as CreateDriverResponse
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
   * Update an existing driver
   * Note: Status updates should use updateDriverStatus and updateDriverOperationalStatus methods separately
   */
  async updateDriver(
    id: string,
    data: UpdateDriverRequest
  ): Promise<UpdateDriverResponse> {
    try {
      // Build payload - exclude status and driverStatus fields (use dedicated endpoints)
      const payload: Record<string, any> = {}

      // IMPORTANT: Based on Prisma schema, Driver model has these fields:
      // name, phone, licenseNumber, address, birthDate, gender, status
      // NOTE: 'email' is NOT in Driver model - it's in User model!
      // We should NOT send email to driver endpoint

      if (data.name !== undefined && data.name.trim() !== '') {
        payload.name = data.name.trim()
      }
      if (data.phone !== undefined && data.phone.trim() !== '') {
        payload.phone = data.phone.trim().replace(/[\s\-()]/g, '')
      }
      // REMOVED: email field - not in Driver model, only in User model
      // The API documentation may list it, but Prisma schema shows it's not in Driver table
      if (data.licenseNumber !== undefined && data.licenseNumber.trim() !== '') {
        payload.licenseNumber = data.licenseNumber.trim()
      }

      // Optional fields - only send if they have values
      if (data.address !== undefined && data.address !== null && data.address.trim() !== '') {
        payload.address = data.address.trim()
      }
      if (data.birthDate !== undefined && data.birthDate !== null && data.birthDate.trim() !== '') {
        // Keep in YYYY-MM-DD format (backend will convert to DateTime)
        payload.birthDate = data.birthDate.trim()
      }
      if (data.gender !== undefined && data.gender !== null && data.gender !== '') {
        payload.gender = data.gender
      }
      // Note: status (DriverStatus) and user status (UserStatus) use dedicated endpoints

      // Don't send empty payload
      if (Object.keys(payload).length === 0) {
        console.warn('No fields to update - skipping API call')
        return { success: true, data: {} as any, message: 'No changes to update' }
      }

      console.log('Update driver ID:', id)
      console.log('Original data received:', data)
      console.log('Update driver payload (PATCH, no status fields):', payload)
      console.log('Payload keys:', Object.keys(payload))
      console.log('Payload values:', Object.values(payload))

      const response: unknown = await apiClient.patch(`/drivers/${id}`, payload)
      console.log('Update driver response:', response)

      return response as UpdateDriverResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Update driver error:', {
        driverId: id,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        requestPayload: data,
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
   * Update driver account status (UserStatus: ACTIVE/INACTIVE/SUSPENDED)
   * Uses endpoint: PATCH /drivers/{id}/user-status
   */
  async updateDriverStatus(
    id: string,
    status: UserStatus
  ): Promise<UpdateDriverResponse> {
    try {
      console.log('updateDriverStatus:', { id, status })
      const response: unknown = await apiClient.patch(
        `/drivers/${id}/user-status`,
        { status }
      )
      return response as UpdateDriverResponse
    } catch (error: any) {
      console.error('updateDriverStatus error:', {
        driverId: id,
        status,
        error: error?.response?.data,
      })
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Update driver operational status (DriverStatus: AVAILABLE/ON_TRIP/OFF_DUTY)
   * Uses documented endpoint: PATCH /drivers/{id}/status
   * Sends: { status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" }
   */
  async updateDriverOperationalStatus(
    id: string,
    status: DriverStatus
  ): Promise<UpdateDriverResponse> {
    try {
      console.log('updateDriverOperationalStatus:', { id, status })
      const response: unknown = await apiClient.patch(
        `/drivers/${id}/status`,
        { status }
      )
      return response as UpdateDriverResponse
    } catch (error: any) {
      console.error('updateDriverOperationalStatus error:', {
        driverId: id,
        status,
        error: error?.response?.data,
      })
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Delete a driver
   */
  async deleteDriver(id: string): Promise<DeleteDriverResponse> {
    try {
      const response: unknown = await apiClient.delete(`/drivers/${id}`)
      return response as DeleteDriverResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const driverService = new DriverService()
