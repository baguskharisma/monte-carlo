/**
 * DeleteAdminModal Component
 * Confirmation modal for deleting an admin account
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
import type { Admin } from '@/types/user.types'

interface DeleteAdminModalProps {
  admin: Admin | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteAdminModal({
  admin,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteAdminModalProps) {
  if (!admin) return null

  // Handle both API response structures (flat and nested)
  const adminData = admin as any
  const adminName = adminData.name || adminData.profile?.name || 'this admin'
  const adminEmail = adminData.user?.email || adminData.email || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Admin Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Admin Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-medium">{adminName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="font-medium">{adminEmail}</span>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this admin will permanently remove their account and all
              associated data. This action cannot be reversed.
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
            {isLoading ? 'Deleting...' : 'Delete Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
