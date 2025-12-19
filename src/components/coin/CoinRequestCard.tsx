/**
 * CoinRequestCard Component
 * Displays individual coin request with admin details, proof, and actions
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
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { RelativeTime } from '@/components/format/RelativeTime'
import { AlertCircle } from 'lucide-react'
import type { CoinRequest } from '@/types/coin.types'
import { cn } from '@/lib/utils'

interface CoinRequestCardProps {
  /** Coin request data */
  request: CoinRequest
  /** Callback when approve button is clicked */
  onApprove?: (requestId: string) => void
  /** Callback when reject button is clicked */
  onReject?: (requestId: string) => void
  /** Whether to show action buttons (approve/reject) */
  showActions?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Get status badge variant based on coin request status
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
 * CoinRequestCard - Display coin request details with optional actions
 */
export function CoinRequestCard({
  request,
  onApprove,
  onReject,
  showActions = false,
  className,
}: CoinRequestCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false)

  // Extract admin details
  const adminName = request.admin?.profile?.name || 'Unknown Admin'
  const adminAvatar = request.admin?.profile?.profileImageUrl
  const adminBalance = request.admin?.profile?.coinBalance ?? 0

  // Check if actions should be shown
  const canShowActions = showActions && request.status === 'PENDING'

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="space-y-3">
          {/* Admin info and status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={adminAvatar || undefined} alt={adminName} />
                <AvatarFallback>{adminName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">{adminName}</p>
                <p className="text-sm text-muted-foreground">
                  <RelativeTime date={request.requestDate} />
                </p>
              </div>
            </div>
            <StatusBadge
              status={request.status}
              variant={getStatusVariant(request.status)}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Proof Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
            <Image
              src={request.proofImageUrl}
              alt="Payment proof"
              fill
              className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setImageModalOpen(true)}
            />
          </div>

          {/* Amount */}
          <div>
            <p className="text-sm text-muted-foreground">Requested Amount</p>
            <p className="text-2xl font-bold">
              <FormatCurrency value={request.amount} showSymbol />
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Request ID</p>
              <p className="font-mono text-xs">{request.id.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-muted-foreground">Current Balance</p>
              <p>
                <FormatCurrency value={adminBalance} showSymbol />
              </p>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === 'REJECTED' && request.rejectionReason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <span className="font-semibold">Rejection reason: </span>
                {request.rejectionReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Processed Info (if approved or rejected) */}
          {request.status !== 'PENDING' && request.processedDate && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Processed <RelativeTime date={request.processedDate} />
              {request.processedByAdmin && (
                <span> by {request.processedByAdmin.profile?.name}</span>
              )}
            </div>
          )}
        </CardContent>

        {/* Action Buttons (only for pending requests) */}
        {canShowActions && (
          <CardFooter className="gap-2 bg-muted/20">
            <Button
              variant="outline"
              className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={() => onReject?.(request.id)}
            >
              Reject
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onApprove?.(request.id)}
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
              src={request.proofImageUrl}
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
