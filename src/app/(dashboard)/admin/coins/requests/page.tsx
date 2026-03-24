/**
 * My Coin Requests Page (ADMIN)
 * View all submitted coin requests and their status
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CoinRequestCard } from '@/components/coin/CoinRequestCard'
import { useMyCoinRequests } from '@/hooks/useCoinRequests'
import { Clock, CheckCircle, XCircle, Coins, RefreshCw } from 'lucide-react'
import type { CoinRequestStatus } from '@/lib/constants'

export default function MyCoinRequestsPage() {
  const [activeTab, setActiveTab] = useState<CoinRequestStatus | 'ALL'>('ALL')

  const status = activeTab !== 'ALL' ? activeTab : undefined
  const { data, isLoading, error, refetch, isFetching } = useMyCoinRequests(status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            My Coin Requests
          </h1>
          <p className="text-muted-foreground">
            View all your submitted top-up requests
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CoinRequestStatus | 'ALL')}
      >
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            <XCircle className="h-4 w-4 mr-2" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {/* Loading State */}
          {isLoading && <LoadingState message="Loading requests..." />}

          {/* Error State */}
          {error && (
            <ErrorState
              message="Failed to load requests"
              onRetry={() => refetch()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && (!data?.data || data.data.length === 0) && (
            <EmptyState
              icon={<Coins className="h-12 w-12" />}
              title={`No ${activeTab === 'ALL' ? '' : activeTab.toLowerCase()} requests`}
              message="Your submitted requests will appear here"
            />
          )}

          {/* Request Cards Grid */}
          {!isLoading && !error && data?.data && data.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((request) => (
                <CoinRequestCard
                  key={request.id}
                  request={request}
                  showActions={false} // ADMIN cannot approve their own requests
                />
              ))}
            </div>
          )}

          {/* Pagination Info */}
          {!isLoading &&
            !error &&
            data?.pagination &&
            data.pagination.total > 0 && (
              <div className="text-sm text-muted-foreground text-center pt-4">
                Showing {data.data.length} of {data.pagination.total} request
                {data.pagination.total !== 1 ? 's' : ''}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
