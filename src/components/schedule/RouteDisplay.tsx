'use client'

import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RouteDisplayProps {
  origin: string
  destination: string
  routeCode?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * RouteDisplay Component
 * Displays route in Origin -> Destination format
 */
export function RouteDisplay({
  origin,
  destination,
  routeCode,
  className,
  size = 'md',
}: RouteDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2',
  }

  return (
    <div className={cn('flex items-center font-medium', sizeClasses[size], className)}>
      <span className="text-foreground">{origin}</span>
      <ArrowRight
        className={cn('text-muted-foreground', {
          'h-3 w-3': size === 'sm',
          'h-4 w-4': size === 'md',
          'h-5 w-5': size === 'lg',
        })}
      />
      <span className="text-foreground">{destination}</span>
      {routeCode && <span className="text-muted-foreground text-xs">({routeCode})</span>}
    </div>
  )
}
