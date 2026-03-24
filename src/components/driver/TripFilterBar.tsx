'use client'

import { useState, useEffect } from 'react'
import { DateRangeFilter } from './DateRangeFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import type { DateRange } from '@/types/driver-trip.types'

interface TripFilterBarProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  searchValue: string
  onSearchChange: (value: string) => void
  onClearFilters: () => void
  className?: string
}

export function TripFilterBar({
  dateRange,
  onDateRangeChange,
  searchValue,
  onSearchChange,
  onClearFilters,
  className,
}: TripFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  const hasActiveFilters = dateRange.from || dateRange.to || searchValue

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Date Range Filter */}
        <div className="w-full md:w-[280px]">
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari rute, tujuan, atau kendaraan..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="default" onClick={onClearFilters} className="w-full md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Hapus Filter
          </Button>
        )}
      </div>
    </div>
  )
}
