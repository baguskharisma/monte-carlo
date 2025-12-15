import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconClassName?: string
  loading?: boolean
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  iconClassName,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </CardTitle>
          {icon && (
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className={cn('text-muted-foreground', iconClassName)}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-2">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export interface MetricCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  change?: {
    value: number
    period: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function MetricCard({
  label,
  value,
  icon,
  change,
  variant = 'default',
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50 dark:bg-green-950/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20',
    danger: 'border-red-200 bg-red-50 dark:bg-red-950/20',
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground">
                <span
                  className={cn(
                    'font-medium',
                    change.value >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change.value >= 0 ? '+' : ''}
                  {change.value}%
                </span>{' '}
                from {change.period}
              </p>
            )}
          </div>
          {icon && (
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
