/**
 * TravelDocumentStatusBadge Component
 * Display travel document status (DRAFT, ISSUED, CANCELLED)
 */

"use client"

import { FileEdit, CheckCircle, XCircle } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { TravelDocumentStatus } from "@/types/travel-document.types"
import type { BadgeSize } from "@/types/components.types"

const travelDocumentStatusVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
  {
    variants: {
      status: {
        DRAFT:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800",
        ISSUED:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        CANCELLED:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
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

interface TravelDocumentStatusBadgeProps {
  /** Travel document status */
  status: TravelDocumentStatus
  /** Badge size */
  size?: BadgeSize
  /** Show icon before text */
  showIcon?: boolean
  /** Additional CSS classes */
  className?: string
}

// Status labels
const STATUS_LABELS: Record<TravelDocumentStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  CANCELLED: "Cancelled",
}

// Status icons
const STATUS_ICONS: Record<TravelDocumentStatus, typeof FileEdit> = {
  DRAFT: FileEdit,
  ISSUED: CheckCircle,
  CANCELLED: XCircle,
}

/**
 * TravelDocumentStatusBadge - Displays travel document status
 *
 * @example
 * ```tsx
 * <TravelDocumentStatusBadge status="DRAFT" showIcon />
 * <TravelDocumentStatusBadge status="ISSUED" size="sm" />
 * <TravelDocumentStatusBadge status="CANCELLED" size="lg" showIcon />
 * ```
 */
export function TravelDocumentStatusBadge({
  status,
  size = "md",
  showIcon = false,
  className,
}: TravelDocumentStatusBadgeProps) {
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
      data-slot="travel-document-status-badge"
      data-status={status}
      className={cn(travelDocumentStatusVariants({ status, size }), className)}
    >
      {showIcon && Icon && <Icon size={iconSize} className="flex-shrink-0" />}
      {label}
    </span>
  )
}
