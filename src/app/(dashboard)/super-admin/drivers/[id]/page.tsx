/**
 * Driver Detail Page (SUPER_ADMIN)
 * View detailed information about a specific driver
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useDriver } from '@/hooks/useDrivers'
import { ArrowLeft, Mail, Phone, CreditCard, MapPin, Calendar, User } from 'lucide-react'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { DriverStatusBadge } from '@/components/badge/DriverStatusBadge'
import { FormatPhone } from '@/components/format/FormatPhone'
import { format } from 'date-fns'

export default function DriverDetailPage() {
  const params = useParams()
  const router = useRouter()
  const driverId = params.id as string

  const { data: response, isLoading, error, refetch } = useDriver(driverId)

  if (isLoading) {
    return <LoadingState message="Loading driver details..." />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin/drivers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Driver Details</h1>
        </div>
        <ErrorState
          message="Failed to load driver details"
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (!response?.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin/drivers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Driver Details</h1>
        </div>
        <ErrorState
          message="Driver not found"
          onRetry={() => router.push('/super-admin/drivers')}
        />
      </div>
    )
  }

  const driver = response.data

  // Handle both nested and flat structures
  // Based on Prisma schema:
  // - Driver model has: name, phone, licenseNumber, address, birthDate, gender, status (DriverStatus)
  // - User model has: phone, email, status (UserStatus), birthDate, gender
  const name = (driver as any).name || driver.profile?.name || 'N/A'
  const email = (driver as any).user?.email || driver.email || 'N/A'
  const phone = (driver as any).phone || (driver as any).user?.phone || 'N/A'
  const licenseNumber = (driver as any).licenseNumber || driver.profile?.licenseNumber || 'N/A'
  const address = (driver as any).address || driver.profile?.address || 'N/A'
  const birthDate = (driver as any).birthDate || driver.profile?.birthDate
  const gender = (driver as any).gender || driver.profile?.gender
  // IMPORTANT: Based on Prisma schema
  // - driver.status = DriverStatus (AVAILABLE/ON_TRIP/OFF_DUTY) - Operational
  // - driver.user.status = UserStatus (ACTIVE/INACTIVE/SUSPENDED) - Account
  const accountStatus = (driver as any).user?.status || 'INACTIVE'
  const operationalStatus = (driver as any).status || driver.status || 'OFF_DUTY'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin/drivers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <p className="text-muted-foreground">Driver Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={accountStatus}
            variant={accountStatus === 'ACTIVE' ? 'success' : 'secondary'}
          />
          <DriverStatusBadge status={operationalStatus} />
        </div>
      </div>

      {/* Main Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <FormatPhone phone={phone} />
              </div>
            </div>

            {address && address !== 'N/A' && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* License & Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>License & Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="font-medium font-mono">{licenseNumber}</p>
              </div>
            </div>

            {birthDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Birth Date</p>
                  <p className="font-medium">
                    {format(new Date(birthDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {gender && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{gender === 'MALE' ? 'Male' : 'Female'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Status Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Account Status</p>
              <StatusBadge
                status={accountStatus}
                variant={accountStatus === 'ACTIVE' ? 'success' : 'secondary'}
              />
              <p className="text-xs text-muted-foreground">
                Controls login access to the system
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Operational Status</p>
              <DriverStatusBadge status={operationalStatus} />
              <p className="text-xs text-muted-foreground">
                Current availability for trip assignments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/super-admin/drivers')}>
          Back to List
        </Button>
      </div>
    </div>
  )
}
