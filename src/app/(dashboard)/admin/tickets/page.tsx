'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTickets, useTicketStats, useCancelTicket } from '@/hooks/useTickets'
import { TicketCard } from '@/components/ticket/TicketCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTablePagination } from '@/components/data-table/DataTablePagination'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { CancelTicketModal } from '@/components/modals/CancelTicketModal'
import {
  Plus,
  Filter,
  X,
  Ticket as TicketIcon,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import type { TicketStatus } from '@/lib/constants'
import type { Ticket } from '@/types/ticket.types'

export default function TicketsPage() {
  const router = useRouter()

  // State
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('CONFIRMED')
  const [search, setSearch] = useState('')
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null)

  // Queries & Mutations
  const { data, isLoading, error, refetch } = useTickets({
    page,
    limit: 12,
    status: status === 'ALL' ? undefined : status,
    search: search || undefined,
  })

  const { data: stats, isLoading: statsLoading } = useTicketStats()
  const cancelMutation = useCancelTicket()

  // Handlers
  const handleView = (id: string) => {
    router.push(`/admin/tickets/${id}`)
  }

  const handleCancel = (id: string) => {
    const ticket = data?.data.find((t) => t.id === id)
    if (ticket) {
      setTicketToCancel(ticket)
    }
  }

  const confirmCancel = async (reason: string) => {
    if (!ticketToCancel) return
    await cancelMutation.mutateAsync({
      id: ticketToCancel.id,
      data: { cancelReason: reason },
    })
    setTicketToCancel(null)
  }

  const handleResetFilters = () => {
    setStatus('CONFIRMED')
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = status !== 'CONFIRMED' || search !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Manage ticket bookings</p>
        </div>
        <Button onClick={() => router.push('/admin/tickets/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_approval}</div>
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
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8">
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <Input
              placeholder="Search by ticket number or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Status */}
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ticket List */}
      {isLoading && <LoadingState message="Loading tickets..." />}

      {error && <ErrorState title="Failed to load tickets" description="An error occurred while loading the tickets. Please try again." onRetry={() => refetch()} />}

      {!isLoading && !error && (!data?.data || data.data.length === 0) && (
        <EmptyState
          icon={TicketIcon}
          title="No tickets found"
          description="Tickets will appear here when created"
        />
      )}

      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onView={handleView}
              onCancel={handleCancel}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta && (
        <DataTablePagination
          page={data.meta.page}
          limit={data.meta.limit}
          total={data.meta.total}
          onPageChange={setPage}
          onLimitChange={() => {}}
        />
      )}

      {/* Cancel Modal */}
      <CancelTicketModal
        open={!!ticketToCancel}
        onOpenChange={(open) => !open && setTicketToCancel(null)}
        ticket={ticketToCancel}
        onConfirm={confirmCancel}
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
