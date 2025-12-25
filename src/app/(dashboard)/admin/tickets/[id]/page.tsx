'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTicket, useCancelTicket } from '@/hooks/useTickets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { RelativeTime } from '@/components/format/RelativeTime'
import { DetailRow } from '@/components/ui/detail-row'
import { PassengerList } from '@/components/ticket/PassengerList'
import { CancelTicketModal } from '@/components/modals/CancelTicketModal'
import { ArrowLeft, MapPin, Phone, AlertCircle, Ban } from 'lucide-react'
import { getTicketStatusVariant } from '@/lib/status-utils'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const cancelMutation = useCancelTicket()

  const { data: ticket, isLoading, error, refetch } = useTicket(ticketId)

  const handleCancelConfirm = async (reason: string) => {
    if (!ticket) return
    await cancelMutation.mutateAsync({
      id: ticket.id,
      data: { cancelReason: reason },
    })
    setCancelModalOpen(false)
    refetch()
  }

  if (isLoading) {
    return <LoadingState message="Loading ticket details..." />
  }

  if (error || !ticket) {
    return (
      <ErrorState
        title="Ticket not found"
        description="The ticket you're looking for doesn't exist."
      />
    )
  }

  const canCancel = ticket.status === 'CONFIRMED' || ticket.status === 'PENDING_APPROVAL'
  const route = ticket.schedule?.route
  const routeDisplay = route ? `${route.origin} → ${route.destination}` : 'Route N/A'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Details</h1>
            <p className="text-muted-foreground font-mono">{ticket.ticketNumber}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <StatusBadge
            status={ticket.status}
            variant={getTicketStatusVariant(ticket.status)}
            size="lg"
          />
          {canCancel && (
            <Button
              variant="outline"
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={() => setCancelModalOpen(true)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Route">{routeDisplay}</DetailRow>

          <DetailRow label="Departure Time">
            <FormatDate
              date={ticket.schedule?.departureTime || ticket.createdAt}
              format="display-with-time"
            />
          </DetailRow>

          <DetailRow label="Total Passengers">{ticket.totalPassengers}</DetailRow>

          <DetailRow label="Total Price">
            <FormatCurrency value={ticket.totalPrice} />
          </DetailRow>

          <DetailRow label="Booking Source">
            <Badge variant={ticket.bookingSource === 'ADMIN_PANEL' ? 'secondary' : 'default'}>
              {ticket.bookingSource === 'ADMIN_PANEL' ? 'Admin Panel' : 'Customer App'}
            </Badge>
          </DetailRow>

          <DetailRow label="Created">
            <RelativeTime date={ticket.createdAt} />
          </DetailRow>
        </CardContent>
      </Card>

      {/* Contact & Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Booker Phone">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {ticket.bookerPhone}
            </div>
          </DetailRow>

          <DetailRow label="Pickup Address">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1" />
              <span>{ticket.pickupAddress}</span>
            </div>
          </DetailRow>

          <DetailRow label="Dropoff Address">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1" />
              <span>{ticket.dropoffAddress}</span>
            </div>
          </DetailRow>
        </CardContent>
      </Card>

      {/* Passengers */}
      {ticket.passengers && <PassengerList passengers={ticket.passengers} />}

      {/* Schedule Details */}
      {ticket.schedule && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.schedule.vehicle && (
              <DetailRow label="Vehicle">
                {ticket.schedule.vehicle.vehicleNumber} - {ticket.schedule.vehicle.type}
              </DetailRow>
            )}
            <DetailRow label="Available Seats">{ticket.schedule.availableSeats}</DetailRow>
            <DetailRow label="Schedule Price">
              <FormatCurrency value={ticket.schedule.price} />
            </DetailRow>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Info */}
      {ticket.status === 'CANCELLED' && ticket.cancelReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Cancellation Reason:</p>
            <p>{ticket.cancelReason}</p>
            {ticket.cancelledAt && (
              <p className="text-xs mt-2">
                Cancelled <RelativeTime date={ticket.cancelledAt} />
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Cancel Modal */}
      <CancelTicketModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        ticket={ticket}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
