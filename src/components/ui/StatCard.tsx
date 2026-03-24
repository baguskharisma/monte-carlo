/**
 * StatCard Component
 * Statistics card with icon and trend indicator
 */

"use client"

import { type ReactNode } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TrendDirection = "up" | "down" | "neutral"

interface StatCardProps {
  /** Card title/label */
  title: string
  /** Main value to display */
  value: string | number
  /** Optional description or subtitle */
  description?: string
  /** Icon to display */
  icon?: ReactNode
  /** Trend percentage (e.g., 12.5 for +12.5%) */
  trend?: number
  /** Trend direction (auto-detected from trend if not provided) */
  trendDirection?: TrendDirection
  /** Custom trend label (e.g., "vs last month") */
  trendLabel?: string
  /** Loading state */
  loading?: boolean
  /** Additional CSS classes */
  className?: string
  /** Icon container CSS classes */
  iconClassName?: string
}

/**
 * StatCard - Display statistics with icon and trend
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Users"
 *   value="1,234"
 *   icon={<Users className="h-4 w-4" />}
 *   trend={12.5}
 *   trendLabel="vs last month"
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendDirection,
  trendLabel = "vs last month",
  loading = false,
  className,
  iconClassName,
}: StatCardProps) {
  // Auto-detect trend direction from trend value
  const detectedDirection: TrendDirection =
    trend === undefined || trend === 0
      ? "neutral"
      : trend > 0
        ? "up"
        : "down"

  const finalDirection = trendDirection ?? detectedDirection

  const TrendIcon =
    finalDirection === "up"
      ? TrendingUp
      : finalDirection === "down"
        ? TrendingDown
        : Minus

  const trendColor =
    finalDirection === "up"
      ? "text-green-600 dark:text-green-400"
      : finalDirection === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-600 dark:text-gray-400"

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-slot="stat-card" className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
              iconClassName
            )}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold tracking-tight">{value}</p>

          {(description || trend !== undefined) && (
            <div className="flex items-center gap-2 text-xs">
              {trend !== undefined && (
                <span
                  className={cn("inline-flex items-center gap-1", trendColor)}
                >
                  <TrendIcon className="h-3 w-3" />
                  <span className="font-medium">
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </span>
              )}

              {(description || trendLabel) && (
                <span className="text-muted-foreground">
                  {description || trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
