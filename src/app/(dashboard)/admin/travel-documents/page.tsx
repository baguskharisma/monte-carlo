'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  useTravelDocuments,
  useTravelDocumentStats,
  useIssueTravelDocument,
  useCancelTravelDocument,
} from '@/hooks/useTravelDocuments'
import { coinService } from '@/services/coin.service'
import { TravelDocumentCard } from '@/components/travel-document/TravelDocumentCard'
import { TravelDocumentPDF } from '@/components/travel-document/TravelDocumentPDF'
import { IssueTravelDocumentModal } from '@/components/modals/IssueTravelDocumentModal'
import { CancelTravelDocumentModal } from '@/components/modals/CancelTravelDocumentModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTablePagination } from '@/components/data-table/DataTablePagination'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, FileText, FileEdit, CheckCircle, XCircle } from 'lucide-react'
import type { TravelDocumentStatus, TravelDocument } from '@/types/travel-document.types'

export default function TravelDocumentsPage() {
  const router = useRouter()

  // State
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TravelDocumentStatus | 'ALL'>('ALL')
  const [documentToIssue, setDocumentToIssue] = useState<TravelDocument | null>(null)
  const [documentToCancel, setDocumentToCancel] = useState<TravelDocument | null>(null)
  const [documentToPrint, setDocumentToPrint] = useState<TravelDocument | null>(null)

  // Queries & Mutations
  const { data, isLoading, error, refetch } = useTravelDocuments({
    page,
    limit: 12,
    status: status === 'ALL' ? undefined : status,
  })

  const { data: stats, isLoading: statsLoading } = useTravelDocumentStats()

  const { data: balanceData } = useQuery({
    queryKey: ['coin-balance'],
    queryFn: () => coinService.getCurrentCoinBalance(),
  })

  const issueMutation = useIssueTravelDocument()
  const cancelMutation = useCancelTravelDocument()

  // Handlers
  const handleView = (id: string) => {
    router.push(`/admin/travel-documents/${id}`)
  }

  const handleIssue = (document: TravelDocument) => {
    setDocumentToIssue(document)
  }

  const handleCancel = (document: TravelDocument) => {
    setDocumentToCancel(document)
  }

  const handlePrint = (document: TravelDocument) => {
    setDocumentToPrint(document)
  }

  const confirmIssue = async () => {
    if (!documentToIssue) return
    await issueMutation.mutateAsync(documentToIssue.id)
    setDocumentToIssue(null)
  }

  const confirmCancel = async (reason: string) => {
    if (!documentToCancel) return
    await cancelMutation.mutateAsync({
      id: documentToCancel.id,
      data: { cancelReason: reason },
    })
    setDocumentToCancel(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Documents</h1>
          <p className="text-muted-foreground">Manage travel documents (Surat Jalan)</p>
        </div>
        <Button onClick={() => router.push('/admin/travel-documents/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Travel Document
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileEdit className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.issued}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Tabs */}
      <Tabs value={status} onValueChange={(v) => setStatus(v as TravelDocumentStatus | 'ALL')}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="DRAFT">
            <FileEdit className="h-4 w-4 mr-2" />
            Draft
          </TabsTrigger>
          <TabsTrigger value="ISSUED">
            <CheckCircle className="h-4 w-4 mr-2" />
            Issued
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            <XCircle className="h-4 w-4 mr-2" />
            Cancelled
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Document List */}
      {isLoading && <LoadingState message="Loading travel documents..." />}

      {error && (
        <ErrorState title="Failed to load travel documents" description="An error occurred while loading the travel documents. Please try again." onRetry={() => refetch()} />
      )}

      {!isLoading && !error && (!data?.data || data.data.length === 0) && (
        <EmptyState
          icon={FileText}
          title="No travel documents found"
          description="Travel documents will appear here when created"
        />
      )}

      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((document) => (
              <TravelDocumentCard
                key={document.id}
                document={document}
                onView={handleView}
                onIssue={handleIssue}
                onCancel={handleCancel}
                onPrint={handlePrint}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.meta && (
            <DataTablePagination
              page={data.meta.page}
              limit={data.meta.limit}
              total={data.meta.total}
              onPageChange={setPage}
              onLimitChange={() => {}}
            />
          )}
        </>
      )}

      {/* Modals */}
      <IssueTravelDocumentModal
        open={!!documentToIssue}
        onOpenChange={(open) => !open && setDocumentToIssue(null)}
        document={documentToIssue}
        currentBalance={balanceData?.coinBalance || 0}
        onConfirm={confirmIssue}
        isLoading={issueMutation.isPending}
      />

      <CancelTravelDocumentModal
        open={!!documentToCancel}
        onOpenChange={(open) => !open && setDocumentToCancel(null)}
        document={documentToCancel}
        onConfirm={confirmCancel}
        isLoading={cancelMutation.isPending}
      />

      {/* PDF Print - Trigger component when needed */}
      {documentToPrint && (
        <div className="hidden">
          <TravelDocumentPDF document={documentToPrint} />
        </div>
      )}
    </div>
  )
}
