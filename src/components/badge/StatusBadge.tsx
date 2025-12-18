/**
 * StatusBadge Component
 * Generic status badge that can be used for any status type
 */

"use client"

import { type ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { getFriendlyLabel } from "@/lib/format.utils"
import type { BadgeSize } from "@/types/components.types"

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
        secondary:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
        success:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        warning:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800",
        destructive:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
        info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
      },
      size: {
        sm: "text-xs h-5 gap-1 px-2",
        md: "text-sm h-6 gap-1.5 px-2.5",
        lg: "text-base h-7 gap-2 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  /** Status value to display */
  status: string
  /** Optional icon to display before text */
  icon?: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * StatusBadge - Generic status badge with color variants
 *
 * @example
 * ```tsx
 * <StatusBadge status="ACTIVE" variant="success" />
 * <StatusBadge status="PENDING" variant="warning" icon={<Clock />} />
 * <StatusBadge status="CANCELLED" variant="destructive" size="lg" />
 * ```
 */
export function StatusBadge({
  status,
  variant = "default",
  size = "md",
  icon,
  className,
}: StatusBadgeProps) {
  const label = getFriendlyLabel(status)

  // Icon size based on badge size
  const iconClassName = cn({
    "h-3 w-3": size === "sm",
    "h-3.5 w-3.5": size === "md",
    "h-4 w-4": size === "lg",
  })

  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(statusBadgeVariants({ variant, size }), className)}
    >
      {icon && <span className={iconClassName}>{icon}</span>}
      {label}
    </span>
  )
}
