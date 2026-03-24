/**
 * Revenue Chart Component
 * Line chart showing revenue trends over time (7-day default)
 */

'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import type { CoinTrendDataPoint } from '@/types/analytics.types'

// Chart color palette
const CHART_COLORS = {
  revenue: 'hsl(142 76% 36%)', // Green
}

interface RevenueChartProps {
  data: CoinTrendDataPoint[]
  loading?: boolean
  title?: string
  height?: number
}

/**
 * Revenue Chart
 * Displays revenue trend as a line chart
 * Revenue is calculated from coin DEDUCTION transactions (coins spent)
 *
 * @example
 * ```tsx
 * <RevenueChart
 *   data={trendsData}
 *   loading={isLoading}
 *   title="Revenue Trend (7 Days)"
 * />
 * ```
 */
export function RevenueChart({
  data,
  loading = false,
  title = 'Revenue Trend (7 Days)',
  height = 300,
}: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((item) => ({
      date: item.date,
      revenue: item.deduction, // DEDUCTION = coins spent = revenue
      label: format(new Date(item.date), 'MMM dd'),
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
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                return value.toString()
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.revenue, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Custom Tooltip for Revenue Chart
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg bg-card p-3 shadow-lg border border-border">
      <p className="text-sm font-medium mb-1">{data.label}</p>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[hsl(142_76%_36%)]" />
        <p className="text-sm text-muted-foreground">
          Revenue:{' '}
          <span className="font-medium text-foreground">
            <FormatCurrency value={data.revenue} />
          </span>
        </p>
      </div>
    </div>
  )
}
