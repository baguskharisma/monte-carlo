import { cn } from '@/lib/utils'

interface DetailRowProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function DetailRow({ label, children, className }: DetailRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-2 border-b last:border-0', className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  )
}
