'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

interface BookingTrendChartProps {
  data?: Array<{
    month: string
    bookings: number
  }>
}

const defaultData = [
  { month: 'Jan', bookings: 120 },
  { month: 'Feb', bookings: 150 },
  { month: 'Mar', bookings: 135 },
  { month: 'Apr', bookings: 180 },
  { month: 'May', bookings: 165 },
  { month: 'Jun', bookings: 210 },
  { month: 'Jul', bookings: 240 },
  { month: 'Aug', bookings: 225 },
  { month: 'Sep', bookings: 255 },
  { month: 'Oct', bookings: 270 },
  { month: 'Nov', bookings: 260 },
  { month: 'Dec', bookings: 290 },
]

export function BookingTrendChart({ data = defaultData }: BookingTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value, 'Bookings']}
            />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBookings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
