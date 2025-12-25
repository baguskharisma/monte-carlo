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
  vehicleType = 'REGULAR',
  capacity,
  selectedSeats,
  onSelectionChange,
  readonly = false,
  showLegend = true,
  className,
}: SeatMapProps) {
  // Set default capacity based on vehicle type (passenger seats only, excluding driver)
  const defaultCapacity = vehicleType === 'EKSEKUTIF' ? 5 : 7
  const totalCapacity = capacity || defaultCapacity

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

  // Check if all seats are booked (passenger seats only, driver not counted)
  const availableSeatsCount = totalCapacity - bookedSeats.length
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
    // Check if booked with APPROVED status
    const bookedSeat = bookedSeatsWithStatus.find((s) => s.seatNumber === seatNumber)
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
    if (state === 'booked' || state === 'pending') return

    const newSelection = selectedSeats.includes(seatNumber)
      ? selectedSeats.filter((s) => s !== seatNumber)
      : [...selectedSeats, seatNumber]

    onSelectionChange(newSelection)
  }

  // Render seat layout based on vehicle type
  const renderSeatLayout = () => {
    if (vehicleType === 'EKSEKUTIF') {
      // Eksekutif Layout: [1][Driver] + [2][3] + [4][5]
      // Row 1: [1] [Driver]
      // Row 2: [2] [3]
      // Row 3: [4] [5]
      return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-4">
          {/* Row 1: Seat 1 + Driver */}
          <div className="grid grid-cols-2 gap-3">
            <Seat
              seatNumber={1}
              state={getSeatState(1)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={0}
              state="driver"
              onClick={() => {}}
              disabled={true}
            />
          </div>

          {/* Row 2: 2 seats */}
          <div className="grid grid-cols-2 gap-3">
            <Seat
              seatNumber={2}
              state={getSeatState(2)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={3}
              state={getSeatState(3)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
          </div>

          {/* Row 3: 2 seats */}
          <div className="grid grid-cols-2 gap-3">
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
        </div>
      )
    } else {
      // Regular Layout: [1][Driver] + [2][3][4] + [5][6][7]
      // Row 1: [1] [Driver] [empty]
      // Row 2: [2] [3] [4]
      // Row 3: [5] [6] [7]
      return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-4">
          {/* Row 1: Seat 1 + Driver + empty */}
          <div className="grid grid-cols-3 gap-3">
            <Seat
              seatNumber={1}
              state={getSeatState(1)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
            <Seat
              seatNumber={0}
              state="driver"
              onClick={() => {}}
              disabled={true}
            />
            <div className="opacity-0 pointer-events-none">
              <div className="aspect-square" />
            </div>
          </div>

          {/* Row 2: 3 seats */}
          <div className="grid grid-cols-3 gap-3">
            <Seat
              seatNumber={2}
              state={getSeatState(2)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
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
          </div>

          {/* Row 3: 3 seats */}
          <div className="grid grid-cols-3 gap-3">
            <Seat
              seatNumber={5}
              state={getSeatState(5)}
              onClick={handleSeatClick}
              disabled={readonly}
            />
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
          </div>
        </div>
      )
    }
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle>Select Seats</CardTitle>
        <CardDescription>
          Choose your preferred seats ({vehicleType === 'EKSEKUTIF' ? 'Executive' : 'Regular'})
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Legend */}
        {showLegend && <SeatLegend />}

        {/* Seat Layout */}
        {renderSeatLayout()}

        {/* Selected Seats Summary */}
        <BookedSeatsDisplay selectedSeats={selectedSeats} />
      </CardContent>
    </Card>
  )
}
