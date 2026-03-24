/**
 * Status Utility Functions
 * Helper functions for status badge variants
 */

import { Clock, Navigation, CheckCircle, XCircle } from 'lucide-react'
import type { ScheduleStatus } from '@/types/schedule.types'
import type { TicketStatus } from '@/types/ticket.types'

/**
 * Get badge variant for schedule status
 */
export function getScheduleStatusVariant(
  status: ScheduleStatus
): 'default' | 'success' | 'warning' | 'destructive' | 'info' {
  switch (status) {
    case 'SCHEDULED':
      return 'info'
    case 'DEPARTED':
      return 'warning'
    case 'ARRIVED':
      return 'success'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'default'
  }
}

/**
 * Get badge variant for ticket status
 */
export function getTicketStatusVariant(
  status: TicketStatus
): 'default' | 'success' | 'warning' | 'destructive' | 'info' {
  switch (status) {
    case 'CONFIRMED':
      return 'success'
    case 'PENDING_PAYMENT':
    case 'PENDING_APPROVAL':
      return 'warning'
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive'
    case 'COMPLETED':
      return 'info'
    default:
      return 'default'
  }
}

/**
 * Get badge variant for trip status (alias for schedule status)
 */
export function getTripStatusVariant(
  status: ScheduleStatus
): 'default' | 'success' | 'warning' | 'destructive' | 'info' {
  return getScheduleStatusVariant(status)
}

/**
 * Get icon component for trip status
 */
export function getTripStatusIcon(status: ScheduleStatus) {
  switch (status) {
    case 'SCHEDULED':
      return Clock
    case 'DEPARTED':
      return Navigation
    case 'ARRIVED':
      return CheckCircle
    case 'CANCELLED':
      return XCircle
    default:
      return Clock
  }
}
