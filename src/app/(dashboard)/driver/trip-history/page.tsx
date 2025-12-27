'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/stores/auth.store'
import { useDriverTrips } from '@/hooks/useDriverTrips'
import { TripCard } from '@/components/driver/TripCard'
import { TripFilterBar } from '@/components/driver/TripFilterBar'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { DataTablePagination } from '@/components/data-table/DataTablePagination'
import { History, CheckCircle } from 'lucide-react'
import { subDays, format } from 'date-fns'
import type { DateRange } from '@/types/driver-trip.types'

export default function TripHistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useUser()

  // Get filter values from URL
  const dateFromParam = searchParams.get('dateFrom')
  const dateToParam = searchParams.get('dateTo')
  const searchParam = searchParams.get('search') || ''
  const pageParam = parseInt(searchParams.get('page') || '1')

  // Default date range: Last 30 days
  const getDefaultDateRange = (): DateRange => ({
    from: dateFromParam ? new Date(dateFromParam) : subDays(new Date(), 30),
    to: dateToParam ? new Date(dateToParam) : new Date(),
  })

  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange())
  const [search, setSearch] = useState(searchParam)
  const [page, setPage] = useState(pageParam)

  const driverId = user?.id

  // Fetch completed trips
  const { data, isLoading, error } = useDriverTrips(
    {
      driverId: driverId || '',
      status: 'ARRIVED',
      dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      page,
      limit: 12,
    },
    {
      enabled: !!driverId && user?.role === 'DRIVER',
    }
  )

  // Update URL params
  const updateUrlParams = useCallback(
    (updates: { dateFrom?: string | null; dateTo?: string | null; search?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams)

      if (updates.dateFrom) params.set('dateFrom', updates.dateFrom)
      else if (updates.dateFrom === null) params.delete('dateFrom')

      if (updates.dateTo) params.set('dateTo', updates.dateTo)
      else if (updates.dateTo === null) params.delete('dateTo')

      if (updates.search) params.set('search', updates.search)
      else if (updates.search === '') params.delete('search')

      if (updates.page) params.set('page', String(updates.page))
      else if (updates.page === 1) params.delete('page')

      router.push(`/driver/trip-history?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    setPage(1)
    updateUrlParams({
      dateFrom: range.from ? format(range.from, 'yyyy-MM-dd') : null,
      dateTo: range.to ? format(range.to, 'yyyy-MM-dd') : null,
      page: 1,
    })
  }

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    updateUrlParams({
      search: value,
      page: 1,
    })
  }

  // Handle clear filters
  const handleClearFilters = () => {
    const defaultRange = {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
    setDateRange(defaultRange)
    setSearch('')
    setPage(1)
    router.push('/driver/trip-history')
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateUrlParams({ page: newPage })
  }

  // Handle view trip
  const handleViewTrip = (scheduleId: string) => {
    router.push(`/driver/trip-history/${scheduleId}`)
  }

  // Filter trips by search term (client-side)
  const filteredTrips =
    data?.data.filter((trip) => {
      if (!search) return true

      const searchLower = search.toLowerCase()
      const route = trip.route
      const vehicle = trip.vehicle

      return (
        route?.routeCode.toLowerCase().includes(searchLower) ||
        route?.origin.toLowerCase().includes(searchLower) ||
        route?.destination.toLowerCase().includes(searchLower) ||
        vehicle?.vehicleNumber.toLowerCase().includes(searchLower)
      )
    }) || []

  // Access denied state
  if (!driverId || user?.role !== 'DRIVER') {
    return (
      <ErrorState
        title="Akses Ditolak"
        description="Anda harus login sebagai driver untuk melihat halaman ini."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Perjalanan</h1>
          <p className="text-muted-foreground">Lihat semua perjalanan yang telah selesai</p>
        </div>
      </div>

      {/* Filters */}
      <TripFilterBar
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* Loading State */}
      {isLoading && <LoadingState message="Memuat riwayat perjalanan..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Gagal Memuat Data"
          description="Terjadi kesalahan saat memuat riwayat perjalanan. Silakan coba lagi."
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTrips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="text-lg font-medium">Tidak Ada Riwayat Perjalanan</h3>
          <p className="text-sm text-muted-foreground">
            {search || (dateRange.from && dateRange.to)
              ? 'Tidak ada perjalanan yang sesuai dengan filter yang dipilih.'
              : 'Anda belum menyelesaikan perjalanan apapun.'}
          </p>
        </div>
      )}

      {/* Trip Grid */}
      {!isLoading && !error && filteredTrips.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onView={handleViewTrip} />
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-6">
              <DataTablePagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
