'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { driverTripService } from '@/services/driver-trip.service'
import {
  DRIVER_TRIP_QUERY_KEYS,
  type GetDriverTripsParams,
  type UpdateTripStatusRequest,
  type CheckInPassengerRequest,
  type BulkCheckInRequest,
  type PassengerManifestItem,
} from '@/types/driver-trip.types'

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch driver's trips with filters
 */
export function useDriverTrips(params: GetDriverTripsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DRIVER_TRIP_QUERY_KEYS.list(params),
    queryFn: () => driverTripService.getDriverTrips(params),
    enabled: options?.enabled !== false && !!params.driverId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch single trip detail with trip logs
 */
export function useDriverTrip(scheduleId: string) {
  return useQuery({
    queryKey: DRIVER_TRIP_QUERY_KEYS.detail(scheduleId),
    queryFn: () => driverTripService.getDriverTripById(scheduleId),
    enabled: !!scheduleId,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch passenger manifest with check-in status
 */
export function usePassengerManifest(scheduleId: string) {
  return useQuery({
    queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId),
    queryFn: () => driverTripService.getPassengerManifest(scheduleId),
    enabled: !!scheduleId,
    staleTime: 10000, // 10 seconds
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to update trip status
 */
export function useUpdateTripStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: UpdateTripStatusRequest }) =>
      driverTripService.updateTripStatus(scheduleId, data),
    onSuccess: (_, variables) => {
      // Invalidate trip lists
      queryClient.invalidateQueries({ queryKey: DRIVER_TRIP_QUERY_KEYS.lists() })
      // Invalidate trip detail
      queryClient.invalidateQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.detail(variables.scheduleId)
      })
      // Invalidate manifest
      queryClient.invalidateQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(variables.scheduleId)
      })
      toast.success('Trip status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update trip status')
    },
  })
}

/**
 * Hook to check in a passenger with optimistic update
 */
export function useCheckInPassenger(scheduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CheckInPassengerRequest) =>
      driverTripService.checkInPassenger(scheduleId, data),
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      })

      // Snapshot previous value
      const previous = queryClient.getQueryData(
        DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      )

      // Optimistically update
      queryClient.setQueryData(
        DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId),
        (old: any) => {
          if (!old?.data?.passengers) return old

          return {
            ...old,
            data: {
              ...old.data,
              passengers: old.data.passengers.map((p: PassengerManifestItem) =>
                p.passengerId === data.passengerId
                  ? { ...p, isCheckedIn: true, checkedInAt: new Date().toISOString() }
                  : p
              ),
            },
          }
        }
      )

      return { previous }
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      queryClient.setQueryData(
        DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId),
        context?.previous
      )
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in passenger'
      toast.error(errorMessage)
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      })
    },
  })
}

/**
 * Hook to remove passenger check-in with optimistic update
 */
export function useRemoveCheckIn(scheduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (passengerId: string) =>
      driverTripService.removeCheckIn(scheduleId, passengerId),
    onMutate: async (passengerId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      })

      // Snapshot previous value
      const previous = queryClient.getQueryData(
        DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      )

      // Optimistically update
      queryClient.setQueryData(
        DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId),
        (old: any) => {
          if (!old?.data?.passengers) return old

          return {
            ...old,
            data: {
              ...old.data,
              passengers: old.data.passengers.map((p: PassengerManifestItem) =>
                p.passengerId === passengerId
                  ? { ...p, isCheckedIn: false, checkedInAt: null }
                  : p
              ),
            },
          }
        }
      )

      return { previous }
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      queryClient.setQueryData(
        DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId),
        context?.previous
      )
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove check-in'
      toast.error(errorMessage)
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      })
    },
  })
}

/**
 * Hook to bulk check-in passengers
 */
export function useBulkCheckIn(scheduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkCheckInRequest) =>
      driverTripService.bulkCheckIn(scheduleId, data),
    onSuccess: () => {
      // Invalidate manifest
      queryClient.invalidateQueries({
        queryKey: DRIVER_TRIP_QUERY_KEYS.manifest(scheduleId)
      })
      toast.success('Passengers checked in successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check in passengers')
    },
  })
}
