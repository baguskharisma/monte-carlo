/**
 * DeleteDriverModal Component
 * Confirmation modal for deleting a driver account
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
import type { Driver } from '@/types/user.types'

interface DeleteDriverModalProps {
  driver: Driver | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteDriverModal({
  driver,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteDriverModalProps) {
  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Driver Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Driver Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-medium">{driver.profile?.name || (driver as any).name || 'Unknown Driver'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone:</span>
              <span className="font-medium">{driver.phone || (driver as any).user?.phone || 'N/A'}</span>
            </div>
            {(driver.email || (driver as any).user?.email) && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{driver.email || (driver as any).user?.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">License Number:</span>
              <span className="font-medium">{driver.profile?.licenseNumber || (driver as any).licenseNumber || 'N/A'}</span>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this driver will permanently remove their account and all
              associated data. Any trips assigned to this driver may be affected.
              This action cannot be reversed.
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
            {isLoading ? 'Deleting...' : 'Delete Driver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
