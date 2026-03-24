'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '@/services/schedule.service'
import {
  SCHEDULE_QUERY_KEYS,
  GetSchedulesParams,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  AssignDriverRequest,
} from '@/types/schedule.types'
import { toast } from 'sonner'

// ==================== QUERIES ====================

export function useSchedules(params?: GetSchedulesParams) {
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEYS.list(params),
    queryFn: () => scheduleService.getSchedules(params),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

export function useUpcomingSchedules(limit?: number) {
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEYS.upcoming(limit),
    queryFn: () => scheduleService.getUpcomingSchedules(limit),
    staleTime: 30000, // 30 seconds
  })
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEYS.detail(id),
    queryFn: () => scheduleService.getScheduleById(id),
    enabled: !!id,
    staleTime: 60000,
  })
}

export function useBookedSeats(scheduleId: string) {
  return useQuery({
    queryKey: ['schedules', scheduleId, 'booked-seats'],
    queryFn: () => scheduleService.getBookedSeats(scheduleId),
    enabled: !!scheduleId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

// ==================== MUTATIONS ====================

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => scheduleService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() })
      toast.success('Schedule created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create schedule')
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleRequest }) =>
      scheduleService.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.detail(variables.id) })
      toast.success('Schedule updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update schedule')
    },
  })
}

export function useAssignDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignDriverRequest }) =>
      scheduleService.assignDriver(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.detail(variables.id) })
      toast.success('Driver assigned successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign driver')
    },
  })
}

export function useCancelSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleService.cancelSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.detail(id) })
      toast.success('Schedule cancelled successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel schedule')
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() })
      toast.success('Schedule deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete schedule')
    },
  })
}
