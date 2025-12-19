/**
 * Coin Requests Page (SUPER_ADMIN)
 * Manage admin coin top-up requests with approve/reject functionality
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CoinRequestCard } from '@/components/coin/CoinRequestCard'
import { ApproveCoinRequestModal } from '@/components/modals/ApproveCoinRequestModal'
import { RejectCoinRequestModal } from '@/components/modals/RejectCoinRequestModal'
import {
  useCoinRequests,
  useApproveCoinRequest,
  useRejectCoinRequest,
  useCoinRequestStats,
} from '@/hooks/useCoinRequests'
import { Clock, CheckCircle, XCircle, Coins } from 'lucide-react'
import type { CoinRequest } from '@/types/coin.types'
import type { CoinRequestStatus } from '@/lib/constants'

/**
 * CoinRequestsPage - Main page for managing coin requests
 */
export default function CoinRequestsPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<CoinRequestStatus>('PENDING')

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<CoinRequest | null>(
    null
  )
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  // Queries
  const { data: stats, isLoading: statsLoading } = useCoinRequestStats()
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useCoinRequests(activeTab)

  // Mutations
  const approveMutation = useApproveCoinRequest()
  const rejectMutation = useRejectCoinRequest()

  // Handlers
  const handleApproveClick = (requestId: string) => {
    const request = requests?.data.find((r) => r.id === requestId)
    if (request) {
      setSelectedRequest(request)
      setApproveModalOpen(true)
    }
  }

  const handleRejectClick = (requestId: string) => {
    const request = requests?.data.find((r) => r.id === requestId)
    if (request) {
      setSelectedRequest(request)
      setRejectModalOpen(true)
    }
  }

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return

    try {
      await approveMutation.mutateAsync(selectedRequest.id)
      setApproveModalOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      // Error is handled by the mutation hook with toast
      console.error('Approve error:', error)
    }
  }

  const handleRejectConfirm = async (rejectionReason: string) => {
    if (!selectedRequest) return

    try {
      await rejectMutation.mutateAsync({
        requestId: selectedRequest.id,
        rejectionReason,
      })
      setRejectModalOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      // Error is handled by the mutation hook with toast
      console.error('Reject error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Coin Requests</h1>
        <p className="text-muted-foreground">
          Review and manage admin coin top-up requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pending Requests"
          value={stats?.pending || 0}
          icon={<Clock className="h-4 w-4" />}
          description="Awaiting review"
          loading={statsLoading}
          iconClassName="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
        />
        <StatCard
          title="Approved"
          value={stats?.approved || 0}
          icon={<CheckCircle className="h-4 w-4" />}
          description="Successfully processed"
          loading={statsLoading}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title="Rejected"
          value={stats?.rejected || 0}
          icon={<XCircle className="h-4 w-4" />}
          description="Declined requests"
          loading={statsLoading}
          iconClassName="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CoinRequestStatus)}
      >
        <TabsList>
          <TabsTrigger value="PENDING">
            Pending
            {stats?.pending ? ` (${stats.pending})` : ''}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {/* Loading State */}
          {isLoading && <LoadingState message="Loading coin requests..." />}

          {/* Error State */}
          {error && (
            <ErrorState
              message="Failed to load coin requests"
              onRetry={() => refetch()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && (!requests?.data || requests.data.length === 0) && (
            <EmptyState
              icon={<Coins className="h-12 w-12" />}
              title={`No ${activeTab.toLowerCase()} coin requests`}
              message={
                activeTab === 'PENDING'
                  ? 'New coin requests will appear here'
                  : `No requests have been ${activeTab.toLowerCase()} yet`
              }
            />
          )}

          {/* Coin Request Cards Grid */}
          {!isLoading && !error && requests?.data && requests.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.data.map((request) => (
                <CoinRequestCard
                  key={request.id}
                  request={request}
                  showActions={activeTab === 'PENDING'}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                />
              ))}
            </div>
          )}

          {/* Pagination Info (if needed) */}
          {!isLoading &&
            !error &&
            requests?.pagination &&
            requests.pagination.total > 0 && (
              <div className="text-sm text-muted-foreground text-center pt-4">
                Showing {requests.data.length} of {requests.pagination.total}{' '}
                {activeTab.toLowerCase()} request
                {requests.pagination.total !== 1 ? 's' : ''}
              </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ApproveCoinRequestModal
        request={selectedRequest}
        open={approveModalOpen}
        onOpenChange={setApproveModalOpen}
        onConfirm={handleApproveConfirm}
        isLoading={approveMutation.isPending}
      />

      <RejectCoinRequestModal
        request={selectedRequest}
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onConfirm={handleRejectConfirm}
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}
