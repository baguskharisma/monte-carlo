'use client'

import { Schedule } from '@/types/schedule.types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RouteDisplay } from './RouteDisplay'
import { FormatDate } from '@/components/format/FormatDate'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { Calendar, Clock, Bus, User, Armchair, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getScheduleStatusVariant } from '@/lib/status-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ScheduleCardProps {
  schedule: Schedule
  onView?: (schedule: Schedule) => void
  onEdit?: (schedule: Schedule) => void
  onAssignDriver?: (schedule: Schedule) => void
  onCancel?: (schedule: Schedule) => void
  onDelete?: (schedule: Schedule) => void
  className?: string
}

/**
 * ScheduleCard Component
 * Displays schedule information in card format
 */
export function ScheduleCard({
  schedule,
  onView,
  onEdit,
  onAssignDriver,
  onCancel,
  onDelete,
  className,
}: ScheduleCardProps) {
  const hasActions = onEdit || onAssignDriver || onCancel || onDelete

  return (
    <Card
      className={cn('hover:shadow-md transition-shadow', className)}
      data-slot="schedule-card"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <RouteDisplay
            origin={schedule.route?.origin || 'Unknown'}
            destination={schedule.route?.destination || 'Unknown'}
            routeCode={schedule.route?.routeCode}
          />
          <div className="flex items-center gap-2">
            <StatusBadge status={schedule.status} variant={getScheduleStatusVariant(schedule.status)} />
            {schedule.vehicle?.type && <Badge variant="outline">{schedule.vehicle.type}</Badge>}
          </div>
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(schedule)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && schedule.status === 'SCHEDULED' && (
                <DropdownMenuItem onClick={() => onEdit(schedule)}>
                  Edit Schedule
                </DropdownMenuItem>
              )}
              {onAssignDriver && !schedule.driverId && (
                <DropdownMenuItem onClick={() => onAssignDriver(schedule)}>
                  Assign Driver
                </DropdownMenuItem>
              )}
              {onCancel && schedule.status === 'SCHEDULED' && (
                <DropdownMenuItem onClick={() => onCancel(schedule)}>
                  Cancel Schedule
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(schedule)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <FormatDate date={schedule.departureTime} format="display" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <FormatDate date={schedule.departureTime} format="time-only" />
          </div>
        </div>

        {/* Vehicle & Driver */}
        <div className="space-y-2">
          {schedule.vehicle && (
            <div className="flex items-center gap-2 text-sm">
              <Bus className="h-4 w-4 text-muted-foreground" />
              <span>{schedule.vehicle.vehicleNumber}</span>
              {schedule.vehicle.brand && schedule.vehicle.model && (
                <span className="text-muted-foreground">
                  ({schedule.vehicle.brand} {schedule.vehicle.model})
                </span>
              )}
            </div>
          )}

          {schedule.driver ? (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{schedule.driver.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>No driver assigned</span>
            </div>
          )}
        </div>

        {/* Seats & Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Armchair className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{schedule.availableSeats}</span>
            {schedule.vehicle && (
              <span className="text-muted-foreground">/ {schedule.vehicle.capacity}</span>
            )}
          </div>
          <div className="text-lg font-bold">
            <FormatCurrency value={schedule.price} />
          </div>
        </div>
      </CardContent>

      {onView && (
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full" onClick={() => onView(schedule)}>
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
