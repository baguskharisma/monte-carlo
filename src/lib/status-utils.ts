/**
 * Status Utility Functions
 * Helper functions for status badge variants
 */

import type { ScheduleStatus } from '@/types/schedule.types'

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
