'use client'

import { Schedule } from '@/types/schedule.types'
import { ScheduleCard } from './ScheduleCard'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleListProps {
  schedules: Schedule[]
  isLoading?: boolean
  onView?: (schedule: Schedule) => void
  onEdit?: (schedule: Schedule) => void
  onAssignDriver?: (schedule: Schedule) => void
  onCancel?: (schedule: Schedule) => void
  onDelete?: (schedule: Schedule) => void
  className?: string
}

/**
 * ScheduleList Component
 * Displays a grid of schedule cards
 */
export function ScheduleList({
  schedules,
  isLoading,
  onView,
  onEdit,
  onAssignDriver,
  onCancel,
  onDelete,
  className,
}: ScheduleListProps) {
  if (isLoading) {
    return <LoadingState message="Loading schedules..." />
  }

  if (!schedules || schedules.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No schedules found"
        description="No schedules match your current filters. Try adjusting your search criteria."
      />
    )
  }

  return (
    <div
      className={cn('grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3', className)}
      data-slot="schedule-list"
    >
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          onView={onView}
          onEdit={onEdit}
          onAssignDriver={onAssignDriver}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
