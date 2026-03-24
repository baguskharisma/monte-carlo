'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePassengerManifest, useCheckInPassenger, useRemoveCheckIn } from '@/hooks/useDriverTrips'
import type { PassengerManifestItem, TripLog } from '@/types/driver-trip.types'
import type { Schedule } from '@/types/schedule.types'
import { PassengerManifestTable } from '@/components/driver/PassengerManifestTable'
import { PrintableManifest } from '@/components/driver/PrintableManifest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatDate } from '@/components/format/FormatDate'
import { ArrowLeft, Printer } from 'lucide-react'
import { getTripStatusVariant } from '@/lib/status-utils'
import { printPage } from '@/lib/print.utils'

export default function PassengerManifestPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.scheduleId as string

  const { data, isLoading, error } = usePassengerManifest(scheduleId)
  const checkInMutation = useCheckInPassenger(scheduleId)
  const removeCheckInMutation = useRemoveCheckIn(scheduleId)

  const handleCheckIn = async (passengerId: string) => {
    await checkInMutation.mutateAsync({ passengerId })
  }

  const handleRemoveCheckIn = async (passengerId: string) => {
    await removeCheckInMutation.mutateAsync(passengerId)
  }

  const handlePrint = () => {
    printPage()
  }

  if (isLoading) {
    return <LoadingState message="Loading passenger manifest..." />
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load manifest"
        description="Unable to load the passenger manifest. Please try again."
      />
    )
  }

  // Handle both response formats: {data: {...}} or direct {...}
  const manifestData = ('data' in data && data.data ? data.data : data) as {
    schedule: Schedule
    passengers: PassengerManifestItem[]
    tripLogs: TripLog[]
  }
  const { schedule, passengers, tripLogs } = manifestData

  return (
    <div className="space-y-6">
      {/* Header - Only show on screen, hide on print */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Passenger Manifest</h1>
            {schedule.route && (
              <RouteDisplay
                origin={schedule.route.origin}
                destination={schedule.route.destination}
                routeCode={schedule.route.routeCode}
              />
            )}
          </div>
        </div>

        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Manifest
        </Button>
      </div>

      {/* Trip Summary Card - Hide on print */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Trip Information</CardTitle>
          <CardDescription>
            Overview of the trip details and current status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <StatusBadge
                status={schedule.status}
                variant={getTripStatusVariant(schedule.status)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Departure Time</p>
              <p className="text-sm font-semibold">
                <FormatDate date={schedule.departureTime} format="display-with-time" />
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
              <p className="text-sm font-semibold">
                {schedule.vehicle?.vehicleNumber || '-'}
                {schedule.vehicle?.type && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({schedule.vehicle.type})
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Passenger Table - Hide on print */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Passenger List</CardTitle>
          <CardDescription>
            Check in passengers as they board the vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PassengerManifestTable
            passengers={passengers}
            onCheckIn={handleCheckIn}
            onRemoveCheckIn={handleRemoveCheckIn}
            readonly={false}
          />
        </CardContent>
      </Card>

      {/* Printable Manifest - Only show when printing */}
      <div className="print-only hidden">
        <PrintableManifest
          schedule={schedule}
          passengers={passengers}
          tripLogs={tripLogs}
        />
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          body {
            background: white;
          }

          /* Hide navigation and other UI elements */
          nav,
          header,
          footer,
          aside {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
