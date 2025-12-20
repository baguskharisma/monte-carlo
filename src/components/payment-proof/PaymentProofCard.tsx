/**
 * PaymentProofCard Component
 * Displays individual payment proof with customer details, booking info, and actions
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { RelativeTime } from '@/components/format/RelativeTime'
import { AlertCircle, MapPin, Users, Phone } from 'lucide-react'
import type { PaymentProof } from '@/types/payment-proof.types'
import { cn } from '@/lib/utils'

interface PaymentProofCardProps {
  /** Payment proof data */
  proof: PaymentProof
  /** Callback when approve button is clicked */
  onApprove?: (proofId: string) => void
  /** Callback when reject button is clicked */
  onReject?: (proofId: string) => void
  /** Whether to show action buttons (approve/reject) */
  showActions?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Get status badge variant based on payment proof status
 */
function getStatusVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'destructive'
    default:
      return 'default'
  }
}

/**
 * Get booking source badge color
 */
function getSourceBadgeVariant(source: string) {
  return source === 'CUSTOMER_APP' ? 'default' : 'secondary'
}

/**
 * PaymentProofCard - Display payment proof details with optional actions
 */
export function PaymentProofCard({
  proof,
  onApprove,
  onReject,
  showActions = false,
  className,
}: PaymentProofCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false)

  // Extract customer details
  const customerName = proof.customer?.profile?.name || 'Unknown Customer'
  const customerAvatar = proof.customer?.profile?.profileImageUrl
  const customerPhone = proof.customer?.phone || proof.bookerPhone

  // Extract schedule details
  const scheduleRoute = proof.schedule
    ? `${(proof.schedule as any).origin} → ${(proof.schedule as any).destination}`
    : 'Route not available'

  // Check if actions should be shown
  const canShowActions = showActions && proof.status === 'PENDING'

  // Get seat numbers from passengers
  const seatNumbers = proof.passengers
    ?.map((p) => p.seatNumber)
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="space-y-3">
          {/* Customer info and status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={customerAvatar || undefined} alt={customerName} />
                <AvatarFallback>{customerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">{customerName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customerPhone}
                </p>
              </div>
            </div>
            <StatusBadge
              status={proof.status}
              variant={getStatusVariant(proof.status)}
            />
          </div>

          {/* Proof Number and Booking Source */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">
              #{proof.proofNumber}
            </span>
            <Badge variant={getSourceBadgeVariant(proof.bookingSource)}>
              {proof.bookingSource === 'CUSTOMER_APP' ? 'Customer App' : 'Admin Panel'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Proof Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
            <Image
              src={proof.paymentProofUrl}
              alt="Payment proof"
              fill
              className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setImageModalOpen(true)}
            />
          </div>

          {/* Schedule Info */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">{scheduleRoute}</p>
            <p className="text-xs text-muted-foreground">
              <RelativeTime date={proof.createdAt} />
            </p>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Passengers */}
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Passengers
              </p>
              <p className="font-semibold">{proof.totalPassengers} person{proof.totalPassengers > 1 ? 's' : ''}</p>
              {seatNumbers && (
                <p className="text-xs text-muted-foreground">
                  Seats: {seatNumbers}
                </p>
              )}
            </div>

            {/* Total Price */}
            <div>
              <p className="text-muted-foreground">Total Price</p>
              <p className="font-semibold">
                <FormatCurrency value={proof.totalPrice} showSymbol />
              </p>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                Pickup
              </p>
              <p className="text-xs line-clamp-2">{proof.pickupAddress}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                Dropoff
              </p>
              <p className="text-xs line-clamp-2">{proof.dropoffAddress}</p>
            </div>
          </div>

          {/* Customer Notes */}
          {proof.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Customer Notes</p>
              <p className="text-xs italic">&quot;{proof.notes}&quot;</p>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {proof.status === 'REJECTED' && proof.rejectionReason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <span className="font-semibold">Rejection reason: </span>
                {proof.rejectionReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Reviewed Info (if approved or rejected) */}
          {proof.status !== 'PENDING' && proof.reviewedAt && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Reviewed <RelativeTime date={proof.reviewedAt} />
            </div>
          )}
        </CardContent>

        {/* Action Buttons (only for pending proofs) */}
        {canShowActions && (
          <CardFooter className="gap-2 bg-muted/20">
            <Button
              variant="outline"
              className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={() => onReject?.(proof.id)}
            >
              Reject
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onApprove?.(proof.id)}
            >
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Image Preview Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={proof.paymentProofUrl}
              alt="Payment proof (full size)"
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
