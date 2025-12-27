'use client'

import type { PassengerManifestItem } from '@/types/driver-trip.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DetailRow } from '@/components/ui/detail-row'
import { AlertCircle, UserCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ConfirmCheckInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  passenger: PassengerManifestItem | null
  onConfirm: () => void
  isLoading?: boolean
}

/**
 * ConfirmCheckInModal Component
 * Confirmation dialog for checking in a passenger
 */
export function ConfirmCheckInModal({
  open,
  onOpenChange,
  passenger,
  onConfirm,
  isLoading = false,
}: ConfirmCheckInModalProps) {
  if (!passenger) return null

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Confirm Passenger Check-In
          </DialogTitle>
          <DialogDescription>
            Please confirm that this passenger has boarded the vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Passenger Information */}
          <div className="rounded-lg border p-4 space-y-3">
            <DetailRow label="Passenger Name">
              <span className="font-semibold">{passenger.passengerName}</span>
            </DetailRow>

            <DetailRow label="Seat Number">
              <span className="font-mono font-semibold">{passenger.seatNumber || '-'}</span>
            </DetailRow>

            <DetailRow label="Ticket Number">
              <span className="font-mono text-sm">{passenger.ticketNumber}</span>
            </DetailRow>

            {passenger.phone && (
              <DetailRow label="Phone">
                <a href={`tel:${passenger.phone}`} className="hover:underline">
                  {passenger.phone}
                </a>
              </DetailRow>
            )}

            {passenger.identityNumber && (
              <DetailRow label="ID Number">
                {passenger.identityNumber}
              </DetailRow>
            )}

            {passenger.pickupAddress && (
              <DetailRow label="Pickup Address">
                {passenger.pickupAddress}
              </DetailRow>
            )}
          </div>

          {/* Warning Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Once checked in, this status cannot be changed.
              Please ensure the passenger has physically boarded the vehicle.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Checking In...' : 'Confirm Check-In'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
