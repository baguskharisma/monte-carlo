/**
 * Customer Service
 * Service layer for customer management operations
 * Note: No create method - customers register via mobile app
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  GetCustomersResponse,
  GetCustomerResponse,
  UpdateCustomerResponse,
  DeleteCustomerResponse,
  UpdateCustomerRequest,
  GetCustomersParams,
} from '@/types/customer.types'
import type { UserStatus } from '@/types/user.types'

class CustomerService {
  /**
   * Fetch all customers with optional filters
   */
  async getCustomers(params?: GetCustomersParams): Promise<GetCustomersResponse> {
    try {
      console.log('Fetching customers with params:', params)
      const response: unknown = await apiClient.get('/customers', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          status: params?.status,
        },
      })
      console.log('Customers API response:', response)
      return response as GetCustomersResponse
    } catch (error: any) {
      console.error('Get customers error:', {
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
   * Fetch a single customer by ID
   */
  async getCustomerById(id: string): Promise<GetCustomerResponse> {
    try {
      console.log('Fetching customer with ID:', id)
      const response: unknown = await apiClient.get(`/customers/${id}`)
      console.log('Customer API response:', response)
      return response as GetCustomerResponse
    } catch (error: any) {
      console.error('Get customer by ID error:', {
        customerId: id,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      })
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(
    id: string,
    data: UpdateCustomerRequest
  ): Promise<UpdateCustomerResponse> {
    try {
      const payload: any = {}

      // Only include fields that are provided and not empty
      if (data.name !== undefined && data.name.trim() !== '') {
        payload.name = data.name.trim()
      }
      if (data.phone !== undefined && data.phone.trim() !== '') {
        payload.phone = data.phone.trim().replace(/[\s\-()]/g, '')
      }
      if (data.email !== undefined && data.email.trim() !== '') {
        payload.email = data.email.trim()
      }
      if (data.address !== undefined && data.address.trim() !== '') {
        payload.address = data.address.trim()
      }
      if (data.birthDate !== undefined && data.birthDate.trim() !== '') {
        payload.birthDate = data.birthDate
      }
      if (data.gender !== undefined) {
        payload.gender = data.gender
      }

      // Don't send empty payload
      if (Object.keys(payload).length === 0 && !data.status) {
        throw new Error('At least one field must be provided for update')
      }

      console.log('Update customer payload:', payload)
      const response: unknown = await apiClient.patch(`/customers/${id}`, payload)
      return response as UpdateCustomerResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Update customer error:', {
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
   * Update customer account status
   * Separate endpoint for updating account status
   */
  async updateCustomerStatus(
    id: string,
    status: UserStatus
  ): Promise<UpdateCustomerResponse> {
    try {
      const response: unknown = await apiClient.patch(
        `/customers/${id}/status`,
        { status }
      )
      return response as UpdateCustomerResponse
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Delete a customer (soft delete)
   */
  async deleteCustomer(id: string): Promise<DeleteCustomerResponse> {
    try {
      const response: unknown = await apiClient.delete(`/customers/${id}`)
      return response as DeleteCustomerResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const customerService = new CustomerService()
