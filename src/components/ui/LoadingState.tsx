/**
 * LoadingState Component
 * Full page or inline loading state with spinner
 */

"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  /** Loading message */
  message?: string
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Show as inline instead of full page */
  inline?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * LoadingState - Display loading spinner with optional message
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading users..." />
 * <LoadingState size="sm" inline />
 * <LoadingState message="Please wait..." size="lg" />
 * ```
 */
export function LoadingState({
  message = "Loading...",
  size = "md",
  inline = false,
  className,
}: LoadingStateProps) {
  const spinnerSize = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size]

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size]

  if (inline) {
    return (
      <div
        data-slot="loading-state"
        className={cn("flex items-center gap-2", className)}
      >
        <Loader2 className={cn(spinnerSize, "animate-spin text-primary")} />
        {message && (
          <span className={cn(textSize, "text-muted-foreground")}>
            {message}
          </span>
        )}
      </div>
    )
  }

  // Full page loading
  return (
    <div
      data-slot="loading-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg p-8 text-center",
        "min-h-[400px]",
        className
      )}
    >
      <Loader2 className={cn(spinnerSize, "mb-4 animate-spin text-primary")} />
      {message && (
        <p className={cn(textSize, "text-muted-foreground")}>{message}</p>
      )}
    </div>
  )
}

/**
 * LoadingSpinner - Simple spinner without container
 *
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" />
 * ```
 */
export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const spinnerSize = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size]

  return (
    <Loader2
      data-slot="loading-spinner"
      className={cn(spinnerSize, "animate-spin text-primary", className)}
    />
  )
}

/**
 * LoadingOverlay - Full screen overlay with loading spinner
 *
 * @example
 * ```tsx
 * {isLoading && <LoadingOverlay message="Processing..." />}
 * ```
 */
export function LoadingOverlay({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      data-slot="loading-overlay"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}
