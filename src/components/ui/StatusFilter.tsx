/**
 * StatusFilter Component
 * Status filter dropdown with predefined options
 */

"use client"

import { Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface StatusOption {
  /** Display label */
  label: string
  /** Status value */
  value: string
}

interface StatusFilterProps {
  /** Current selected status */
  value: string
  /** Callback when status changes */
  onChange: (value: string) => void
  /** Available status options */
  options: StatusOption[]
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Show filter icon */
  showIcon?: boolean
  /** Show label */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * StatusFilter - Dropdown filter for status selection
 *
 * @example
 * ```tsx
 * <StatusFilter
 *   value={statusFilter}
 *   onChange={setStatusFilter}
 *   options={[
 *     { label: 'All Status', value: '' },
 *     { label: 'Active', value: 'ACTIVE' },
 *     { label: 'Inactive', value: 'INACTIVE' },
 *     { label: 'Suspended', value: 'SUSPENDED' },
 *   ]}
 * />
 * ```
 */
export function StatusFilter({
  value,
  onChange,
  options,
  label = "Status",
  placeholder = "Select status",
  showIcon = true,
  showLabel = true,
  className,
}: StatusFilterProps) {
  return (
    <div data-slot="status-filter" className={cn("space-y-2", className)}>
      {showLabel && (
        <Label htmlFor="status-filter" className="text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative">
        {showIcon && (
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
        )}

        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id="status-filter"
            className={cn(showIcon && "pl-9")}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/**
 * MultiStatusFilter - Multiple status selection filter
 *
 * @example
 * ```tsx
 * <MultiStatusFilter
 *   values={selectedStatuses}
 *   onChange={setSelectedStatuses}
 *   options={[
 *     { label: 'Active', value: 'ACTIVE' },
 *     { label: 'Inactive', value: 'INACTIVE' },
 *   ]}
 * />
 * ```
 */
export function MultiStatusFilter({
  values,
  onChange,
  options,
  label = "Status",
  showLabel = true,
  className,
}: {
  values: string[]
  onChange: (values: string[]) => void
  options: StatusOption[]
  label?: string
  showLabel?: boolean
  className?: string
}) {
  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div data-slot="multi-status-filter" className={cn("space-y-2", className)}>
      {showLabel && (
        <Label className="text-sm font-medium">{label}</Label>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
        {options.map((option) => {
          const isChecked = values.includes(option.value)

          return (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-accent px-2 py-1.5 rounded-sm"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          )
        })}
      </div>

      {/* Selected count */}
      {values.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {values.length} selected
        </p>
      )}
    </div>
  )
}
