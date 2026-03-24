'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  useTravelDocument,
  useIssueTravelDocument,
  useCancelTravelDocument,
} from '@/hooks/useTravelDocuments'
import { coinService } from '@/services/coin.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TravelDocumentStatusBadge } from '@/components/badge/TravelDocumentStatusBadge'
import { TravelDocumentPDF } from '@/components/travel-document/TravelDocumentPDF'
import { IssueTravelDocumentModal } from '@/components/modals/IssueTravelDocumentModal'
import { CancelTravelDocumentModal } from '@/components/modals/CancelTravelDocumentModal'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { RelativeTime } from '@/components/format/RelativeTime'
import { DetailRow } from '@/components/ui/detail-row'
import { ArrowLeft, Send, Ban, AlertCircle, Printer } from 'lucide-react'

export default function TravelDocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const { data: document, isLoading, error, refetch } = useTravelDocument(documentId)

  const { data: balanceData } = useQuery({
    queryKey: ['coin-balance'],
    queryFn: () => coinService.getCurrentCoinBalance(),
  })

  const issueMutation = useIssueTravelDocument()
  const cancelMutation = useCancelTravelDocument()

  const handleIssueConfirm = async () => {
    if (!document) return
    await issueMutation.mutateAsync(document.id)
    setShowIssueModal(false)
    refetch()
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!document) return
    await cancelMutation.mutateAsync({
      id: document.id,
      data: { cancelReason: reason },
    })
    setShowCancelModal(false)
    refetch()
  }

  if (isLoading) {
    return <LoadingState message="Loading travel document..." />
  }

  if (error || !document) {
    return (
      <ErrorState
        title="Travel document not found"
        description="The travel document you're looking for doesn't exist."
      />
    )
  }

  const canIssue = document.status === 'DRAFT'
  const canCancel = document.status === 'DRAFT'
  const canPrint = document.status === 'ISSUED'

  const route = document.schedule?.route
  const routeDisplay = route ? `${route.origin} → ${route.destination}` : 'Route N/A'
  const vehicle = document.schedule?.vehicle

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Travel Document Details</h1>
            <p className="text-muted-foreground font-mono">{document.documentNumber}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <TravelDocumentStatusBadge status={document.status} size="lg" showIcon />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {canIssue && (
          <Button onClick={() => setShowIssueModal(true)}>
            <Send className="mr-2 h-4 w-4" />
            Issue Document
          </Button>
        )}

        {canPrint && <TravelDocumentPDF document={document} />}

        {canCancel && (
          <Button
            variant="outline"
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            onClick={() => setShowCancelModal(true)}
          >
            <Ban className="mr-2 h-4 w-4" />
            Cancel Document
          </Button>
        )}
      </div>

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Route">{routeDisplay}</DetailRow>

          <DetailRow label="Departure Time">
            {document.schedule?.departureTime ? (
              <FormatDate date={document.schedule.departureTime} format="display-with-time" />
            ) : (
              'N/A'
            )}
          </DetailRow>

          <DetailRow label="Arrival Time">
            {document.schedule?.arrivalTime ? (
              <FormatDate date={document.schedule.arrivalTime} format="display-with-time" />
            ) : (
              'Not specified'
            )}
          </DetailRow>

          {route && (
            <>
              <DetailRow label="Distance">{route.distance} km</DetailRow>
              <DetailRow label="Estimated Duration">{route.estimatedDuration} minutes</DetailRow>
            </>
          )}

          <DetailRow label="Price">
            {document.schedule?.price ? <FormatCurrency value={document.schedule.price} /> : 'N/A'}
          </DetailRow>
        </CardContent>
      </Card>

      {/* Driver Information */}
      {document.driverName && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Name">{document.driverName}</DetailRow>
            <DetailRow label="Phone">{document.driverPhone}</DetailRow>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Information */}
      {vehicle && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="License Plate">{vehicle.vehicleNumber}</DetailRow>
            <DetailRow label="Type">{vehicle.type}</DetailRow>
            <DetailRow label="Brand / Model">
              {vehicle.brand} {vehicle.model}
            </DetailRow>
            <DetailRow label="Capacity">{vehicle.capacity} passengers</DetailRow>
          </CardContent>
        </Card>
      )}

      {/* Document Information */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Total Passengers">
            {document.passengers ? document.passengers.length : document.totalPassengers}
          </DetailRow>

          {document.notes && (
            <DetailRow label="Notes">
              <span className="text-sm">{document.notes}</span>
            </DetailRow>
          )}

          <DetailRow label="Created">
            <RelativeTime date={document.createdAt} />
          </DetailRow>

          {document.issuedAt && (
            <>
              <DetailRow label="Issued At">
                <FormatDate date={document.issuedAt} format="display-with-time" />
              </DetailRow>
              {document.issuedBy && <DetailRow label="Issued By">{document.issuedBy.name}</DetailRow>}
            </>
          )}

          {document.cancelledAt && (
            <>
              <DetailRow label="Cancelled At">
                <FormatDate date={document.cancelledAt} format="display-with-time" />
              </DetailRow>
              {document.cancelledBy && (
                <DetailRow label="Cancelled By">{document.cancelledBy.name}</DetailRow>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Passenger Manifest */}
      {document.passengers && document.passengers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Passenger Manifest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-[100px]">Seat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {document.passengers.map((passenger, idx) => (
                    <TableRow key={passenger.id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>{passenger.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {passenger.identityNumber || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {passenger.phone || '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-center">
                        {passenger.seatNumber || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      {(document.fuelCost || document.driverWage || document.snackCost ||
        document.schedule?.fuelCost || document.schedule?.driverWage || document.schedule?.snackCost) && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Fuel Cost">
              {document.fuelCost || document.schedule?.fuelCost ? (
                <FormatCurrency value={document.fuelCost || document.schedule?.fuelCost || 0} />
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </DetailRow>

            <DetailRow label="Driver Wage">
              {document.driverWage || document.schedule?.driverWage ? (
                <FormatCurrency value={document.driverWage || document.schedule?.driverWage || 0} />
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </DetailRow>

            <DetailRow label="Snack Cost">
              {document.snackCost || document.schedule?.snackCost ? (
                <FormatCurrency value={document.snackCost || document.schedule?.snackCost || 0} />
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </DetailRow>

            <div className="border-t pt-3">
              <DetailRow label="Total Operational Cost" className="font-semibold">
                <FormatCurrency
                  value={
                    (document.fuelCost || document.schedule?.fuelCost || 0) +
                    (document.driverWage || document.schedule?.driverWage || 0) +
                    (document.snackCost || document.schedule?.snackCost || 0)
                  }
                />
              </DetailRow>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coin Transaction Info */}
      {document.coinTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Coin Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Amount">
              <FormatCurrency value={document.coinTransaction.amount} />
            </DetailRow>
            <DetailRow label="Type">{document.coinTransaction.type}</DetailRow>
            <DetailRow label="Description">{document.coinTransaction.description}</DetailRow>
            <DetailRow label="Balance Before">
              <FormatCurrency value={document.coinTransaction.balanceBefore} />
            </DetailRow>
            <DetailRow label="Balance After">
              <FormatCurrency value={document.coinTransaction.balanceAfter} />
            </DetailRow>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Info */}
      {document.status === 'CANCELLED' && document.cancelReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Cancellation Reason:</p>
            <p>{document.cancelReason}</p>
            {document.cancelledAt && (
              <p className="text-xs mt-2">
                Cancelled <RelativeTime date={document.cancelledAt} />
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Modals */}
      <IssueTravelDocumentModal
        open={showIssueModal}
        onOpenChange={setShowIssueModal}
        document={document}
        currentBalance={balanceData?.coinBalance || 0}
        onConfirm={handleIssueConfirm}
        isLoading={issueMutation.isPending}
      />

      <CancelTravelDocumentModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        document={document}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
