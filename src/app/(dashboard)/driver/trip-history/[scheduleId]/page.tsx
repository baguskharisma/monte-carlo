'use client'

import { useParams, useRouter } from 'next/navigation'
import { useDriverTrip, usePassengerManifest } from '@/hooks/useDriverTrips'
import { TripVehicleInfo } from '@/components/driver/TripVehicleInfo'
import { TripStatusTimeline } from '@/components/driver/TripStatusTimeline'
import { TripSummaryCard } from '@/components/driver/TripSummaryCard'
import { PassengerManifestTable } from '@/components/driver/PassengerManifestTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { ArrowLeft, Users, History } from 'lucide-react'

export default function TripHistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.scheduleId as string

  const { data: trip, isLoading, error } = useDriverTrip(scheduleId)
  const { data: manifestData, isLoading: manifestLoading } = usePassengerManifest(scheduleId)

  if (isLoading) {
    return <LoadingState message="Memuat detail perjalanan..." />
  }

  if (error || !trip) {
    return (
      <ErrorState
        title="Perjalanan Tidak Ditemukan"
        description="Perjalanan yang Anda cari tidak ada atau Anda tidak memiliki akses ke halaman ini."
      />
    )
  }

  // Handle both response formats: {data: {...}} or direct {...}
  const manifestInfo = manifestData
    ? ('data' in manifestData && manifestData.data ? manifestData.data : manifestData)
    : null
  const passengers = (manifestInfo as any)?.passengers || []

  // Debug logging
  console.log('Trip History Detail Debug:', {
    scheduleId,
    manifestData,
    manifestInfo,
    passengersCount: passengers.length,
    passengers,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/driver/trip-history')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Perjalanan</h1>
            {trip.route && (
              <RouteDisplay
                origin={trip.route.origin}
                destination={trip.route.destination}
                routeCode={trip.route.routeCode}
              />
            )}
          </div>
        </div>
      </div>

      {/* Trip Summary Card */}
      <TripSummaryCard trip={trip} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Trip Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline Perjalanan</CardTitle>
            </CardHeader>
            <CardContent>
              <TripStatusTimeline
                currentStatus={trip.status}
                tripLogs={trip.tripLogs}
                departureTime={trip.departureTime}
                arrivalTime={trip.arrivalTime}
              />
            </CardContent>
          </Card>

          {/* Passenger Manifest */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Daftar Penumpang
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {passengers.length} Penumpang
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {manifestLoading && (
                <div className="py-8">
                  <LoadingState message="Memuat daftar penumpang..." />
                </div>
              )}

              {!manifestLoading && passengers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Tidak ada data penumpang untuk perjalanan ini.
                  </p>
                </div>
              )}

              {!manifestLoading && passengers.length > 0 && (
                <PassengerManifestTable passengers={passengers} readonly={true} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Vehicle, Route & Driver Info */}
          {trip.vehicle && trip.driver && trip.route && (
            <TripVehicleInfo vehicle={trip.vehicle} driver={trip.driver} route={trip.route} />
          )}
        </div>
      </div>
    </div>
  )
}
