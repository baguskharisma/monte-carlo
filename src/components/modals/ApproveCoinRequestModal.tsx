/**
 * ApproveCoinRequestModal Component
 * Confirmation modal before approving a coin request
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
import { DetailRow } from '@/components/ui/DetailRow'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { CoinRequest } from '@/types/coin.types'

interface ApproveCoinRequestModalProps {
  /** Coin request to approve */
  request: CoinRequest | null
  /** Whether the modal is open */
  open: boolean
  /** Callback to change open state */
  onOpenChange: (open: boolean) => void
  /** Callback when confirm button is clicked */
  onConfirm: () => void
  /** Whether the approve mutation is loading */
  isLoading?: boolean
}

/**
 * ApproveCoinRequestModal - Confirmation dialog for approving coin requests
 */
export function ApproveCoinRequestModal({
  request,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ApproveCoinRequestModalProps) {
  if (!request) return null

  const adminName = request.admin?.name || 'Unknown Admin'
  const currentBalance = request.admin?.coinBalance ?? 0
  const newBalance = currentBalance + request.amount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Coin Request
          </DialogTitle>
          <DialogDescription>
            Review the details before approving this coin top-up request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Summary */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <DetailRow
              label="Admin"
              value={adminName}
              className="font-medium"
            />
            <DetailRow
              label="Requested Amount"
              value={<FormatCurrency value={request.amount} showSymbol />}
              className="text-lg font-semibold"
            />
            <DetailRow
              label="Current Balance"
              value={<FormatCurrency value={currentBalance} showSymbol />}
            />
            <div className="pt-2 border-t">
              <DetailRow
                label="New Balance"
                value={
                  <span className="text-green-600 font-bold">
                    <FormatCurrency value={newBalance} showSymbol />
                  </span>
                }
              />
            </div>
          </div>

          {/* Confirmation Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will credit{' '}
              <strong>
                <FormatCurrency value={request.amount} showSymbol />
              </strong>{' '}
              to {adminName}'s account. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Approving...' : 'Approve Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
