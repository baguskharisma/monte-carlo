'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { COIN_PRICES } from '@/lib/constants'
import { AlertCircle, Coins } from 'lucide-react'

interface CoinDeductionWarningProps {
  passengerCount: number
  currentBalance: number
}

export function CoinDeductionWarning({ passengerCount, currentBalance }: CoinDeductionWarningProps) {
  const totalCost = passengerCount * COIN_PRICES.TICKET_BOOKING
  const hasInsufficientBalance = currentBalance < totalCost

  if (passengerCount === 0) return null

  return (
    <Alert variant={hasInsufficientBalance ? 'destructive' : 'default'}>
      <Coins className="h-4 w-4" />
      <AlertTitle>Coin Deduction</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>
            Creating this ticket will deduct{' '}
            <strong>
              <FormatCurrency value={totalCost} />
            </strong>{' '}
            from your coin balance.
          </p>
          <div className="text-sm">
            <p>
              Calculation: {passengerCount} passenger(s) × {COIN_PRICES.TICKET_BOOKING.toLocaleString()} coins
            </p>
            <p>
              Current Balance: <FormatCurrency value={currentBalance} />
            </p>
            <p
              className={
                hasInsufficientBalance
                  ? 'text-destructive font-semibold'
                  : 'text-green-600 dark:text-green-400'
              }
            >
              After Creation: <FormatCurrency value={currentBalance - totalCost} />
            </p>
          </div>
          {hasInsufficientBalance && (
            <p className="text-destructive font-semibold mt-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Insufficient balance! Please top up your coins first.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
