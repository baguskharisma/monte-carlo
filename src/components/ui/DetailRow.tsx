/**
 * DetailRow Component
 * Label-value row for detail pages
 */

"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DetailRowProps {
  /** Label text */
  label: string
  /** Value to display (string, number, or React component) */
  value: ReactNode
  /** Layout variant */
  variant?: "horizontal" | "vertical"
  /** Show border bottom */
  bordered?: boolean
  /** Additional CSS classes */
  className?: string
  /** Label CSS classes */
  labelClassName?: string
  /** Value CSS classes */
  valueClassName?: string
}

/**
 * DetailRow - Label-value row for displaying details
 *
 * @example
 * ```tsx
 * <DetailRow label="Name" value="John Doe" />
 * <DetailRow label="Email" value="john@example.com" variant="vertical" />
 * <DetailRow
 *   label="Status"
 *   value={<StatusBadge status="ACTIVE" />}
 * />
 * ```
 */
export function DetailRow({
  label,
  value,
  variant = "horizontal",
  bordered = true,
  className,
  labelClassName,
  valueClassName,
}: DetailRowProps) {
  const isHorizontal = variant === "horizontal"

  return (
    <div
      data-slot="detail-row"
      className={cn(
        "py-3",
        bordered && "border-b last:border-0",
        isHorizontal && "flex items-start justify-between gap-4",
        !isHorizontal && "space-y-1",
        className
      )}
    >
      <dt
        className={cn(
          "text-sm font-medium text-muted-foreground",
          isHorizontal && "min-w-[120px] flex-shrink-0",
          labelClassName
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm text-foreground",
          isHorizontal && "flex-1 text-right",
          valueClassName
        )}
      >
        {value || "-"}
      </dd>
    </div>
  )
}

/**
 * DetailList - Container for multiple DetailRow components
 *
 * @example
 * ```tsx
 * <DetailList>
 *   <DetailRow label="Name" value="John Doe" />
 *   <DetailRow label="Email" value="john@example.com" />
 *   <DetailRow label="Status" value={<StatusBadge status="ACTIVE" />} />
 * </DetailList>
 * ```
 */
export function DetailList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <dl data-slot="detail-list" className={cn("divide-y", className)}>
      {children}
    </dl>
  )
}
