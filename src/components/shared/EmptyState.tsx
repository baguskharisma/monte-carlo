import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileQuestion,
  Inbox,
  Search,
  AlertCircle,
  PackageOpen,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: 'default' | 'search' | 'error'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const defaultIcons = {
    default: <Inbox className="h-12 w-12" />,
    search: <Search className="h-12 w-12" />,
    error: <AlertCircle className="h-12 w-12" />,
  }

  const displayIcon = icon || defaultIcons[variant]

  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center gap-4">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full',
            variant === 'error'
              ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {displayIcon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {(action || secondaryAction) && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {action && (
              <Button onClick={action.onClick}>{action.label}</Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export interface EmptyStateCardProps extends EmptyStateProps {
  bordered?: boolean
}

export function EmptyStateCard({
  bordered = true,
  ...props
}: EmptyStateCardProps) {
  if (bordered) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState {...props} />
        </CardContent>
      </Card>
    )
  }

  return <EmptyState {...props} />
}

export function NoSearchResults({
  searchTerm,
  onClear,
  className,
}: {
  searchTerm?: string
  onClear?: () => void
  className?: string
}) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try adjusting your search.`
          : 'No results found. Try adjusting your filters.'
      }
      action={
        onClear
          ? {
              label: 'Clear search',
              onClick: onClear,
            }
          : undefined
      }
      className={className}
    />
  )
}

export function NoData({
  resource,
  onAdd,
  className,
}: {
  resource: string
  onAdd?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<PackageOpen className="h-12 w-12" />}
      title={`No ${resource} yet`}
      description={`Get started by creating your first ${resource}.`}
      action={
        onAdd
          ? {
              label: `Add ${resource}`,
              onClick: onAdd,
            }
          : undefined
      }
      className={className}
    />
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Try again',
              onClick: onRetry,
            }
          : undefined
      }
      className={className}
    />
  )
}

export function NotFound({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has been moved.",
  onGoBack,
  onGoHome,
  className,
}: {
  title?: string
  description?: string
  onGoBack?: () => void
  onGoHome?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-12 w-12" />}
      title={title}
      description={description}
      action={
        onGoHome
          ? {
              label: 'Go home',
              onClick: onGoHome,
            }
          : undefined
      }
      secondaryAction={
        onGoBack
          ? {
              label: 'Go back',
              onClick: onGoBack,
            }
          : undefined
      }
      className={className}
    />
  )
}
