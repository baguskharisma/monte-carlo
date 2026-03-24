/**
 * DeleteRouteModal Component
 * Confirmation modal for deleting a route
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
import type { Route } from '@/types/route.types'

interface DeleteRouteModalProps {
  route: Route | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteRouteModal({
  route,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteRouteModalProps) {
  if (!route) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Route
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Route Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Route Code:</span>
              <span className="font-medium">{route.routeCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Route:</span>
              <span className="font-medium">
                {route.origin} → {route.destination}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Distance:</span>
              <span className="font-medium">{route.distance} km</span>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this route will permanently remove it from the system.
              Any schedules using this route may be affected. This action cannot
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
            {isLoading ? 'Deleting...' : 'Delete Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
