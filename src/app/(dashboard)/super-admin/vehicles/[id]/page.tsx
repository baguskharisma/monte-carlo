/**
 * Vehicle Detail Page (SUPER_ADMIN)
 * View detailed vehicle information
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { DetailRow } from '@/components/ui/DetailRow'
import { VehicleTypeBadge } from '@/components/badge/VehicleTypeBadge'
import { VehicleStatusBadge } from '@/components/badge/VehicleStatusBadge'
import { FormatDate } from '@/components/format/FormatDate'
import { useVehicle } from '@/hooks/useVehicles'
import { ArrowLeft, Car, Info, Users } from 'lucide-react'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  // Queries
  const { data: vehicleData, isLoading, error } = useVehicle(vehicleId)

  // Debug logging
  console.log('Vehicle ID:', vehicleId)
  console.log('Vehicle Data:', vehicleData)
  console.log('Is Loading:', isLoading)
  console.log('Error:', error)

  if (isLoading) {
    return <LoadingState message="Loading vehicle details..." />
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load vehicle details"
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!vehicleData) {
    return (
      <ErrorState
        message="No data received from server"
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Handle different response structures
  // API might return data directly or nested in data property
  const vehicle = vehicleData.data || vehicleData

  // Check if vehicle data exists
  if (!vehicle || typeof vehicle !== 'object') {
    console.error('Invalid vehicle data structure:', vehicle)
    return (
      <ErrorState
        message="Vehicle data not found"
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Details</h1>
          <p className="text-muted-foreground">
            View detailed vehicle information
          </p>
        </div>
      </div>

      {/* Vehicle Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            label="Vehicle Number"
            value={<span className="font-mono font-medium">{vehicle.vehicleNumber}</span>}
          />
          <DetailRow
            label="Type"
            value={<VehicleTypeBadge type={vehicle.type} />}
          />
          <DetailRow
            label="Brand"
            value={<span className="font-medium">{vehicle.brand}</span>}
          />
          <DetailRow
            label="Model"
            value={<span className="font-medium">{vehicle.model}</span>}
          />
          <DetailRow
            label="Status"
            value={<VehicleStatusBadge status={vehicle.status} />}
          />
        </CardContent>
      </Card>

      {/* Capacity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seating Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {vehicle.capacity} <span className="text-2xl text-muted-foreground">seats</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total passenger capacity
          </p>
        </CardContent>
      </Card>

      {/* Vehicle Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Additional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            label="Full Name"
            value={
              <span className="font-medium">
                {vehicle.brand} {vehicle.model}
              </span>
            }
          />
          <DetailRow
            label="License Plate"
            value={<span className="font-mono">{vehicle.vehicleNumber}</span>}
          />
          <DetailRow
            label="Class"
            value={
              <span>
                {vehicle.type === 'EKSEKUTIF' ? 'Executive / Premium Class' : 'Regular Class'}
              </span>
            }
          />
        </CardContent>
      </Card>

      {/* Status Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Status Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            label="Current Status"
            value={<VehicleStatusBadge status={vehicle.status} />}
          />
          <DetailRow
            label="Status Description"
            value={
              <span className="text-sm text-muted-foreground">
                {vehicle.status === 'AVAILABLE' && 'Vehicle is available for scheduling'}
                {vehicle.status === 'IN_USE' && 'Vehicle is currently assigned to a trip'}
                {vehicle.status === 'MAINTENANCE' && 'Vehicle is under maintenance'}
                {vehicle.status === 'RETIRED' && 'Vehicle has been retired from service'}
              </span>
            }
          />
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            label="Created At"
            value={<FormatDate date={vehicle.createdAt} format="display-with-time" />}
          />
          <DetailRow
            label="Last Updated"
            value={<FormatDate date={vehicle.updatedAt} format="display-with-time" />}
          />
          <DetailRow
            label="Vehicle ID"
            value={<span className="font-mono text-sm">{vehicle.id}</span>}
          />
        </CardContent>
      </Card>
    </div>
  )
}
