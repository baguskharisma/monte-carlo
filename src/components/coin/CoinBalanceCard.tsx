/**
 * Coin Balance Card Component
 * Displays current coin balance with action buttons
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Plus, RefreshCw, History } from 'lucide-react'
import Link from 'next/link'
import { useCoinBalance } from '@/hooks/useCoinRequests'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

interface CoinBalanceCardProps {
  showActions?: boolean // Whether to show action buttons
}

export function CoinBalanceCard({ showActions = true }: CoinBalanceCardProps) {
  const { data, isLoading, error, refetch, isFetching } = useCoinBalance()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            Coin Balance
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <LoadingState message="Loading balance..." />}

        {error && (
          <ErrorState
            message="Failed to load balance"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && data && (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-4xl font-bold">
                {data.coinBalance.toLocaleString()} <span className="text-lg text-muted-foreground">coins</span>
              </p>
            </div>

            {showActions && (
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/admin/coins/request-topup">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Top-up
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/admin/coins/transactions">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
