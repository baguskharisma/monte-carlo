/**
 * PaymentProofStatusBadge Component
 * Display payment proof status (PENDING, APPROVED, REJECTED)
 */

"use client"

import { Clock, CheckCircle, XCircle } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { PAYMENT_PROOF_STATUS, type PaymentProofStatus } from "@/lib/constants"
import type { BadgeSize } from "@/types/components.types"

const paymentProofStatusVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
  {
    variants: {
      status: {
        PENDING:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800",
        APPROVED:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        REJECTED:
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

interface PaymentProofStatusBadgeProps {
  /** Payment proof status */
  status: PaymentProofStatus
  /** Badge size */
  size?: BadgeSize
  /** Show icon before text */
  showIcon?: boolean
  /** Additional CSS classes */
  className?: string
}

// Status labels
const STATUS_LABELS: Record<PaymentProofStatus, string> = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

// Status icons
const STATUS_ICONS: Record<PaymentProofStatus, typeof Clock> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
}

/**
 * PaymentProofStatusBadge - Displays payment proof status
 *
 * @example
 * ```tsx
 * <PaymentProofStatusBadge status="PENDING" showIcon />
 * <PaymentProofStatusBadge status="APPROVED" size="sm" />
 * <PaymentProofStatusBadge status="REJECTED" size="lg" showIcon />
 * ```
 */
export function PaymentProofStatusBadge({
  status,
  size = "md",
  showIcon = false,
  className,
}: PaymentProofStatusBadgeProps) {
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
      data-slot="payment-proof-status-badge"
      data-status={status}
      className={cn(paymentProofStatusVariants({ status, size }), className)}
    >
      {showIcon && Icon && <Icon size={iconSize} className="flex-shrink-0" />}
      {label}
    </span>
  )
}
