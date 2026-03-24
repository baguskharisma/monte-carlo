/**
 * DriverStatusBadge Component
 * Display driver status (AVAILABLE, ON_TRIP, OFF_DUTY)
 */

"use client"

import { CheckCircle, Truck, MinusCircle } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { DriverStatus } from "@/types/user.types"
import type { BadgeSize } from "@/types/components.types"

const driverStatusVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
  {
    variants: {
      status: {
        AVAILABLE:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        ON_TRIP:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
        OFF_DUTY:
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

interface DriverStatusBadgeProps {
  /** Driver status */
  status: DriverStatus
  /** Badge size */
  size?: BadgeSize
  /** Show icon before text */
  showIcon?: boolean
  /** Additional CSS classes */
  className?: string
}

// Status labels
const STATUS_LABELS: Record<DriverStatus, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
}

// Status icons
const STATUS_ICONS: Record<DriverStatus, typeof CheckCircle> = {
  AVAILABLE: CheckCircle,
  ON_TRIP: Truck,
  OFF_DUTY: MinusCircle,
}

/**
 * DriverStatusBadge - Displays driver status
 *
 * @example
 * ```tsx
 * <DriverStatusBadge status="AVAILABLE" showIcon />
 * <DriverStatusBadge status="ON_TRIP" size="sm" />
 * <DriverStatusBadge status="OFF_DUTY" size="lg" showIcon />
 * ```
 */
export function DriverStatusBadge({
  status,
  size = "md",
  showIcon = false,
  className,
}: DriverStatusBadgeProps) {
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
      data-slot="driver-status-badge"
      data-status={status}
      className={cn(driverStatusVariants({ status, size }), className)}
    >
      {showIcon && Icon && <Icon size={iconSize} className="flex-shrink-0" />}
      {label}
    </span>
  )
}
