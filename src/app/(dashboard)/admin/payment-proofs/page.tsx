/**
 * Payment Proofs List Page (ADMIN)
 * View all payment proofs with filtering and approve/reject actions
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { PaymentProofCard } from '@/components/payment-proof/PaymentProofCard'
import { ApprovePaymentProofModal } from '@/components/modals/ApprovePaymentProofModal'
import { RejectPaymentProofModal } from '@/components/modals/RejectPaymentProofModal'
import { usePaymentProofs, usePaymentProofStats } from '@/hooks/usePaymentProofs'
import { Clock, CheckCircle, XCircle, FileText, RefreshCw } from 'lucide-react'
import type { PaymentProofStatus } from '@/lib/constants'
import type { PaymentProof } from '@/types/payment-proof.types'

export default function PaymentProofsPage() {
  const [activeTab, setActiveTab] = useState<PaymentProofStatus | 'ALL'>('ALL')
  const [selectedProofForApproval, setSelectedProofForApproval] = useState<PaymentProof | null>(null)
  const [selectedProofForRejection, setSelectedProofForRejection] = useState<PaymentProof | null>(null)

  const status = activeTab !== 'ALL' ? activeTab : undefined
  const { data, isLoading, error, refetch, isFetching } = usePaymentProofs({ status })
  const { data: stats, isLoading: statsLoading } = usePaymentProofStats()

  // Handle approve button click
  const handleApproveClick = (proofId: string) => {
    const proof = data?.data.find((p) => p.id === proofId)
    if (proof) {
      setSelectedProofForApproval(proof)
    }
  }

  // Handle reject button click
  const handleRejectClick = (proofId: string) => {
    const proof = data?.data.find((p) => p.id === proofId)
    if (proof) {
      setSelectedProofForRejection(proof)
    }
  }

  // Handle modal success - refetch data
  const handleModalSuccess = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Proofs
          </h1>
          <p className="text-muted-foreground">
            Review and process customer payment proofs
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

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as PaymentProofStatus | 'ALL')}
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
          {isLoading && <LoadingState message="Loading payment proofs..." />}

          {/* Error State */}
          {error && (
            <ErrorState
              message="Failed to load payment proofs"
              onRetry={() => refetch()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && (!data?.data || data.data.length === 0) && (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title={`No ${activeTab === 'ALL' ? '' : activeTab.toLowerCase()} payment proofs`}
              message="Payment proofs will appear here when customers submit bookings"
            />
          )}

          {/* Payment Proof Cards Grid */}
          {!isLoading && !error && data?.data && data.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((proof) => (
                <PaymentProofCard
                  key={proof.id}
                  proof={proof}
                  showActions={true}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
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
                Showing {data.data.length} of {data.pagination.total} payment proof
                {data.pagination.total !== 1 ? 's' : ''}
              </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Approve Modal */}
      <ApprovePaymentProofModal
        open={!!selectedProofForApproval}
        onOpenChange={(open) => !open && setSelectedProofForApproval(null)}
        proof={selectedProofForApproval}
        onSuccess={handleModalSuccess}
      />

      {/* Reject Modal */}
      <RejectPaymentProofModal
        open={!!selectedProofForRejection}
        onOpenChange={(open) => !open && setSelectedProofForRejection(null)}
        proof={selectedProofForRejection}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
