/**
 * VehicleTypeBadge Component
 * Badge for displaying vehicle type (EKSEKUTIF or REGULAR)
 */

'use client'

import { Badge } from '@/components/ui/badge'
import type { VehicleType } from '@/types/vehicle.types'
import { Crown } from 'lucide-react'

interface VehicleTypeBadgeProps {
  type: VehicleType
  className?: string
}

export function VehicleTypeBadge({ type, className }: VehicleTypeBadgeProps) {
  // EKSEKUTIF: Premium styling (blue/purple)
  // REGULAR: Default styling (gray)

  const isEksekutif = type === 'EKSEKUTIF'

  return (
    <Badge
      variant={isEksekutif ? 'default' : 'secondary'}
      className={className}
    >
      {isEksekutif && <Crown className="h-3 w-3 mr-1" />}
      {type}
    </Badge>
  )
}
