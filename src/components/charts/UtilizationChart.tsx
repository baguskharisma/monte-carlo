/**
 * Utilization Chart Component
 * Bar chart showing schedule utilization by route
 */

'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { UtilizationByRoute } from '@/types/analytics.types'

// Chart colors
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
}

interface UtilizationChartProps {
  data: UtilizationByRoute[]
  loading?: boolean
  title?: string
  height?: number
}

/**
 * Utilization Chart
 * Displays schedule utilization rates by route as a bar chart
 * Shows percentage of seats booked vs capacity
 *
 * @example
 * ```tsx
 * <UtilizationChart
 *   data={utilizationByRoute}
 *   loading={isLoading}
 *   title="Schedule Utilization by Route"
 * />
 * ```
 */
export function UtilizationChart({
  data,
  loading = false,
  title = 'Schedule Utilization by Route',
  height = 300,
}: UtilizationChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((item) => ({
      route: `${item.origin} - ${item.destination}`,
      utilization: item.utilizationRate,
      booked: item.booked,
      capacity: item.capacity,
    }))
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="w-full bg-muted animate-pulse rounded"
            style={{ height: `${height}px` }}
          />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height: `${height}px` }}
          >
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="route"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Utilization %',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="utilization"
              fill={CHART_COLORS.primary}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Custom Tooltip for Utilization Chart
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg bg-card p-3 shadow-lg border border-border">
      <p className="text-sm font-medium mb-2">{data.route}</p>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Utilization:{' '}
          <span className="font-medium text-foreground">
            {data.utilization.toFixed(1)}%
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Booked: {data.booked} / {data.capacity} seats
        </p>
      </div>
    </div>
  )
}
