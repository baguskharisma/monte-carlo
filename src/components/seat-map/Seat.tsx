'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Armchair } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { SeatProps } from '@/types/seat-map.types'

const seatVariants = cva(
  'inline-flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-200 h-20 w-full font-medium text-sm',
  {
    variants: {
      state: {
        available: cn(
          'bg-green-50 border-green-300 text-green-800 hover:bg-green-100 hover:border-green-400 cursor-pointer',
          'dark:bg-green-950 dark:border-green-800 dark:text-green-200 dark:hover:bg-green-900'
        ),
        selected: cn(
          'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-300 shadow-sm cursor-pointer hover:bg-blue-200',
          'dark:bg-blue-950 dark:border-blue-600 dark:text-blue-100 dark:ring-blue-700'
        ),
        booked: cn(
          'bg-gray-200 border-gray-400 text-gray-600 cursor-not-allowed opacity-70',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
        ),
        pending: cn(
          'bg-yellow-50 border-yellow-400 text-yellow-800 cursor-not-allowed opacity-80',
          'dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-300'
        ),
        driver: cn(
          'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed',
          'dark:bg-gray-900 dark:border-gray-700 dark:text-gray-500'
        ),
      },
    },
    defaultVariants: {
      state: 'available',
    },
  }
)

export function Seat({
  seatNumber,
  state,
  onClick,
  disabled,
  className,
}: SeatProps) {
  const isClickable = !disabled && state !== 'booked' && state !== 'pending' && state !== 'driver'

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(seatNumber)
    }
  }

  const getTooltipText = () => {
    switch (state) {
      case 'available':
        return 'Click to select this seat'
      case 'selected':
        return 'Click to deselect this seat'
      case 'booked':
        return 'This seat is already booked'
      case 'pending':
        return 'Pending approval'
      case 'driver':
        return 'Driver seat (not available)'
      default:
        return ''
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(seatVariants({ state }), className)}
            onClick={handleClick}
            disabled={disabled || !isClickable}
            aria-label={state === 'driver' ? 'Driver seat' : `Seat ${seatNumber}`}
            aria-pressed={state === 'selected'}
            aria-disabled={!isClickable}
          >
            <Armchair className="h-5 w-5 mb-1" />
            <span className="font-semibold">{state === 'driver' ? 'Driver' : seatNumber}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
