/**
 * Payment Proof Detail Page (ADMIN)
 * View detailed payment proof information and perform approve/reject actions
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { RelativeTime } from '@/components/format/RelativeTime'
import { ApprovePaymentProofModal } from '@/components/modals/ApprovePaymentProofModal'
import { RejectPaymentProofModal } from '@/components/modals/RejectPaymentProofModal'
import { usePaymentProof } from '@/hooks/usePaymentProofs'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Users,
  Calendar,
  Clock,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

/**
 * Get status badge variant
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

export default function PaymentProofDetailPage() {
  const params = useParams()
  const router = useRouter()
  const proofId = params.id as string

  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  const { data: proof, isLoading, error, refetch } = usePaymentProof(proofId)

  // Handle modal success
  const handleModalSuccess = () => {
    refetch()
  }

  if (isLoading) {
    return <LoadingState message="Loading payment proof details..." />
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load payment proof details"
        onRetry={() => refetch()}
      />
    )
  }

  if (!proof) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Payment Proof Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The payment proof you&apos;re looking for doesn&apos;t exist
        </p>
        <Button onClick={() => router.push('/admin/payment-proofs')}>
          Back to Payment Proofs
        </Button>
      </div>
    )
  }

  // Extract details
  const customerName = proof.customer?.name || 'Unknown Customer'
  const customerAvatar = proof.customer?.profileImageUrl
  const customerPhone = proof.customer?.phone || proof.bookerPhone
  const scheduleRoute = proof.schedule?.route
    ? `${proof.schedule.route.origin} → ${proof.schedule.route.destination}`
    : 'Route not available'
  const scheduleDate = proof.schedule?.departureTime ? new Date(proof.schedule.departureTime).toLocaleDateString() : null
  const scheduleTime = proof.schedule?.departureTime ? new Date(proof.schedule.departureTime).toLocaleTimeString() : null
  const vehicleName = proof.schedule?.vehicle
    ? `${proof.schedule.vehicle.brand} ${proof.schedule.vehicle.model} (${proof.schedule.vehicle.vehicleNumber})`
    : null

  const isPending = proof.status === 'PENDING'

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/payment-proofs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Payment Proof Details</h1>
          <p className="text-muted-foreground">#{proof.proofNumber}</p>
        </div>
        <StatusBadge
          status={proof.status}
          variant={getStatusVariant(proof.status)}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Image and Customer */}
        <div className="space-y-6">
          {/* Payment Proof Image */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={proof.paymentProofUrl}
                  alt="Payment proof"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Uploaded <RelativeTime date={proof.createdAt} />
              </p>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={customerAvatar || undefined} alt={customerName} />
                  <AvatarFallback>{customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {customerName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {customerPhone}
                  </p>
                </div>
              </div>

              {/* Booking Source */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Booking Source</p>
                <Badge variant={proof.bookingSource === 'CUSTOMER_APP' ? 'default' : 'secondary'}>
                  {proof.bookingSource === 'CUSTOMER_APP' ? 'Customer App' : 'Admin Panel'}
                </Badge>
              </div>

              {/* Customer Notes */}
              {proof.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Notes</p>
                  <p className="text-sm italic">&quot;{proof.notes}&quot;</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Details */}
        <div className="space-y-6">
          {/* Schedule Details */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Route</p>
                <p className="font-semibold">{scheduleRoute}</p>
              </div>

              {scheduleDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Departure Date
                  </p>
                  <p>{new Date(scheduleDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</p>
                </div>
              )}

              {scheduleTime && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Departure Time
                  </p>
                  <p>{scheduleTime}</p>
                </div>
              )}

              {vehicleName && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    Vehicle
                  </p>
                  <p>{vehicleName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passenger Details */}
          <Card>
            <CardHeader>
              <CardTitle>Passenger Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Total Passengers
                </p>
                <p className="text-2xl font-bold">{proof.totalPassengers}</p>
              </div>

              {/* Passengers List */}
              {proof.passengers && proof.passengers.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Passenger List</p>
                  <div className="space-y-2">
                    {proof.passengers.map((passenger, index) => (
                      <div key={passenger.id} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <p className="text-sm font-medium">{passenger.name}</p>
                          {passenger.phone && (
                            <p className="text-xs text-muted-foreground">{passenger.phone}</p>
                          )}
                        </div>
                        {passenger.seatNumber && (
                          <Badge variant="outline">Seat {passenger.seatNumber}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Pickup & Dropoff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Pickup Address
                </p>
                <p className="text-sm">{proof.pickupAddress}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Dropoff Address
                </p>
                <p className="text-sm">{proof.dropoffAddress}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold">
                  <FormatCurrency value={proof.totalPrice} showSymbol />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rejection Reason Alert (if rejected) */}
      {proof.status === 'REJECTED' && proof.rejectionReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Rejection Reason:</p>
            <p>{proof.rejectionReason}</p>
            {proof.reviewedAt && (
              <p className="text-xs mt-2">
                Rejected <RelativeTime date={proof.reviewedAt} />
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons (only for pending) */}
      {isPending && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            onClick={() => setRejectModalOpen(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Payment Proof
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => setApproveModalOpen(true)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Create Ticket
          </Button>
        </div>
      )}

      {/* Approve Modal */}
      <ApprovePaymentProofModal
        open={approveModalOpen}
        onOpenChange={setApproveModalOpen}
        proof={proof}
        onSuccess={handleModalSuccess}
      />

      {/* Reject Modal */}
      <RejectPaymentProofModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        proof={proof}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
