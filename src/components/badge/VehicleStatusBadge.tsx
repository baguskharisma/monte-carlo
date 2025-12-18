/**
 * VehicleStatusBadge Component
 * Display vehicle status (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)
 */

"use client"

import { CheckCircle, Truck, Wrench, Archive } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { VEHICLE_STATUS, type VehicleStatus } from "@/lib/constants"
import type { BadgeSize } from "@/types/components.types"

const vehicleStatusVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
  {
    variants: {
      status: {
        AVAILABLE:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        IN_USE:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
        MAINTENANCE:
          "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
        RETIRED:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
      },
      size: {
        sm: "text-xs h-5 gap-1 px-2",
        md: "text-sm h-6 gap-1.5 px-2.5",
        lg: "text-base h-7 gap-2 px-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface VehicleStatusBadgeProps {
  /** Vehicle status */
  status: VehicleStatus
  /** Badge size */
  size?: BadgeSize
  /** Show icon before text */
  showIcon?: boolean
  /** Additional CSS classes */
  className?: string
}

// Status labels
const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Available",
  IN_USE: "In Use",
  MAINTENANCE: "Maintenance",
  RETIRED: "Retired",
}

// Status icons
const STATUS_ICONS: Record<VehicleStatus, typeof CheckCircle> = {
  AVAILABLE: CheckCircle,
  IN_USE: Truck,
  MAINTENANCE: Wrench,
  RETIRED: Archive,
}

/**
 * VehicleStatusBadge - Displays vehicle status
 *
 * @example
 * ```tsx
 * <VehicleStatusBadge status="AVAILABLE" showIcon />
 * <VehicleStatusBadge status="IN_USE" size="sm" />
 * <VehicleStatusBadge status="MAINTENANCE" size="lg" showIcon />
 * <VehicleStatusBadge status="RETIRED" />
 * ```
 */
export function VehicleStatusBadge({
  status,
  size = "md",
  showIcon = false,
  className,
}: VehicleStatusBadgeProps) {
  const label = STATUS_LABELS[status] || status
  const Icon = STATUS_ICONS[status]

  // Icon size based on badge size
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size]

  return (
    <span
      data-slot="vehicle-status-badge"
      data-status={status}
      className={cn(vehicleStatusVariants({ status, size }), className)}
    >
      {showIcon && Icon && <Icon size={iconSize} className="flex-shrink-0" />}
      {label}
    </span>
  )
}
