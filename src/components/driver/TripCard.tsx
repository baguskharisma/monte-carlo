'use client'

import type { DriverTrip } from '@/types/driver-trip.types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { FormatDate } from '@/components/format/FormatDate'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { Calendar, Clock, Bus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTripStatusVariant } from '@/lib/status-utils'

interface TripCardProps {
  trip: DriverTrip
  onView: (scheduleId: string) => void
  className?: string
}

/**
 * TripCard Component
 * Displays trip information in card format for driver view
 */
export function TripCard({ trip, onView, className }: TripCardProps) {
  const bookedSeats = trip.vehicle?.capacity
    ? trip.vehicle.capacity - trip.availableSeats
    : 0

  return (
    <Card
      className={cn('hover:shadow-md transition-shadow', className)}
      data-slot="trip-card"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <RouteDisplay
            origin={trip.route?.origin || 'Unknown'}
            destination={trip.route?.destination || 'Unknown'}
            routeCode={trip.route?.routeCode}
          />
          <div className="flex items-center gap-2">
            <StatusBadge status={trip.status} variant={getTripStatusVariant(trip.status)} />
            {trip.vehicle?.type && <Badge variant="outline">{trip.vehicle.type}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <FormatDate date={trip.departureTime} format="display" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <FormatDate date={trip.departureTime} format="time-only" />
          </div>
        </div>

        {/* Vehicle */}
        {trip.vehicle && (
          <div className="flex items-center gap-2 text-sm">
            <Bus className="h-4 w-4 text-muted-foreground" />
            <span>{trip.vehicle.vehicleNumber}</span>
            {trip.vehicle.brand && trip.vehicle.model && (
              <span className="text-muted-foreground">
                ({trip.vehicle.brand} {trip.vehicle.model})
              </span>
            )}
          </div>
        )}

        {/* Passengers */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{bookedSeats}</span>
            {trip.vehicle && (
              <span className="text-muted-foreground">/ {trip.vehicle.capacity} passengers</span>
            )}
          </div>
        </div>

        {/* Current Location (if available) */}
        {trip.currentLocation && (
          <div className="text-xs text-muted-foreground">
            Last location: {trip.currentLocation}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onView(trip.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
