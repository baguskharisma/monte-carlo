/**
 * Recent Coin Requests Table Component
 * Displays latest coin requests on the dashboard
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { RelativeTime } from '@/components/format/RelativeTime'
import type { RecentCoinRequest } from '@/types/analytics.types'
import { ArrowRight } from 'lucide-react'

interface RecentCoinRequestsTableProps {
  requests: RecentCoinRequest[]
  loading?: boolean
}

/**
 * Recent Coin Requests Table
 * Compact table showing latest coin requests with status
 *
 * @example
 * ```tsx
 * <RecentCoinRequestsTable
 *   requests={recentRequests}
 *   loading={isLoading}
 * />
 * ```
 */
export function RecentCoinRequestsTable({
  requests,
  loading = false,
}: RecentCoinRequestsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Coin Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Coin Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent coin requests</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Map status to badge variant
  const getStatusVariant = (status: string): 'warning' | 'success' | 'destructive' => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'warning'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Coin Requests</CardTitle>
        <Link
          href="/super-admin/coin-requests"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{request.adminName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <FormatCurrency value={request.amount} />
                  <span>•</span>
                  <RelativeTime date={request.createdAt} />
                </div>
              </div>
              <StatusBadge
                status={request.status}
                variant={getStatusVariant(request.status)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
