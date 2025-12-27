'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDriverTrip } from '@/hooks/useDriverTrips'
import { useUpdateTripStatus } from '@/hooks/useDriverTrips'
import { getNextTripStatus, canUpdateTripStatus, type UpdateTripStatusFormData } from '@/types/driver-trip.types'
import { TripVehicleInfo } from '@/components/driver/TripVehicleInfo'
import { TripStatusTimeline } from '@/components/driver/TripStatusTimeline'
import { UpdateTripStatusModal } from '@/components/modals/UpdateTripStatusModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailRow } from '@/components/ui/detail-row'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatDate } from '@/components/format/FormatDate'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { ArrowLeft, Users, Navigation, MapPin, FileText } from 'lucide-react'
import { getTripStatusVariant } from '@/lib/status-utils'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.scheduleId as string

  const [updateModalOpen, setUpdateModalOpen] = useState(false)

  const { data: trip, isLoading, error } = useDriverTrip(scheduleId)
  const updateMutation = useUpdateTripStatus()

  const handleUpdateStatus = async (data: UpdateTripStatusFormData) => {
    await updateMutation.mutateAsync({
      scheduleId,
      data,
    })
  }

  const handleViewPassengers = () => {
    router.push(`/driver/trips/${scheduleId}/passengers`)
  }

  if (isLoading) {
    return <LoadingState message="Loading trip details..." />
  }

  if (error || !trip) {
    return (
      <ErrorState
        title="Trip not found"
        description="The trip you're looking for doesn't exist or you don't have access to it."
      />
    )
  }

  const nextStatus = getNextTripStatus(trip.status)
  const canUpdate = nextStatus && canUpdateTripStatus(trip.status, nextStatus)
  const bookedSeats = trip.vehicle?.capacity ? trip.vehicle.capacity - trip.availableSeats : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trip Details</h1>
            {trip.route && (
              <RouteDisplay
                origin={trip.route.origin}
                destination={trip.route.destination}
                routeCode={trip.route.routeCode}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {canUpdate && (
            <Button onClick={() => setUpdateModalOpen(true)}>
              <Navigation className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow label="Status">
                <StatusBadge status={trip.status} variant={getTripStatusVariant(trip.status)} />
              </DetailRow>

              <DetailRow label="Departure Time">
                <FormatDate date={trip.departureTime} format="display-with-time" />
              </DetailRow>

              {trip.arrivalTime && (
                <DetailRow label="Arrival Time">
                  <FormatDate date={trip.arrivalTime} format="display-with-time" />
                </DetailRow>
              )}

              <DetailRow label="Vehicle">
                {trip.vehicle?.vehicleNumber || '-'}
                {trip.vehicle?.type && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({trip.vehicle.type})
                  </span>
                )}
              </DetailRow>

              <DetailRow label="Price per Passenger">
                <FormatCurrency value={trip.price} />
              </DetailRow>

              <DetailRow label="Seats">
                {bookedSeats} / {trip.vehicle?.capacity || 0} passengers
                {trip.availableSeats > 0 && (
                  <span className="text-muted-foreground ml-2">
                    ({trip.availableSeats} seats available)
                  </span>
                )}
              </DetailRow>
            </CardContent>
          </Card>

          {/* Current Location & Notes */}
          {(trip.currentLocation || trip.lastUpdateTime) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Last Update
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.currentLocation && (
                  <DetailRow label="Location">
                    {trip.currentLocation}
                  </DetailRow>
                )}

                {trip.lastUpdateTime && (
                  <DetailRow label="Updated At">
                    <FormatDate date={trip.lastUpdateTime} format="display-with-time" />
                  </DetailRow>
                )}
              </CardContent>
            </Card>
          )}

          {/* Passenger Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Passengers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow label="Total Passengers">
                {bookedSeats} passenger{bookedSeats !== 1 ? 's' : ''}
              </DetailRow>

              <Button onClick={handleViewPassengers} className="w-full">
                <Users className="mr-2 h-4 w-4" />
                View Passenger Manifest
              </Button>
            </CardContent>
          </Card>

          {/* Cost Breakdown (if available) */}
          {(trip.fuelCost || trip.driverWage || trip.snackCost) && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.fuelCost && (
                  <DetailRow label="Fuel Cost">
                    <FormatCurrency value={trip.fuelCost} />
                  </DetailRow>
                )}
                {trip.driverWage && (
                  <DetailRow label="Driver Wage">
                    <FormatCurrency value={trip.driverWage} />
                  </DetailRow>
                )}
                {trip.snackCost && (
                  <DetailRow label="Snack Cost">
                    <FormatCurrency value={trip.snackCost} />
                  </DetailRow>
                )}
                <DetailRow label="Total Cost">
                  <FormatCurrency
                    value={
                      (trip.fuelCost || 0) + (trip.driverWage || 0) + (trip.snackCost || 0)
                    }
                  />
                </DetailRow>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Trip Timeline */}
          <TripStatusTimeline
            currentStatus={trip.status}
            tripLogs={trip.tripLogs}
            departureTime={trip.departureTime}
            arrivalTime={trip.arrivalTime}
          />

          {/* Vehicle, Route & Driver Info */}
          {trip.vehicle && trip.driver && trip.route && (
            <TripVehicleInfo
              vehicle={trip.vehicle}
              driver={trip.driver}
              route={trip.route}
            />
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <UpdateTripStatusModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        scheduleId={scheduleId}
        currentStatus={trip.status}
        onConfirm={handleUpdateStatus}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
