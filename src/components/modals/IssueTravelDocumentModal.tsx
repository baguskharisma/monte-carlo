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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { TravelDocument } from '@/types/travel-document.types'
import { Send, Coins, AlertTriangle, FileText, MapPin, Users } from 'lucide-react'
import { COIN_PRICES } from '@/lib/constants'
import { FormatCurrency } from '@/components/format/FormatCurrency'

interface IssueTravelDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: TravelDocument | null
  currentBalance: number
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function IssueTravelDocumentModal({
  open,
  onOpenChange,
  document,
  currentBalance,
  onConfirm,
  isLoading = false,
}: IssueTravelDocumentModalProps) {
  const requiredCoins = COIN_PRICES.TRAVEL_DOCUMENT // 10,000
  const hasInsufficientBalance = currentBalance < requiredCoins
  const balanceAfter = currentBalance - requiredCoins

  const handleConfirm = async () => {
    if (hasInsufficientBalance) return
    await onConfirm()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
    }
  }

  const route = document?.schedule?.route
  const routeDisplay = route ? `${route.origin} → ${route.destination}` : 'N/A'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Issue Travel Document
          </DialogTitle>
          <DialogDescription>Confirm issuing this travel document</DialogDescription>
        </DialogHeader>

        {document && (
          <div className="space-y-4">
            {/* Document Info */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription className="space-y-1">
                <p className="font-semibold font-mono">{document.documentNumber}</p>
                <div className="text-sm space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{routeDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{document.totalPassengers} Passenger(s)</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Coin Deduction Warning */}
            <Alert variant={hasInsufficientBalance ? 'destructive' : 'default'}>
              <Coins className="h-4 w-4" />
              <AlertTitle>Coin Deduction</AlertTitle>
              <AlertDescription className="space-y-2">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-semibold">
                      <FormatCurrency value={requiredCoins} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Balance:</span>
                    <span className="font-semibold">
                      <FormatCurrency value={currentBalance} />
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Balance After:</span>
                    <span
                      className={`font-semibold ${hasInsufficientBalance ? 'text-destructive' : ''}`}
                    >
                      <FormatCurrency value={balanceAfter} />
                    </span>
                  </div>
                </div>

                {hasInsufficientBalance && (
                  <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md mt-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                    <p className="text-sm font-semibold text-destructive">
                      Insufficient balance! Please top up your coins before issuing this document.
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || hasInsufficientBalance}>
            {isLoading ? 'Issuing...' : 'Issue Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
