/**
 * React Query Hooks for Vehicle Management
 * Custom hooks for fetching and mutating vehicle data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vehicleService } from '@/services/vehicle.service'
import { VEHICLE_QUERY_KEYS } from '@/types/vehicle.types'
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  GetVehiclesParams,
} from '@/types/vehicle.types'

/**
 * Hook to fetch vehicles list
 */
export function useVehicles(options?: GetVehiclesParams) {
  return useQuery({
    queryKey: VEHICLE_QUERY_KEYS.list({
      search: options?.search,
      type: options?.type,
      status: options?.status,
    }),
    queryFn: () => vehicleService.getVehicles(options),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch a single vehicle by ID
 */
export function useVehicle(id: string) {
  return useQuery({
    queryKey: VEHICLE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await vehicleService.getVehicleById(id)
      console.log('useVehicle response for ID', id, ':', response)
      return response
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to create a new vehicle
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => {
      console.log('Creating vehicle with data:', data)
      return vehicleService.createVehicle(data)
    },
    onSuccess: (response) => {
      console.log('Create vehicle response:', response)

      // Invalidate vehicles list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })

      // Get vehicle number from response
      const vehicleNumber = response?.data?.vehicleNumber || 'New vehicle'

      toast.success('Vehicle created successfully', {
        description: `${vehicleNumber} has been added to the fleet`,
      })
    },
    onError: (error: Error) => {
      console.error('Create vehicle error:', error)
      toast.error('Failed to create vehicle', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update an existing vehicle
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleRequest }) => {
      console.log('Updating vehicle:', id, 'with data:', data)
      return vehicleService.updateVehicle(id, data)
    },
    onSuccess: (response, variables) => {
      // Invalidate both the list and the specific vehicle detail
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.detail(variables.id),
      })

      // Get vehicle number from response
      const vehicleNumber = response?.data?.vehicleNumber || 'Vehicle'

      toast.success('Vehicle updated successfully', {
        description: `Changes to ${vehicleNumber} have been saved`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update vehicle', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update vehicle status only
 */
export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED' }) => {
      console.log('Updating vehicle status:', id, 'to', status)
      return vehicleService.updateVehicleStatus(id, status)
    },
    onSuccess: (response, variables) => {
      // Invalidate both the list and the specific vehicle detail
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.detail(variables.id),
      })

      toast.success('Vehicle status updated successfully', {
        description: `Status changed to ${variables.status}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update vehicle status', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to delete a vehicle
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      // Invalidate vehicles list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })

      toast.success('Vehicle deleted successfully', {
        description: 'The vehicle has been removed from the fleet',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete vehicle', {
        description: error.message || 'Please try again later',
      })
    },
  })
}
