'use client'

import { useEffect } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookedSeats } from '@/hooks/useSchedules'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Seat } from './Seat'
import { SeatLegend } from './SeatLegend'
import { BookedSeatsDisplay } from './BookedSeatsDisplay'
import type { SeatMapProps, SeatState } from '@/types/seat-map.types'

export function SeatMap({
  scheduleId,
  capacity = 8,
  selectedSeats,
  onSelectionChange,
  readonly = false,
  showLegend = true,
  className,
}: SeatMapProps) {
  // Reset selection when schedule changes
  useEffect(() => {
    onSelectionChange([])
  }, [scheduleId])

  // Fetch booked seats from API
  const { data, isLoading, error, refetch } = useBookedSeats(scheduleId)

  // Show alert if no scheduleId provided
  if (!scheduleId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a schedule first to view available seats.
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading seat availability...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load seats</AlertTitle>
        <AlertDescription>
          Could not fetch seat availability. Please try again.
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Alert>
    )
  }

  const bookedSeatsWithStatus = data?.bookedSeatsWithStatus || []
  const bookedSeats = data?.bookedSeats || []

  // Check if all seats are booked (excluding driver seat)
  const availableSeatsCount = capacity - bookedSeats.length - 1
  if (availableSeatsCount === 0 && !readonly) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No seats available</AlertTitle>
        <AlertDescription>
          All seats are currently booked for this schedule. Please select a different schedule.
        </AlertDescription>
      </Alert>
    )
  }

  // Compute seat state for a given seat number
  const getSeatState = (seatNumber: number): SeatState => {
    // Seat 1 is always the driver
    if (seatNumber === 1) return 'driver'

    // Check if booked with APPROVED status
    const bookedSeat = bookedSeatsWithStatus.find(s => s.seatNumber === seatNumber)
    if (bookedSeat?.status === 'APPROVED') return 'booked'

    // Check if pending approval
    if (bookedSeat?.status === 'PENDING') return 'pending'

    // Check if selected by user
    if (selectedSeats.includes(seatNumber)) return 'selected'

    // Available
    return 'available'
  }

  // Handle seat click
  const handleSeatClick = (seatNumber: number) => {
    if (readonly) return

    const state = getSeatState(seatNumber)
    if (state === 'booked' || state === 'pending' || state === 'driver') return

    const newSelection = selectedSeats.includes(seatNumber)
      ? selectedSeats.filter(s => s !== seatNumber)
      : [...selectedSeats, seatNumber]

    onSelectionChange(newSelection)
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle>Select Seats</CardTitle>
        <CardDescription>Choose your preferred seats</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Legend */}
        {showLegend && <SeatLegend />}

        {/* Seat Grid - Toyota Innova 2-3-3 Layout */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-4">
          {/* Row 1: Driver + 1 Passenger (2 seats) */}
          <div className="grid grid-cols-2 gap-3">
            <Seat
              seatNumber={1}
              state={getSeatState(1)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={2}
              state={getSeatState(2)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
          </div>

          {/* Row 2: Middle 3 seats */}
          <div className="grid grid-cols-3 gap-3">
            <Seat
              seatNumber={3}
              state={getSeatState(3)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={4}
              state={getSeatState(4)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={5}
              state={getSeatState(5)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
          </div>

          {/* Row 3: Back 3 seats */}
          <div className="grid grid-cols-3 gap-3">
            <Seat
              seatNumber={6}
              state={getSeatState(6)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={7}
              state={getSeatState(7)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={8}
              state={getSeatState(8)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
          </div>
        </div>

        {/* Selected Seats Summary */}
        <BookedSeatsDisplay selectedSeats={selectedSeats} />
      </CardContent>
    </Card>
  )
}
