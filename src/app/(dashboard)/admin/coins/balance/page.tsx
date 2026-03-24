/**
 * Coin Balance Page (ADMIN)
 * Overview of coin balance with quick actions
 */

'use client'

import { CoinBalanceCard } from '@/components/coin/CoinBalanceCard'
import { useMyCoinRequests } from '@/hooks/useCoinRequests'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import { RelativeTime } from '@/components/format/RelativeTime'

export default function CoinBalancePage() {
  // Fetch only pending requests for quick view
  const { data: pendingRequests } = useMyCoinRequests('PENDING')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Coin Balance</h1>
        <p className="text-muted-foreground">
          Manage your coin balance and top-up requests
        </p>
      </div>

      {/* Balance Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <CoinBalanceCard />

        {/* Pending Requests Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests?.data && pendingRequests.data.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You have {pendingRequests.data.length} pending top-up request
                  {pendingRequests.data.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {pendingRequests.data.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div>
                        <p className="font-semibold">
                          {request.amount.toLocaleString()} coins
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <RelativeTime date={request.requestDate} />
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
                {pendingRequests.data.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingRequests.data.length - 3} more
                  </p>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/coins/requests">View All Requests</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No pending requests
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/coins/request-topup">
            <FileText className="h-4 w-4 mr-2" />
            Request Top-up
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/coins/transactions">
            <FileText className="h-4 w-4 mr-2" />
            Transaction History
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/coins/requests">
            <FileText className="h-4 w-4 mr-2" />
            My Requests
          </Link>
        </Button>
      </div>
    </div>
  )
}
