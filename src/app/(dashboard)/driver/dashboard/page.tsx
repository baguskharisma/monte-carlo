/**
 * Driver Dashboard Page
 * Displays driver statistics, current trip, and upcoming trips
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/stores/auth.store'
import { useDriverTrips } from '@/hooks/useDriverTrips'
import { StatCard } from '@/components/ui/StatCard'
import { TripCard } from '@/components/driver/TripCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { Calendar, CheckCircle, Users, Route, ArrowRight, MapPin } from 'lucide-react'
import { format, startOfDay, endOfDay } from 'date-fns'

/**
 * DriverDashboardPage - Main dashboard for DRIVER role
 */
export default function DriverDashboardPage() {
  const router = useRouter()
  const user = useUser()
  const driverId = user?.id

  // Calculate today's date range
  const today = useMemo(() => ({
    start: format(startOfDay(new Date()), 'yyyy-MM-dd'),
    end: format(endOfDay(new Date()), 'yyyy-MM-dd'),
  }), [])

  // Query 1: Today's trips (all statuses)
  const { data: todayTrips, isLoading: todayLoading } = useDriverTrips(
    {
      driverId: driverId || '',
      dateFrom: today.start,
      dateTo: today.end,
      limit: 50,
    },
    { enabled: !!driverId && user?.role === 'DRIVER' }
  )

  // Query 2: Current/Active trip (DEPARTED status)
  const { data: currentTripData, isLoading: currentLoading } = useDriverTrips(
    {
      driverId: driverId || '',
      status: 'DEPARTED',
      limit: 1,
    },
    { enabled: !!driverId && user?.role === 'DRIVER' }
  )

  // Query 3: Upcoming trips (SCHEDULED status)
  const { data: upcomingTrips, isLoading: upcomingLoading } = useDriverTrips(
    {
      driverId: driverId || '',
      status: 'SCHEDULED',
      limit: 6,
    },
    { enabled: !!driverId && user?.role === 'DRIVER' }
  )

  // Query 4: Completed trips count
  const { data: completedStats, isLoading: completedLoading } = useDriverTrips(
    {
      driverId: driverId || '',
      status: 'ARRIVED',
      limit: 1,
    },
    { enabled: !!driverId && user?.role === 'DRIVER' }
  )

  // Query 5: Recent completed trips for passenger calculation
  const { data: recentCompleted, isLoading: passengersLoading } = useDriverTrips(
    {
      driverId: driverId || '',
      status: 'ARRIVED',
      limit: 10,
    },
    { enabled: !!driverId && user?.role === 'DRIVER' }
  )

  // Filter today's trips to only show trips with today's departure date
  const todaySchedule = useMemo(() => {
    if (!todayTrips?.data) return []

    const currentDate = format(new Date(), 'yyyy-MM-dd')

    return todayTrips.data.filter((trip) => {
      const tripDate = format(new Date(trip.departureTime), 'yyyy-MM-dd')
      return tripDate === currentDate
    })
  }, [todayTrips])

  // Calculate statistics
  const stats = useMemo(() => {
    const todayCount = todaySchedule.length
    const completedCount = completedStats?.meta?.total || 0

    // Calculate total passengers from recent completed trips
    const totalPassengers =
      recentCompleted?.data?.reduce((sum, trip) => {
        const bookedSeats = trip.vehicle?.capacity
          ? trip.vehicle.capacity - trip.availableSeats
          : 0
        return sum + bookedSeats
      }, 0) || 0

    return {
      todayTrips: todayCount,
      completedTrips: completedCount,
      totalPassengers,
    }
  }, [todaySchedule, completedStats, recentCompleted])

  // Get current trip (first DEPARTED trip)
  const currentTrip = currentTripData?.data?.[0] || null

  // Handle view trip
  const handleViewTrip = (scheduleId: string) => {
    router.push(`/driver/trips/${scheduleId}`)
  }

  // Access control
  if (!driverId || user?.role !== 'DRIVER') {
    return (
      <ErrorState
        title="Access Denied"
        description="You must be logged in as a driver to view this page."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Monte Carlo Driver dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Trips"
          value={stats.todayTrips}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
          loading={todayLoading}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title="Completed Trips"
          value={stats.completedTrips}
          icon={<CheckCircle className="h-4 w-4" />}
          description="All time total"
          loading={completedLoading}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title="Total Passengers"
          value={stats.totalPassengers}
          icon={<Users className="h-4 w-4" />}
          description="Last 10 trips"
          loading={passengersLoading}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
      </div>

      {/* Current Trip Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Current Trip</CardTitle>
            </div>
            {currentTrip && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/driver/trips/${currentTrip.id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentLoading && <LoadingState message="Loading current trip..." />}

          {!currentLoading && !currentTrip && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Route className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Active Trip</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any trip in progress at the moment
              </p>
            </div>
          )}

          {!currentLoading && currentTrip && (
            <div className="space-y-4">
              <TripCard trip={currentTrip} onView={handleViewTrip} />
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/driver/trips/${currentTrip.id}/passengers`)
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Check Passengers
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/driver/trips/${currentTrip.id}`)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Schedule Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Today's Schedule</CardTitle>
            </div>
            {todaySchedule.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {todaySchedule.length} {todaySchedule.length === 1 ? 'trip' : 'trips'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {todayLoading && <LoadingState message="Loading today's schedule..." />}

          {!todayLoading && todaySchedule.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Trips Today</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any trips scheduled for today
              </p>
            </div>
          )}

          {!todayLoading && todaySchedule.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todaySchedule.map((trip) => (
                <TripCard key={trip.id} trip={trip} onView={handleViewTrip} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Trips Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Upcoming Trips</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/driver/trips?tab=upcoming">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingLoading && <LoadingState message="Loading upcoming trips..." />}

          {!upcomingLoading &&
            (!upcomingTrips?.data || upcomingTrips.data.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Upcoming Trips</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any trips scheduled yet
                </p>
              </div>
            )}

          {!upcomingLoading &&
            upcomingTrips?.data &&
            upcomingTrips.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTrips.data.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onView={handleViewTrip} />
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
