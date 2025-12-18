/**
 * EmptyState Component
 * Empty state with illustration and optional action button
 */

"use client"

import { type ReactNode } from "react"
import { Inbox, Search, FileQuestion, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateVariant = "default" | "search" | "no-data" | "error"

interface EmptyStateProps {
  /** Title text */
  title?: string
  /** Description text */
  message: string
  /** Variant to determine default icon and styling */
  variant?: EmptyStateVariant
  /** Custom icon (overrides variant icon) */
  icon?: ReactNode
  /** Action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Additional CSS classes */
  className?: string
}

// Default icons for each variant
const VARIANT_ICONS = {
  default: Inbox,
  search: Search,
  "no-data": FileQuestion,
  error: AlertCircle,
}

// Default titles for each variant
const VARIANT_TITLES = {
  default: "No items found",
  search: "No results found",
  "no-data": "No data available",
  error: "Something went wrong",
}

/**
 * EmptyState - Display empty state with icon and message
 *
 * @example
 * ```tsx
 * <EmptyState
 *   message="No users found. Create your first user to get started."
 *   action={{
 *     label: "Create User",
 *     onClick: () => router.push('/users/create')
 *   }}
 * />
 *
 * <EmptyState
 *   variant="search"
 *   message="No results match your search criteria"
 * />
 * ```
 */
export function EmptyState({
  title,
  message,
  variant = "default",
  icon,
  action,
  className,
}: EmptyStateProps) {
  const Icon = VARIANT_ICONS[variant]
  const defaultTitle = VARIANT_TITLES[variant]

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center",
        "min-h-[400px]",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
          variant === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        {icon ? (
          <div className="h-8 w-8">{icon}</div>
        ) : (
          <Icon className="h-8 w-8" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold">
        {title || defaultTitle}
      </h3>

      {/* Message */}
      <p className="mb-6 max-w-md text-sm text-muted-foreground">{message}</p>

      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}
