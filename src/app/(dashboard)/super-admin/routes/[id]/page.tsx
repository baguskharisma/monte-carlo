/**
 * Route Detail Page (SUPER_ADMIN)
 * View detailed route information
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { DetailRow } from '@/components/ui/DetailRow'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { useRoute } from '@/hooks/useRoutes'
import { ArrowLeft, MapPin, ArrowRight, Clock, Ruler, DollarSign } from 'lucide-react'

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string

  // Queries
  const { data: routeData, isLoading, error } = useRoute(routeId)

  // Debug logging
  console.log('Route ID:', routeId)
  console.log('Route Data:', routeData)
  console.log('Is Loading:', isLoading)
  console.log('Error:', error)

  if (isLoading) {
    return <LoadingState message="Loading route details..." />
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load route details"
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!routeData) {
    return (
      <ErrorState
        message="No data received from server"
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Handle different response structures
  // API might return data directly or nested in data property
  const route = routeData.data || routeData

  // Check if route data exists
  if (!route || typeof route !== 'object') {
    console.error('Invalid route data structure:', route)
    return (
      <ErrorState
        message="Route data not found"
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Calculate duration display
  const hours = Math.floor(route.estimatedDuration / 60)
  const minutes = route.estimatedDuration % 60
  const durationDisplay = hours > 0
    ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
    : `${minutes} minutes`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Route Details</h1>
          <p className="text-muted-foreground">
            View detailed route information
          </p>
        </div>
      </div>

      {/* Route Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            label="Route Code"
            value={<span className="font-mono font-medium">{route.routeCode}</span>}
          />
          <DetailRow
            label="Origin"
            value={<span className="font-medium">{route.origin}</span>}
          />
          <DetailRow
            label="Destination"
            value={<span className="font-medium">{route.destination}</span>}
          />
          <DetailRow
            label="Full Route"
            value={
              <div className="flex items-center gap-2">
                <span className="font-medium">{route.origin}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{route.destination}</span>
              </div>
            }
          />
          <DetailRow
            label="Status"
            value={
              <StatusBadge
                status={route.isActive ? 'ACTIVE' : 'INACTIVE'}
                variant={route.isActive ? 'success' : 'secondary'}
              />
            }
          />
        </CardContent>
      </Card>

      {/* Distance & Time Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {route.distance} <span className="text-2xl text-muted-foreground">km</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total travel distance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estimated Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {hours > 0 && (
                <>
                  {hours}<span className="text-2xl text-muted-foreground">h</span>
                  {' '}
                </>
              )}
              {minutes}<span className="text-2xl text-muted-foreground">m</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {durationDisplay}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            <FormatCurrency value={route.basePrice} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Base price for this route
          </p>
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
            value={<FormatDate date={route.createdAt} format="display-with-time" />}
          />
          <DetailRow
            label="Last Updated"
            value={<FormatDate date={route.updatedAt} format="display-with-time" />}
          />
          <DetailRow
            label="Route ID"
            value={<span className="font-mono text-sm">{route.id}</span>}
          />
        </CardContent>
      </Card>
    </div>
  )
}
