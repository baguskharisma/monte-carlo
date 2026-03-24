'use client'

import { useState } from 'react'
import type { PassengerManifestItem } from '@/types/driver-trip.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Users, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmCheckInModal } from '@/components/modals/ConfirmCheckInModal'
import { toast } from 'sonner'

interface PassengerManifestTableProps {
  passengers: PassengerManifestItem[]
  onCheckIn?: (passengerId: string) => Promise<void>
  onRemoveCheckIn?: (passengerId: string) => Promise<void>
  readonly?: boolean
  className?: string
}

/**
 * PassengerManifestTable Component
 * Displays passenger list with check-in functionality
 */
export function PassengerManifestTable({
  passengers,
  onCheckIn,
  onRemoveCheckIn,
  readonly = false,
  className,
}: PassengerManifestTableProps) {
  const [loadingPassengers, setLoadingPassengers] = useState<Set<string>>(new Set())
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerManifestItem | null>(null)

  const handleCheckboxClick = (passenger: PassengerManifestItem) => {
    if (readonly || !onCheckIn) return

    // Prevent interaction if already loading
    if (loadingPassengers.has(passenger.passengerId)) return

    // If already checked in, prevent any changes (LOCKED)
    if (passenger.isCheckedIn) {
      toast.error('This passenger is already checked in. Status cannot be changed.')
      return
    }

    // Show confirmation modal for check-in
    setSelectedPassenger(passenger)
    setConfirmModalOpen(true)
  }

  const handleConfirmCheckIn = async () => {
    if (!selectedPassenger || !onCheckIn) return

    setLoadingPassengers(prev => new Set(prev).add(selectedPassenger.passengerId))

    try {
      await onCheckIn(selectedPassenger.passengerId)
      toast.success(`${selectedPassenger.passengerName} has been checked in`)
    } catch (error) {
      // Error is already handled by the mutation hook with toast
      console.error('Check-in error:', error)
    } finally {
      setLoadingPassengers(prev => {
        const next = new Set(prev)
        next.delete(selectedPassenger.passengerId)
        return next
      })
      setSelectedPassenger(null)
    }
  }

  const checkedInCount = passengers.filter(p => p.isCheckedIn).length
  const totalPassengers = passengers.length

  if (passengers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Passengers</h3>
        <p className="text-sm text-muted-foreground">
          No passengers have booked tickets for this trip yet.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Summary */}
      {!readonly && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={checkedInCount === totalPassengers ? 'default' : 'secondary'}>
              {checkedInCount} / {totalPassengers} checked in
            </Badge>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {!readonly && <TableHead className="w-12">Check-in</TableHead>}
              <TableHead className="w-16">Seat</TableHead>
              <TableHead>Passenger Name</TableHead>
              <TableHead>Ticket #</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Pickup Address</TableHead>
              <TableHead>Dropoff Address</TableHead>
              <TableHead className="w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengers.map((passenger) => {
              const isLoading = loadingPassengers.has(passenger.passengerId)

              return (
                <TableRow
                  key={passenger.passengerId}
                  className={cn(
                    passenger.isCheckedIn && 'bg-muted/50'
                  )}
                >
                  {/* Check-in Checkbox */}
                  {!readonly && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={passenger.isCheckedIn || false}
                          onCheckedChange={() => handleCheckboxClick(passenger)}
                          disabled={isLoading || passenger.isCheckedIn}
                          aria-label={`Check in ${passenger.passengerName}`}
                          className={cn(
                            passenger.isCheckedIn && 'cursor-not-allowed opacity-60'
                          )}
                        />
                        {passenger.isCheckedIn && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Seat Number */}
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {passenger.seatNumber || '-'}
                    </Badge>
                  </TableCell>

                  {/* Passenger Name */}
                  <TableCell className="font-medium">
                    {passenger.passengerName}
                    {passenger.identityNumber && (
                      <div className="text-xs text-muted-foreground">
                        ID: {passenger.identityNumber}
                      </div>
                    )}
                  </TableCell>

                  {/* Ticket Number */}
                  <TableCell className="font-mono text-sm">
                    {passenger.ticketNumber}
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    {passenger.phone ? (
                      <a
                        href={`tel:${passenger.phone}`}
                        className="hover:underline"
                      >
                        {passenger.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Pickup Address */}
                  <TableCell className="max-w-xs truncate">
                    {passenger.pickupAddress || '-'}
                  </TableCell>

                  {/* Dropoff Address */}
                  <TableCell className="max-w-xs truncate">
                    {passenger.dropoffAddress || '-'}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {passenger.isCheckedIn ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Checked In</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Circle className="h-4 w-4" />
                        <span className="text-xs font-medium">Not Checked</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmCheckInModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        passenger={selectedPassenger}
        onConfirm={handleConfirmCheckIn}
        isLoading={selectedPassenger ? loadingPassengers.has(selectedPassenger.passengerId) : false}
      />
    </div>
  )
}
