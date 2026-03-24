'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSchedules, useDeleteSchedule } from '@/hooks/useSchedules'
import { ScheduleList } from '@/components/schedule/ScheduleList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Filter, X } from 'lucide-react'
import { Schedule, ScheduleStatus } from '@/types/schedule.types'
import { DataTablePagination } from '@/components/data-table/DataTablePagination'
import { DeleteScheduleModal } from '@/components/modals/DeleteScheduleModal'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SchedulesPage() {
  const router = useRouter()

  // State
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<ScheduleStatus | 'ALL'>('ALL')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)

  // Debounce text inputs to reduce API calls
  const debouncedOrigin = useDebounce(origin, 500)
  const debouncedDestination = useDebounce(destination, 500)

  // Queries & Mutations - use debounced values
  const { data, isLoading, error } = useSchedules({
    page,
    limit: 12,
    status: status === 'ALL' ? undefined : status,
    origin: debouncedOrigin || undefined,
    destination: debouncedDestination || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const deleteMutation = useDeleteSchedule()

  // Debug logging
  useEffect(() => {
    console.log('Schedules Query State:', {
      isLoading,
      hasData: !!data,
      dataLength: data?.data?.length,
      total: data?.meta?.total,
      error: error ? {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      } : null,
      params: {
        page,
        limit: 12,
        status: status === 'ALL' ? undefined : status,
        origin: debouncedOrigin || undefined,
        destination: debouncedDestination || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }
    })
  }, [data, isLoading, error, page, status, debouncedOrigin, debouncedDestination, dateFrom, dateTo])

  // Reset to page 1 when filters change (use debounced values for text inputs)
  useEffect(() => {
    setPage(1)
  }, [status, debouncedOrigin, debouncedDestination, dateFrom, dateTo])

  // Show error message if request fails
  if (error) {
    console.error('Schedule fetch error:', error)
  }

  // Handlers
  const handleView = (schedule: Schedule) => {
    router.push(`/admin/schedules/${schedule.id}`)
  }

  const handleEdit = (schedule: Schedule) => {
    router.push(`/admin/schedules/${schedule.id}/edit`)
  }

  const handleAssignDriver = (schedule: Schedule) => {
    router.push(`/admin/schedules/${schedule.id}/assign-driver`)
  }

  const handleDelete = (schedule: Schedule) => {
    setScheduleToDelete(schedule)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!scheduleToDelete) return
    await deleteMutation.mutateAsync(scheduleToDelete.id)
    setDeleteModalOpen(false)
    setScheduleToDelete(null)
  }

  const handleResetFilters = () => {
    setStatus('ALL')
    setOrigin('')
    setDestination('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = status !== 'ALL' || origin !== '' || destination !== '' || dateFrom !== '' || dateTo !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground">Manage trip schedules and assignments</p>
        </div>
        <Button onClick={() => router.push('/admin/schedules/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8"
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Origin */}
            <Input
              placeholder="Origin city..."
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />

            {/* Destination */}
            <Input
              placeholder="Destination city..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            {/* Status */}
            <Select value={status} onValueChange={(v) => setStatus(v as ScheduleStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="DEPARTED">Departed</SelectItem>
                <SelectItem value="ARRIVED">Arrived</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From date"
            />

            {/* Date To */}
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <ScheduleList
        schedules={data?.data || []}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onAssignDriver={handleAssignDriver}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {data && data.meta && (
        <DataTablePagination
          page={data.meta.page}
          limit={data.meta.limit}
          total={data.meta.total}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            // You can add limit state management here if needed
            console.log('Limit changed to:', newLimit)
          }}
        />
      )}

      {/* Delete Modal */}
      <DeleteScheduleModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        scheduleName={
          scheduleToDelete
            ? `${scheduleToDelete.route?.origin} → ${scheduleToDelete.route?.destination}`
            : ''
        }
      />
    </div>
  )
}
