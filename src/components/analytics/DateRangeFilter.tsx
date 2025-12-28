/**
 * Date Range Filter Component
 * Provides preset date range options for analytics filtering
 */

'use client'

import { Button } from '@/components/ui/button'
import { subDays, startOfMonth, endOfMonth, startOfDay, endOfDay, format } from 'date-fns'

interface DateRangeFilterProps {
  value?: { startDate?: string; endDate?: string }
  onChange: (range: { startDate: string; endDate: string }) => void
}

/**
 * Date Range Filter Component
 * Provides preset buttons for common date ranges
 *
 * @example
 * ```tsx
 * <DateRangeFilter
 *   value={dateRange}
 *   onChange={setDateRange}
 * />
 * ```
 */
export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const handlePreset = (preset: 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth') => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (preset) {
      case 'last7':
        startDate = startOfDay(subDays(now, 6)) // Last 7 days including today
        endDate = endOfDay(now)
        break
      case 'last30':
        startDate = startOfDay(subDays(now, 29)) // Last 30 days including today
        endDate = endOfDay(now)
        break
      case 'last90':
        startDate = startOfDay(subDays(now, 89)) // Last 90 days including today
        endDate = endOfDay(now)
        break
      case 'thisMonth':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(now), 1) // Go to last day of previous month
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      default:
        return
    }

    // Convert to ISO strings
    onChange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
  }

  // Check if a preset is currently active
  const isActivePreset = (preset: 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth') => {
    if (!value?.startDate || !value?.endDate) return false

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (preset) {
      case 'last7':
        startDate = startOfDay(subDays(now, 6))
        endDate = endOfDay(now)
        break
      case 'last30':
        startDate = startOfDay(subDays(now, 29))
        endDate = endOfDay(now)
        break
      case 'last90':
        startDate = startOfDay(subDays(now, 89))
        endDate = endOfDay(now)
        break
      case 'thisMonth':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(now), 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      default:
        return false
    }

    // Compare dates (rounded to day)
    const currentStart = format(new Date(value.startDate), 'yyyy-MM-dd')
    const currentEnd = format(new Date(value.endDate), 'yyyy-MM-dd')
    const presetStart = format(startDate, 'yyyy-MM-dd')
    const presetEnd = format(endDate, 'yyyy-MM-dd')

    return currentStart === presetStart && currentEnd === presetEnd
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={isActivePreset('last7') ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePreset('last7')}
      >
        Last 7 Days
      </Button>
      <Button
        variant={isActivePreset('last30') ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePreset('last30')}
      >
        Last 30 Days
      </Button>
      <Button
        variant={isActivePreset('last90') ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePreset('last90')}
      >
        Last 90 Days
      </Button>
      <Button
        variant={isActivePreset('thisMonth') ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePreset('thisMonth')}
      >
        This Month
      </Button>
      <Button
        variant={isActivePreset('lastMonth') ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePreset('lastMonth')}
      >
        Last Month
      </Button>
    </div>
  )
}
