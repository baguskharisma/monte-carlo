'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/stores/auth.store'
import { useDriverTrips } from '@/hooks/useDriverTrips'
import type { TripViewType } from '@/types/driver-trip.types'
import { TripCard } from '@/components/driver/TripCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { DataTablePagination } from '@/components/data-table/DataTablePagination'
import { Route, MapPin, CheckCircle } from 'lucide-react'

export default function DriverTripsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useUser()

  const [page, setPage] = useState(1)
  const activeTab = (searchParams.get('tab') as TripViewType) || 'upcoming'

  // Determine status filter based on active tab
  const getStatusFilter = (tab: TripViewType) => {
    switch (tab) {
      case 'upcoming':
        return 'SCHEDULED'
      case 'in_progress':
        return 'DEPARTED'
      case 'completed':
        return 'ARRIVED'
      default:
        return 'SCHEDULED'
    }
  }

  const status = getStatusFilter(activeTab)
  const driverId = user?.id

  // Fetch trips
  const { data, isLoading, error } = useDriverTrips(
    {
      driverId: driverId || '',
      status,
      page,
      limit: 12,
    },
    {
      enabled: !!driverId && user?.role === 'DRIVER',
    }
  )

  // Handle tab change
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    setPage(1) // Reset to first page on tab change
    router.push(`/driver/trips?${params.toString()}`)
  }

  // Handle view trip details
  const handleViewTrip = (scheduleId: string) => {
    router.push(`/driver/trips/${scheduleId}`)
  }

  // Access denied state
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
        <p className="text-muted-foreground">
          View and manage your assigned trips across different stages
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="upcoming" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-2">
            <Route className="h-4 w-4" />
            <span className="hidden sm:inline">In Progress</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Completed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Loading State */}
          {isLoading && <LoadingState message="Loading trips..." />}

          {/* Error State */}
          {error && (
            <ErrorState
              title="Failed to load trips"
              description="There was an error loading your trips. Please try again."
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && data?.data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {activeTab === 'upcoming' && (
                <>
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Upcoming Trips</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any trips scheduled yet.
                  </p>
                </>
              )}
              {activeTab === 'in_progress' && (
                <>
                  <Route className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Trips In Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any trips currently in progress.
                  </p>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Completed Trips</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't completed any trips yet.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Trip Grid */}
          {!isLoading && !error && data && data.data.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onView={handleViewTrip} />
                ))}
              </div>

              {/* Pagination */}
              {data.meta && data.meta.totalPages > 1 && (
                <div className="mt-6">
                  <DataTablePagination
                    page={data.meta.page}
                    limit={data.meta.limit}
                    total={data.meta.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
