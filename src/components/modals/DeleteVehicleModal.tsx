/**
 * DeleteVehicleModal Component
 * Confirmation modal for deleting a vehicle
 */

'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle.types'

interface DeleteVehicleModalProps {
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteVehicleModal({
  vehicle,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteVehicleModalProps) {
  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Vehicle
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vehicle Number:</span>
              <span className="font-medium font-mono">{vehicle.vehicleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <span className="font-medium">{vehicle.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vehicle:</span>
              <span className="font-medium">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Capacity:</span>
              <span className="font-medium">{vehicle.capacity} seats</span>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this vehicle will permanently remove it from the fleet.
              Any schedules using this vehicle may be affected. This action cannot
              be reversed.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Vehicle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
