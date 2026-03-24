'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Phone, CreditCard } from 'lucide-react'
import type { TicketPassenger } from '@/types/ticket.types'

interface PassengerListProps {
  passengers: TicketPassenger[]
}

export function PassengerList({ passengers }: PassengerListProps) {
  if (!passengers || passengers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passengers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No passengers found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passengers ({passengers.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {passengers.map((passenger) => (
          <div
            key={passenger.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{passenger.name}</span>
                {passenger.seatNumber && (
                  <Badge variant="outline">Seat {passenger.seatNumber}</Badge>
                )}
              </div>
              {passenger.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {passenger.phone}
                </div>
              )}
              {passenger.identityNumber && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-3 w-3" />
                  {passenger.identityNumber}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
