import { cn } from '@/lib/utils'
import type { SeatLegendProps } from '@/types/seat-map.types'

export function SeatLegend({ compact = false, className }: SeatLegendProps) {
  const legends = [
    {
      color: 'bg-green-100 border-green-300',
      label: 'Available',
    },
    {
      color: 'bg-blue-100 border-blue-500',
      label: 'Selected',
    },
    {
      color: 'bg-gray-200 border-gray-400',
      label: 'Booked',
    },
    {
      color: 'bg-yellow-100 border-yellow-400',
      label: 'Pending',
    },
  ]

  return (
    <div className={cn('flex flex-wrap gap-3', compact ? 'text-xs' : 'text-sm', className)}>
      {legends.map((legend) => (
        <div key={legend.label} className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-4 h-4 rounded border-2',
              legend.color
            )}
          />
          <span className="text-muted-foreground">{legend.label}</span>
        </div>
      ))}
    </div>
  )
}
