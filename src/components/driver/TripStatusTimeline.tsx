'use client'

import type { ScheduleStatus } from '@/types/schedule.types'
import type { TripLog } from '@/types/driver-trip.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormatDate } from '@/components/format/FormatDate'
import { RelativeTime } from '@/components/format/RelativeTime'
import { Clock, Navigation, CheckCircle, XCircle, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TripStatusTimelineProps {
  currentStatus: ScheduleStatus
  tripLogs?: TripLog[]
  departureTime: string
  arrivalTime: string | null
  className?: string
}

interface TimelineStep {
  status: ScheduleStatus
  label: string
  icon: React.ElementType
  completed: boolean
  active: boolean
  timestamp?: string
  location?: string | null
  notes?: string | null
}

/**
 * TripStatusTimeline Component
 * Displays vertical timeline of trip status progression
 */
export function TripStatusTimeline({
  currentStatus,
  tripLogs = [],
  departureTime,
  arrivalTime,
  className,
}: TripStatusTimelineProps) {
  // Define timeline steps
  const steps: TimelineStep[] = [
    {
      status: 'SCHEDULED',
      label: 'Scheduled',
      icon: Clock,
      completed: ['DEPARTED', 'ARRIVED', 'CANCELLED'].includes(currentStatus),
      active: currentStatus === 'SCHEDULED',
      timestamp: departureTime,
    },
    {
      status: 'DEPARTED',
      label: 'Departed',
      icon: Navigation,
      completed: ['ARRIVED'].includes(currentStatus),
      active: currentStatus === 'DEPARTED',
      timestamp: tripLogs.find(log => log.status === 'DEPARTED')?.timestamp,
      location: tripLogs.find(log => log.status === 'DEPARTED')?.location,
      notes: tripLogs.find(log => log.status === 'DEPARTED')?.notes,
    },
    {
      status: 'ARRIVED',
      label: 'Arrived',
      icon: CheckCircle,
      completed: currentStatus === 'ARRIVED',
      active: currentStatus === 'ARRIVED',
      timestamp: arrivalTime || tripLogs.find(log => log.status === 'ARRIVED')?.timestamp,
      location: tripLogs.find(log => log.status === 'ARRIVED')?.location,
      notes: tripLogs.find(log => log.status === 'ARRIVED')?.notes,
    },
  ]

  // Add cancelled step if applicable
  if (currentStatus === 'CANCELLED') {
    steps.push({
      status: 'CANCELLED',
      label: 'Cancelled',
      icon: XCircle,
      completed: true,
      active: true,
      timestamp: tripLogs.find(log => log.status === 'CANCELLED')?.timestamp,
      notes: tripLogs.find(log => log.status === 'CANCELLED')?.notes,
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Trip Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1
            const isCancelled = step.status === 'CANCELLED'

            return (
              <div key={step.status} className="relative flex gap-4">
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-4 top-10 h-[calc(100%+1rem)] w-0.5',
                      step.completed
                        ? isCancelled
                          ? 'bg-destructive'
                          : 'bg-primary'
                        : 'bg-muted'
                    )}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                    step.completed
                      ? isCancelled
                        ? 'border-destructive bg-destructive text-destructive-foreground'
                        : 'border-primary bg-primary text-primary-foreground'
                      : step.active
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        'font-medium',
                        step.active ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </h4>
                    {step.timestamp && (
                      <time className="text-sm text-muted-foreground">
                        <FormatDate date={step.timestamp} format="display-with-time" />
                      </time>
                    )}
                  </div>

                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <RelativeTime date={step.timestamp} />
                    </p>
                  )}

                  {step.location && (
                    <div className="mt-2 flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{step.location}</span>
                    </div>
                  )}

                  {step.notes && (
                    <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                      <p className="text-muted-foreground">{step.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
