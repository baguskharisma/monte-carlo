/**
 * DeleteCustomerModal Component
 * Confirmation modal for deleting a customer account
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
import type { Customer } from '@/types/user.types'

interface DeleteCustomerModalProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteCustomerModal({
  customer,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteCustomerModalProps) {
  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Customer Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-medium">{customer.profile?.name || (customer as any).name || 'Unknown Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone:</span>
              <span className="font-medium">{customer.phone || (customer as any).user?.phone || 'N/A'}</span>
            </div>
            {(customer.email || (customer as any).user?.email) && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{customer.email || (customer as any).user?.email}</span>
              </div>
            )}
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this customer will permanently remove their account and all
              associated data including booking history. This action cannot be reversed.
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
            {isLoading ? 'Deleting...' : 'Delete Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
