'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { RelativeTime } from '@/components/format/RelativeTime'
import { Ticket as TicketIcon, MapPin, Users, Calendar, Eye, Ban } from 'lucide-react'
import type { Ticket } from '@/types/ticket.types'
import { getTicketStatusVariant } from '@/lib/status-utils'

interface TicketCardProps {
  ticket: Ticket
  onView?: (id: string) => void
  onCancel?: (id: string) => void
  showActions?: boolean
}

export function TicketCard({ ticket, onView, onCancel, showActions = true }: TicketCardProps) {
  const canCancel = ticket.status === 'CONFIRMED' || ticket.status === 'PENDING_APPROVAL'
  const route = ticket.schedule?.route
  const routeDisplay = route ? `${route.origin} → ${route.destination}` : 'Route N/A'

  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{ticket.ticketNumber}</span>
            </div>
            <h3 className="font-semibold text-lg">{routeDisplay}</h3>
          </div>
          <StatusBadge status={ticket.status} variant={getTicketStatusVariant(ticket.status)} />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <FormatDate
            date={ticket.schedule?.departureTime || ticket.createdAt}
            format="display-with-time"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{ticket.totalPassengers} Passenger(s)</span>
          </div>
          <div className="font-semibold">
            <FormatCurrency value={ticket.totalPrice} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Pickup:</p>
              <p className="line-clamp-1">{ticket.pickupAddress}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={ticket.bookingSource === 'ADMIN_PANEL' ? 'secondary' : 'default'}>
            {ticket.bookingSource === 'ADMIN_PANEL' ? 'Admin Booking' : 'Customer App'}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Created <RelativeTime date={ticket.createdAt} />
        </p>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(ticket.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={() => onCancel?.(ticket.id)}
            >
              <Ban className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
