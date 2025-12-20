/**
 * React Query Hooks for Driver Management
 * Custom hooks for fetching and mutating driver data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { driverService } from '@/services/driver.service'
import { DRIVER_QUERY_KEYS } from '@/types/driver.types'
import type {
  CreateDriverRequest,
  UpdateDriverRequest,
  GetDriversParams,
} from '@/types/driver.types'

/**
 * Hook to fetch drivers list
 */
export function useDrivers(options?: GetDriversParams) {
  return useQuery({
    queryKey: DRIVER_QUERY_KEYS.list({
      search: options?.search,
      status: options?.status,
      driverStatus: options?.driverStatus,
    }),
    queryFn: () => driverService.getDrivers(options),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch a single driver by ID
 */
export function useDriver(id: string) {
  return useQuery({
    queryKey: DRIVER_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await driverService.getDriverById(id)
      console.log('useDriver response for ID', id, ':', response)
      return response
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to create a new driver
 */
export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDriverRequest) => {
      console.log('Creating driver with data:', data)
      return driverService.createDriver(data)
    },
    onSuccess: (response) => {
      console.log('Create driver response:', response)

      // Invalidate drivers list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.lists(),
      })

      // Get driver name from response
      const driverName = response?.data?.profile?.name || 'New driver'

      toast.success('Driver created successfully', {
        description: `${driverName} has been added to the system`,
      })
    },
    onError: (error: Error) => {
      console.error('Create driver error:', error)
      toast.error('Failed to create driver', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update an existing driver
 */
export function useUpdateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDriverRequest }) => {
      // Separate account status and operational status from other fields
      const { status, driverStatus, ...profileData } = data

      console.log('useUpdateDriver - Status fields:', { status, driverStatus })
      console.log('useUpdateDriver - Profile data to update:', profileData)

      const errors: string[] = []
      let profileResponse = null

      // 1. Update profile data first
      try {
        // Check if there are any profile fields to update
        const hasProfileChanges = Object.keys(profileData).some(
          (key) => profileData[key as keyof typeof profileData] !== undefined &&
                  profileData[key as keyof typeof profileData] !== ''
        )

        if (hasProfileChanges) {
          console.log('Updating driver profile...')
          profileResponse = await driverService.updateDriver(id, profileData)
          console.log('Profile update successful')
        }
      } catch (error: any) {
        console.error('Profile update failed:', error)
        errors.push(`Profile update failed: ${error.message}`)
      }

      // 2. Update account status (UserStatus) if provided
      if (status !== undefined && status !== null && status !== '') {
        try {
          console.log('Updating account status to:', status)
          await driverService.updateDriverStatus(id, status)
          console.log('Account status update successful')
        } catch (error: any) {
          console.error('Account status update failed:', error)
          errors.push(`Account status update failed: ${error.message}`)
        }
      }

      // 3. Update operational status (DriverStatus) if provided
      if (driverStatus !== undefined && driverStatus !== null && driverStatus !== '') {
        try {
          console.log('Updating operational status to:', driverStatus)
          await driverService.updateDriverOperationalStatus(id, driverStatus)
          console.log('Operational status update successful')
        } catch (error: any) {
          console.error('Operational status update failed:', error)
          errors.push(`Operational status update failed: ${error.message}`)
        }
      }

      // If all updates failed, throw error
      if (errors.length > 0 && !profileResponse) {
        throw new Error(errors.join('; '))
      }

      // Return profile response if available, otherwise return a success response
      return profileResponse || { success: true, data: {} as any, message: 'Driver updated successfully' }
    },
    onSuccess: (response, variables) => {
      // Invalidate both the list and the specific driver detail
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.detail(variables.id),
      })

      // Get driver name from response
      const driverName = response?.data?.profile?.name || 'Driver'

      toast.success('Driver updated successfully', {
        description: `Changes to ${driverName} have been saved`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update driver', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update driver account status only
 */
export function useUpdateDriverStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => {
      console.log('Updating driver account status:', id, 'to', status)
      return driverService.updateDriverStatus(id, status)
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.detail(variables.id),
      })

      toast.success('Driver account status updated successfully', {
        description: `Status changed to ${variables.status}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update driver account status', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update driver operational status only
 */
export function useUpdateDriverOperationalStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DriverStatus }) => {
      console.log('Updating driver operational status:', id, 'to', status)
      return driverService.updateDriverOperationalStatus(id, status)
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.detail(variables.id),
      })

      toast.success('Driver operational status updated successfully', {
        description: `Status changed to ${variables.status}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update driver operational status', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to delete a driver
 */
export function useDeleteDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => driverService.deleteDriver(id),
    onSuccess: () => {
      // Invalidate drivers list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: DRIVER_QUERY_KEYS.lists(),
      })

      toast.success('Driver deleted successfully', {
        description: 'The driver account has been removed from the system',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete driver', {
        description: error.message || 'Please try again later',
      })
    },
  })
}
