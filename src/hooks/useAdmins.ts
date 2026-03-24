/**
 * React Query Hooks for Admin Management
 * Custom hooks for fetching and mutating admin data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '@/services/admin.service'
import { ADMIN_QUERY_KEYS } from '@/types/admin.types'
import type {
  CreateAdminRequest,
  UpdateAdminRequest,
} from '@/types/admin.types'
import type { UserStatus } from '@/types/user.types'

interface UseAdminsOptions {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

/**
 * Hook to fetch admins list
 */
export function useAdmins(options?: UseAdminsOptions) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.list({
      search: options?.search,
      isActive: options?.isActive,
    }),
    queryFn: () => adminService.getAdmins(options),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch a single admin by ID
 */
export function useAdmin(id: string) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await adminService.getAdminById(id)
      console.log('useAdmin response for ID', id, ':', response)
      console.log('useAdmin response.data:', response.data)
      return response
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to create a new admin
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAdminRequest) => {
      console.log('Creating admin with data:', data)
      return adminService.createAdmin(data)
    },
    onSuccess: (response) => {
      console.log('Create admin response:', response)

      // Invalidate admins list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.lists(),
      })

      // Safely get admin name from response
      const adminName = response?.data?.profile?.name ||
                       (response?.data as any)?.name ||
                       'New admin'

      toast.success('Admin created successfully', {
        description: `${adminName} has been added to the system`,
      })
    },
    onError: (error: Error) => {
      console.error('Create admin error:', error)
      toast.error('Failed to create admin', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update an existing admin
 * Handles both profile update and status update separately
 */
export function useUpdateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAdminRequest }) => {
      // Separate status from other fields
      const { status, ...profileData } = data
      
      // Check if there are any profile fields to update (excluding status)
      const hasProfileChanges = 
        (profileData.name !== undefined && profileData.name.trim() !== '') ||
        (profileData.phone !== undefined && profileData.phone.trim() !== '') ||
        (profileData.email !== undefined && profileData.email.trim() !== '')
      
      let profileResponse = null
      
      // Update profile only if there are changes
      if (hasProfileChanges) {
        profileResponse = await adminService.updateAdmin(id, profileData)
      }
      
      // Update status separately if provided
      if (status !== undefined) {
        await adminService.updateAdminStatus(id, status)
      }
      
      // Return profile response if available, otherwise return a success response
      return profileResponse || { success: true, data: {} as any, message: 'Admin updated successfully' }
    },
    onSuccess: (response, variables) => {
      // Invalidate both the list and the specific admin detail
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.detail(variables.id),
      })

      // Safely get admin name from response
      const adminName = response?.data?.profile?.name ||
                       (response?.data as any)?.name ||
                       'Admin'

      toast.success('Admin updated successfully', {
        description: `Changes to ${adminName} have been saved`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update admin', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to delete an admin
 */
export function useDeleteAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminService.deleteAdmin(id),
    onSuccess: () => {
      // Invalidate admins list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.lists(),
      })

      toast.success('Admin deleted successfully', {
        description: 'The admin account has been removed from the system',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete admin', {
        description: error.message || 'Please try again later',
      })
    },
  })
}
