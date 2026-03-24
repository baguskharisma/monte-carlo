'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSchedule } from '@/hooks/useSchedules'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, UserPlus } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { FormatDate } from '@/components/format/FormatDate'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { DetailRow } from '@/components/ui/detail-row'
import { getScheduleStatusVariant } from '@/lib/status-utils'

export default function ScheduleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.id as string

  const { data: schedule, isLoading, error } = useSchedule(scheduleId)

  if (isLoading) {
    return <LoadingState message="Loading schedule details..." />
  }

  if (error || !schedule) {
    return (
      <ErrorState
        title="Schedule not found"
        description="The schedule you're looking for doesn't exist."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule Details</h1>
            <RouteDisplay
              origin={schedule.route?.origin || 'Unknown'}
              destination={schedule.route?.destination || 'Unknown'}
              routeCode={schedule.route?.routeCode}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {schedule.status === 'SCHEDULED' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/schedules/${scheduleId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              {!schedule.driverId && (
                <Button onClick={() => router.push(`/admin/schedules/${scheduleId}/assign-driver`)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Driver
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Status">
            <StatusBadge status={schedule.status} variant={getScheduleStatusVariant(schedule.status)} />
          </DetailRow>

          <DetailRow label="Departure Time">
            <FormatDate date={schedule.departureTime} format="display-with-time" />
          </DetailRow>

          {schedule.arrivalTime && (
            <DetailRow label="Arrival Time">
              <FormatDate date={schedule.arrivalTime} format="display-with-time" />
            </DetailRow>
          )}

          <DetailRow label="Price">
            <FormatCurrency value={schedule.price} />
          </DetailRow>

          <DetailRow label="Available Seats">
            {schedule.availableSeats}/{schedule.vehicle?.capacity || 0}
          </DetailRow>
        </CardContent>
      </Card>

      {/* Vehicle Info Card */}
      {schedule.vehicle && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Vehicle Number">{schedule.vehicle.vehicleNumber}</DetailRow>
            <DetailRow label="Type">{schedule.vehicle.type}</DetailRow>
            {schedule.vehicle.brand && schedule.vehicle.model && (
              <DetailRow label="Brand & Model">
                {schedule.vehicle.brand} {schedule.vehicle.model}
              </DetailRow>
            )}
            <DetailRow label="Capacity">{schedule.vehicle.capacity} passengers</DetailRow>
          </CardContent>
        </Card>
      )}

      {/* Driver Info Card */}
      {schedule.driver ? (
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Name">{schedule.driver.name}</DetailRow>
            <DetailRow label="Phone">{schedule.driver.phone}</DetailRow>
            {schedule.driver.licenseNumber && (
              <DetailRow label="License Number">{schedule.driver.licenseNumber}</DetailRow>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No driver assigned to this schedule yet.</p>
            <Button
              className="mt-4"
              onClick={() => router.push(`/admin/schedules/${scheduleId}/assign-driver`)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Driver
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown Card */}
      {(schedule.fuelCost || schedule.driverWage || schedule.snackCost) && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.fuelCost && (
              <DetailRow label="Fuel Cost">
                <FormatCurrency value={schedule.fuelCost} />
              </DetailRow>
            )}
            {schedule.driverWage && (
              <DetailRow label="Driver Wage">
                <FormatCurrency value={schedule.driverWage} />
              </DetailRow>
            )}
            {schedule.snackCost && (
              <DetailRow label="Snack Cost">
                <FormatCurrency value={schedule.snackCost} />
              </DetailRow>
            )}
            <DetailRow label="Total Cost">
              <FormatCurrency
                value={
                  (schedule.fuelCost || 0) + (schedule.driverWage || 0) + (schedule.snackCost || 0)
                }
              />
            </DetailRow>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
