/**
 * React Query Hooks for Route Management
 * Custom hooks for fetching and mutating route data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { routeService } from '@/services/route.service'
import { ROUTE_QUERY_KEYS } from '@/types/route.types'
import type {
  CreateRouteRequest,
  UpdateRouteRequest,
  GetRoutesParams,
} from '@/types/route.types'

/**
 * Hook to fetch routes list
 */
export function useRoutes(options?: GetRoutesParams) {
  return useQuery({
    queryKey: ROUTE_QUERY_KEYS.list({
      search: options?.search,
      origin: options?.origin,
      destination: options?.destination,
      isActive: options?.isActive,
    }),
    queryFn: () => routeService.getRoutes(options),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch a single route by ID
 */
export function useRoute(id: string) {
  return useQuery({
    queryKey: ROUTE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await routeService.getRouteById(id)
      console.log('useRoute response for ID', id, ':', response)
      return response
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to create a new route
 */
export function useCreateRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRouteRequest) => {
      console.log('Creating route with data:', data)
      return routeService.createRoute(data)
    },
    onSuccess: (response) => {
      console.log('Create route response:', response)

      // Invalidate routes list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ROUTE_QUERY_KEYS.lists(),
      })

      // Get route code from response
      const routeCode = response?.data?.routeCode || 'New route'

      toast.success('Route created successfully', {
        description: `${routeCode} has been added to the system`,
      })
    },
    onError: (error: Error) => {
      console.error('Create route error:', error)
      toast.error('Failed to create route', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to update an existing route
 */
export function useUpdateRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRouteRequest }) => {
      console.log('Updating route:', id, 'with data:', data)
      return routeService.updateRoute(id, data)
    },
    onSuccess: (response, variables) => {
      // Invalidate both the list and the specific route detail
      queryClient.invalidateQueries({
        queryKey: ROUTE_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: ROUTE_QUERY_KEYS.detail(variables.id),
      })

      // Get route code from response
      const routeCode = response?.data?.routeCode || 'Route'

      toast.success('Route updated successfully', {
        description: `Changes to ${routeCode} have been saved`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update route', {
        description: error.message || 'Please try again later',
      })
    },
  })
}

/**
 * Hook to delete a route
 */
export function useDeleteRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => routeService.deleteRoute(id),
    onSuccess: () => {
      // Invalidate routes list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ROUTE_QUERY_KEYS.lists(),
      })

      toast.success('Route deleted successfully', {
        description: 'The route has been removed from the system',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete route', {
        description: error.message || 'Please try again later',
      })
    },
  })
}
