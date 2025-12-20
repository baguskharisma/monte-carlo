/**
 * React Query Hooks for Customer Management
 * Custom hooks for fetching and mutating customer data
 * Note: No create hook - customers register via mobile app
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerService } from '@/services/customer.service'
import { CUSTOMER_QUERY_KEYS } from '@/types/customer.types'
import type {
  UpdateCustomerRequest,
  GetCustomersParams,
} from '@/types/customer.types'

/**
 * Hook to fetch customers list
 */
export function useCustomers(options?: GetCustomersParams) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.list({
      search: options?.search,
      status: options?.status,
    }),
    queryFn: () => customerService.getCustomers(options),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await customerService.getCustomerById(id)
      console.log('useCustomer response for ID', id, ':', response)
      return response
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to update an existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerRequest }) => {
      // Separate status from other fields
      const { status, ...profileData } = data

      // Check if there are any profile fields to update
      const hasProfileChanges = Object.keys(profileData).some(
        (key) => profileData[key as keyof typeof profileData] !== undefined &&
                profileData[key as keyof typeof profileData] !== ''
      )

      let profileResponse = null

      // Update profile only if there are changes
      if (hasProfileChanges) {
        profileResponse = await customerService.updateCustomer(id, profileData)
      }

      // Update status separately if provided
      if (status !== undefined) {
        await customerService.updateCustomerStatus(id, status)
      }

      // Return profile response if available, otherwise return a success response
      return profileResponse || { success: true, data: {} as any, message: 'Customer updated successfully' }
    },
    onSuccess: (response, variables) => {
      // Invalidate both the list and the specific customer detail
      queryClient.invalidateQueries({
        queryKey: CUSTOMER_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: CUSTOMER_QUERY_KEYS.detail(variables.id),
      })

      // Get customer name from response
      const customerName = response?.data?.profile?.name || 'Customer'

      toast.success('Customer updated successfully', {
        description: `Changes to ${customerName} have been saved`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update customer', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to delete a customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      // Invalidate customers list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: CUSTOMER_QUERY_KEYS.lists(),
      })

      toast.success('Customer deleted successfully', {
        description: 'The customer account has been removed from the system',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete customer', {
        description: error.message || 'Please try again later',
      })
    },
  })
}
