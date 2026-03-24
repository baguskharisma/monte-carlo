/**
 * ErrorState Component
 * Error state with retry functionality
 */

"use client"

import { type ReactNode } from "react"
import { AlertCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type ErrorVariant = "default" | "destructive" | "warning"

interface ErrorStateProps {
  /** Error title */
  title?: string
  /** Error message */
  message: string
  /** Error variant */
  variant?: ErrorVariant
  /** Custom icon */
  icon?: ReactNode
  /** Retry callback */
  onRetry?: () => void
  /** Retry button label */
  retryLabel?: string
  /** Show as alert instead of full page */
  inline?: boolean
  /** Additional CSS classes */
  className?: string
}

// Default icons for each variant
const VARIANT_ICONS = {
  default: AlertCircle,
  destructive: XCircle,
  warning: AlertTriangle,
}

// Default titles for each variant
const VARIANT_TITLES = {
  default: "Error",
  destructive: "Error",
  warning: "Warning",
}

/**
 * ErrorState - Display error with retry functionality
 *
 * @example
 * ```tsx
 * <ErrorState
 *   message="Failed to load data. Please try again."
 *   onRetry={() => refetch()}
 * />
 *
 * <ErrorState
 *   variant="warning"
 *   message="Some features may not be available"
 *   inline
 * />
 * ```
 */
export function ErrorState({
  title,
  message,
  variant = "destructive",
  icon,
  onRetry,
  retryLabel = "Try Again",
  inline = false,
  className,
}: ErrorStateProps) {
  const Icon = icon ? null : VARIANT_ICONS[variant]
  const defaultTitle = VARIANT_TITLES[variant]

  // Inline alert version
  if (inline) {
    return (
      <Alert
        variant={variant === "warning" ? "default" : "destructive"}
        data-slot="error-state"
        className={className}
      >
        {icon ? (
          <div className="h-4 w-4">{icon}</div>
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
        <AlertTitle>{title || defaultTitle}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-4"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Full page error version
  return (
    <div
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border p-8 text-center",
        "min-h-[400px]",
        variant === "destructive" && "border-destructive/50 bg-destructive/5",
        variant === "warning" && "border-yellow-500/50 bg-yellow-500/5",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
          variant === "destructive" && "bg-destructive/10 text-destructive",
          variant === "warning" && "bg-yellow-500/10 text-yellow-600",
          variant === "default" && "bg-muted text-muted-foreground"
        )}
      >
        {icon ? (
          <div className="h-8 w-8">{icon}</div>
        ) : Icon ? (
          <Icon className="h-8 w-8" />
        ) : null}
      </div>

      {/* Title */}
      <h3
        className={cn(
          "mb-2 text-lg font-semibold",
          variant === "destructive" && "text-destructive",
          variant === "warning" && "text-yellow-600"
        )}
      >
        {title || defaultTitle}
      </h3>

      {/* Message */}
      <p className="mb-6 max-w-md text-sm text-muted-foreground">{message}</p>

      {/* Retry Button */}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant={variant === "destructive" ? "destructive" : "default"}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
