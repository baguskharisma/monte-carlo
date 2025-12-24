import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { BookedSeatsDisplayProps } from '@/types/seat-map.types'

export function BookedSeatsDisplay({
  selectedSeats,
  className,
}: BookedSeatsDisplayProps) {
  if (selectedSeats.length === 0) {
    return null
  }

  const sortedSeats = [...selectedSeats].sort((a, b) => a - b)

  return (
    <div
      className={cn(
        'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Selected Seats:
        </span>
        <Badge variant="default" className="bg-blue-600">
          {selectedSeats.length}
        </Badge>
      </div>
      <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
        {sortedSeats.join(', ')}
      </div>
    </div>
  )
}
