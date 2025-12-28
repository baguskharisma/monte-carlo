/**
 * Coin Consumption Chart Component
 * Multi-line chart showing coin transaction trends (TOP_UP, DEDUCTION, REFUND)
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
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import type { CoinTrendDataPoint } from '@/types/analytics.types'

// Chart color palette
const CHART_COLORS = {
  topUp: 'hsl(142 76% 36%)', // Green
  deduction: 'hsl(346 84% 61%)', // Red
  refund: 'hsl(217 91% 60%)', // Blue
}

interface CoinConsumptionChartProps {
  data: CoinTrendDataPoint[]
  loading?: boolean
  title?: string
  height?: number
}

/**
 * Coin Consumption Chart
 * Displays coin transaction trends with multiple lines
 * Shows TOP_UP (green), DEDUCTION (red), and REFUND (blue) over time
 *
 * @example
 * ```tsx
 * <CoinConsumptionChart
 *   data={trendsData}
 *   loading={isLoading}
 *   title="Coin Transaction Trends"
 * />
 * ```
 */
export function CoinConsumptionChart({
  data,
  loading = false,
  title = 'Coin Transaction Trends',
  height = 300,
}: CoinConsumptionChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((item) => ({
      date: item.date,
      topUp: item.topUp,
      deduction: item.deduction,
      refund: item.refund,
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
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="topUp"
              stroke={CHART_COLORS.topUp}
              strokeWidth={2}
              name="Top Up"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="deduction"
              stroke={CHART_COLORS.deduction}
              strokeWidth={2}
              name="Deduction"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="refund"
              stroke={CHART_COLORS.refund}
              strokeWidth={2}
              name="Refund"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Custom Tooltip for Coin Consumption Chart
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg bg-card p-3 shadow-lg border border-border">
      <p className="text-sm font-medium mb-2">{data.label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(142_76%_36%)]" />
          <p className="text-xs text-muted-foreground">
            Top Up:{' '}
            <span className="font-medium text-foreground">
              <FormatCurrency value={data.topUp} />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(346_84%_61%)]" />
          <p className="text-xs text-muted-foreground">
            Deduction:{' '}
            <span className="font-medium text-foreground">
              <FormatCurrency value={data.deduction} />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(217_91%_60%)]" />
          <p className="text-xs text-muted-foreground">
            Refund:{' '}
            <span className="font-medium text-foreground">
              <FormatCurrency value={data.refund} />
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
