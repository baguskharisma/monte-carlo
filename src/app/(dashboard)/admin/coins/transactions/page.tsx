/**
 * Coin Transactions Page (ADMIN)
 * View complete transaction history with filtering
 */

'use client'

import { CoinTransactionList } from '@/components/coin/CoinTransactionList'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useMyTransactions } from '@/hooks/useCoinRequests'

export default function CoinTransactionsPage() {
  const { refetch, isFetching } = useMyTransactions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View all your coin transactions (top-ups, deductions, refunds)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Transaction List */}
      <CoinTransactionList />
    </div>
  )
}
