'use client'

import type { Vehicle, Route, Driver } from '@/types/schedule.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { VehicleTypeBadge } from '@/components/badge/VehicleTypeBadge'
import { DetailRow } from '@/components/ui/detail-row'
import { Bus, MapPin, User, Phone, CreditCard } from 'lucide-react'

interface TripVehicleInfoProps {
  vehicle: Vehicle
  driver: Driver
  route: Route
  className?: string
}

/**
 * TripVehicleInfo Component
 * Displays comprehensive vehicle, driver, and route information
 */
export function TripVehicleInfo({ vehicle, driver, route, className }: TripVehicleInfoProps) {
  return (
    <div className={className}>
      {/* Route Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <RouteDisplay
              origin={route.origin}
              destination={route.destination}
              routeCode={route.routeCode}
              size="lg"
            />
          </div>

          {route.distance && (
            <DetailRow label="Distance">
              {route.distance} km
            </DetailRow>
          )}

          {route.estimatedDuration && (
            <DetailRow label="Estimated Duration">
              {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
            </DetailRow>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Vehicle Number">
            {vehicle.vehicleNumber}
          </DetailRow>

          <DetailRow label="Type">
            <VehicleTypeBadge type={vehicle.type} />
          </DetailRow>

          {vehicle.brand && vehicle.model && (
            <DetailRow label="Brand & Model">
              {vehicle.brand} {vehicle.model}
            </DetailRow>
          )}

          <DetailRow label="Capacity">
            {vehicle.capacity} passengers
          </DetailRow>
        </CardContent>
      </Card>

      {/* Driver Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Driver Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Name">
            {driver.name}
          </DetailRow>

          <DetailRow label="Phone">
            <a href={`tel:${driver.phone}`} className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" />
              {driver.phone}
            </a>
          </DetailRow>

          {driver.licenseNumber && (
            <DetailRow label="License Number">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {driver.licenseNumber}
              </span>
            </DetailRow>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
