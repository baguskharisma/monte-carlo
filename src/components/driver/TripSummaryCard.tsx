'use client'

import { Card } from '@/components/ui/card'
import { Clock, MapPin, Users, Coins, Gauge } from 'lucide-react'
import { calculateTripDuration, calculateTripDistance, formatAverageSpeed } from '@/lib/trip-calculations'
import { FormatDate } from '@/components/format/FormatDate'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import type { DriverTrip } from '@/types/driver-trip.types'
import { differenceInMinutes } from 'date-fns'

interface TripSummaryCardProps {
  trip: DriverTrip
  className?: string
}

export function TripSummaryCard({ trip, className }: TripSummaryCardProps) {
  const duration = calculateTripDuration(trip.departureTime, trip.arrivalTime)
  const distance = calculateTripDistance(trip.route || null)

  // Calculate duration in minutes for average speed
  const durationMinutes = trip.arrivalTime
    ? differenceInMinutes(new Date(trip.arrivalTime), new Date(trip.departureTime))
    : null

  const avgSpeed = formatAverageSpeed(trip.route?.distance || null, durationMinutes)

  // Calculate total passengers from tickets
  const totalPassengers = trip.tickets?.reduce((sum, ticket) => sum + ticket.totalPassengers, 0) || 0

  // Calculate total costs
  const totalCosts = (trip.fuelCost || 0) + (trip.driverWage || 0) + (trip.snackCost || 0)

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Ringkasan Perjalanan</h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Durasi</span>
            </div>
            <p className="text-2xl font-bold">{duration}</p>
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Jarak</span>
            </div>
            <p className="text-2xl font-bold">{distance}</p>
          </div>

          {/* Passengers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Penumpang</span>
            </div>
            <p className="text-2xl font-bold">{totalPassengers}</p>
          </div>

          {/* Average Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              <span>Kec. Rata-rata</span>
            </div>
            <p className="text-2xl font-bold">{avgSpeed}</p>
          </div>
        </div>

        {/* Departure and Arrival Times */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Waktu Keberangkatan</p>
            <p className="font-medium">
              <FormatDate date={trip.departureTime} format="display-with-time" />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Waktu Kedatangan</p>
            <p className="font-medium">
              {trip.arrivalTime ? <FormatDate date={trip.arrivalTime} format="display-with-time" /> : '-'}
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        {totalCosts > 0 && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Coins className="h-4 w-4" />
              <span>Rincian Biaya</span>
            </div>
            <div className="space-y-2 text-sm">
              {trip.fuelCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BBM</span>
                  <span className="font-medium">
                    <FormatCurrency amount={trip.fuelCost} />
                  </span>
                </div>
              )}
              {trip.driverWage && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upah Sopir</span>
                  <span className="font-medium">
                    <FormatCurrency amount={trip.driverWage} />
                  </span>
                </div>
              )}
              {trip.snackCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Snack</span>
                  <span className="font-medium">
                    <FormatCurrency amount={trip.snackCost} />
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total Biaya</span>
                <span>
                  <FormatCurrency amount={totalCosts} />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
