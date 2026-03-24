'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TravelDocumentStatusBadge } from '@/components/badge/TravelDocumentStatusBadge'
import { FormatDate } from '@/components/format/FormatDate'
import { RelativeTime } from '@/components/format/RelativeTime'
import {
  FileText,
  Calendar,
  Users,
  Eye,
  Send,
  Printer,
  Ban,
  MapPin,
  Car,
  User,
} from 'lucide-react'
import type { TravelDocument } from '@/types/travel-document.types'

interface TravelDocumentCardProps {
  document: TravelDocument
  onView?: (id: string) => void
  onIssue?: (document: TravelDocument) => void
  onCancel?: (document: TravelDocument) => void
  onPrint?: (document: TravelDocument) => void
  showActions?: boolean
}

export function TravelDocumentCard({
  document,
  onView,
  onIssue,
  onCancel,
  onPrint,
  showActions = true,
}: TravelDocumentCardProps) {
  const canIssue = document.status === 'DRAFT'
  const canCancel = document.status === 'DRAFT'
  const canPrint = document.status === 'ISSUED'

  const route = document.schedule?.route
  const routeDisplay = route ? `${route.origin} → ${route.destination}` : 'Route N/A'
  const vehicle = document.schedule?.vehicle

  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{document.documentNumber}</span>
            </div>
            <h3 className="font-semibold text-lg">{routeDisplay}</h3>
          </div>
          <TravelDocumentStatusBadge status={document.status} showIcon />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <FormatDate
            date={document.schedule?.departureTime || document.createdAt}
            format="display-with-time"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Driver Info */}
        {document.driverName && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {document.driverName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{document.driverName}</p>
              <p className="text-xs text-muted-foreground">{document.driverPhone}</p>
            </div>
          </div>
        )}

        {/* Vehicle Info */}
        {vehicle && (
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{vehicle.vehicleNumber}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{vehicle.type}</span>
          </div>
        )}

        {/* Passenger Count */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {document.passengers?.length ?? document.totalPassengers} Passenger(s)
          </span>
        </div>

        {/* Created/Issued Date */}
        <p className="text-xs text-muted-foreground">
          {document.issuedAt ? (
            <>
              Issued <RelativeTime date={document.issuedAt} />
            </>
          ) : (
            <>
              Created <RelativeTime date={document.createdAt} />
            </>
          )}
        </p>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onView?.(document.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>

          {canIssue && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onIssue?.(document)}
            >
              <Send className="h-4 w-4 mr-2" />
              Issue
            </Button>
          )}

          {canPrint && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onPrint?.(document)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={() => onCancel?.(document)}
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
