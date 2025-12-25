'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '@/services/ticket.service'
import {
  TICKET_QUERY_KEYS,
  type GetTicketsParams,
  type CreateTicketRequest,
  type CancelTicketRequest,
} from '@/types/ticket.types'
import { toast } from 'sonner'

// ==================== QUERIES ====================

/**
 * Get all tickets with optional filters
 */
export function useTickets(params?: GetTicketsParams) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.list(params),
    queryFn: () => ticketService.getTickets(params),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Get ticket by ID
 */
export function useTicket(id: string) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.detail(id),
    queryFn: () => ticketService.getTicketById(id),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Get ticket stats for dashboard
 */
export function useTicketStats() {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await ticketService.getTickets()
      const tickets = response.data

      return {
        pending_payment: tickets.filter((t) => t.status === 'PENDING_PAYMENT').length,
        pending_approval: tickets.filter((t) => t.status === 'PENDING_APPROVAL').length,
        confirmed: tickets.filter((t) => t.status === 'CONFIRMED').length,
        cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
        completed: tickets.filter((t) => t.status === 'COMPLETED').length,
        total: tickets.length,
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

// ==================== MUTATIONS ====================

/**
 * Create new ticket mutation
 * Invalidates: tickets, schedules, coin-balance queries
 */
export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => ticketService.createTicket(data),
    onSuccess: () => {
      // Invalidate all tickets queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.stats() })

      // Invalidate coin balance (coins were deducted)
      queryClient.invalidateQueries({ queryKey: ['coin-balance'] })
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] })

      // Invalidate schedules (available seats changed)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })

      toast.success('Ticket created successfully and coins deducted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket')
    },
  })
}

/**
 * Cancel ticket mutation
 * Invalidates: tickets, schedules, coin-balance queries
 */
export function useCancelTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelTicketRequest }) =>
      ticketService.cancelTicket(id, data),
    onSuccess: (_, variables) => {
      // Invalidate ticket queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.stats() })

      // Invalidate coin balance (coins were refunded)
      queryClient.invalidateQueries({ queryKey: ['coin-balance'] })
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] })

      // Invalidate schedules (available seats changed)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })

      toast.success('Ticket cancelled and coins refunded')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel ticket')
    },
  })
}
