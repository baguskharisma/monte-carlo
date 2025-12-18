/**
 * DataTableFilters Component
 * Flexible filter component for DataTable
 */

"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Filter } from "@/types/components.types"

interface DataTableFiltersProps {
  /** Array of filter definitions */
  filters: Filter[]
  /** Callback when reset button is clicked */
  onReset?: () => void
  /** Show reset button */
  showReset?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * DataTableFilters - Flexible filter component with multiple input types
 *
 * @example
 * ```tsx
 * <DataTableFilters
 *   filters={[
 *     {
 *       id: 'search',
 *       label: 'Search',
 *       type: 'text',
 *       placeholder: 'Search by name...',
 *       value: searchTerm,
 *       onChange: setSearchTerm,
 *     },
 *     {
 *       id: 'status',
 *       label: 'Status',
 *       type: 'select',
 *       options: [
 *         { label: 'All', value: '' },
 *         { label: 'Active', value: 'ACTIVE' },
 *         { label: 'Inactive', value: 'INACTIVE' },
 *       ],
 *       value: statusFilter,
 *       onChange: setStatusFilter,
 *     },
 *   ]}
 *   onReset={() => {
 *     setSearchTerm('')
 *     setStatusFilter('')
 *   }}
 * />
 * ```
 */
export function DataTableFilters({
  filters,
  onReset,
  showReset = true,
  className,
}: DataTableFiltersProps) {
  return (
    <div
      data-slot="data-table-filters"
      className={cn("space-y-4", className)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filters.map((filter) => (
          <FilterInput key={filter.id} filter={filter} />
        ))}

        {/* Reset button */}
        {showReset && onReset && (
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full md:w-auto"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Individual filter input component
 */
function FilterInput({ filter }: { filter: Filter }) {
  // For text inputs, use debounced value
  const [debouncedValue, setDebouncedValue] = useState(filter.value || "")

  // Debounce text input changes (300ms)
  useEffect(() => {
    if (filter.type === "text") {
      const timer = setTimeout(() => {
        if (debouncedValue !== filter.value) {
          filter.onChange(debouncedValue)
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [debouncedValue, filter])

  // Sync external value changes
  useEffect(() => {
    if (filter.type === "text" && filter.value !== debouncedValue) {
      setDebouncedValue(filter.value || "")
    }
  }, [filter.value, filter.type])

  return (
    <div className="space-y-2">
      <Label htmlFor={filter.id} className="text-sm font-medium">
        {filter.label}
      </Label>

      {/* Text Input */}
      {filter.type === "text" && (
        <div className="relative">
          <Input
            id={filter.id}
            placeholder={filter.placeholder}
            value={debouncedValue}
            onChange={(e) => setDebouncedValue(e.target.value)}
            className="pr-8"
          />
          {debouncedValue && (
            <button
              type="button"
              onClick={() => {
                setDebouncedValue("")
                filter.onChange("")
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear filter"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Select Input */}
      {filter.type === "select" && filter.options && (
        <Select
          value={filter.value || ""}
          onValueChange={(value) => filter.onChange(value)}
        >
          <SelectTrigger id={filter.id}>
            <SelectValue placeholder={filter.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Date Range Input */}
      {filter.type === "date-range" && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            placeholder="From"
            value={filter.value?.from || ""}
            onChange={(e) =>
              filter.onChange({
                ...filter.value,
                from: e.target.value,
              })
            }
          />
          <Input
            type="date"
            placeholder="To"
            value={filter.value?.to || ""}
            onChange={(e) =>
              filter.onChange({
                ...filter.value,
                to: e.target.value,
              })
            }
          />
        </div>
      )}

      {/* Multi-Select Input (simplified version - checkbox list) */}
      {filter.type === "multi-select" && filter.options && (
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
          {filter.options.map((option) => {
            const isChecked = Array.isArray(filter.value)
              ? filter.value.includes(option.value)
              : false

            return (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent px-2 py-1 rounded-sm"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const currentValues = Array.isArray(filter.value)
                      ? filter.value
                      : []

                    if (e.target.checked) {
                      filter.onChange([...currentValues, option.value])
                    } else {
                      filter.onChange(
                        currentValues.filter((v) => v !== option.value)
                      )
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
