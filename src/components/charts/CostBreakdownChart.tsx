/**
 * Cost Breakdown Chart Component
 * Pie chart showing operational cost distribution
 */

'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import type { CostCategory } from '@/types/analytics.types'

// Chart colors
const COLORS = [
  'hsl(346 84% 61%)', // Fuel - Red
  'hsl(217 91% 60%)', // Driver - Blue
  'hsl(45 93% 47%)', // Snacks - Yellow
]

interface CostBreakdownChartProps {
  data: CostCategory[]
  loading?: boolean
  title?: string
  height?: number
}

/**
 * Cost Breakdown Chart
 * Displays cost distribution as a pie chart
 * Shows percentage breakdown of fuel, driver wages, and snack costs
 *
 * @example
 * ```tsx
 * <CostBreakdownChart
 *   data={costCategories}
 *   loading={isLoading}
 *   title="Cost Distribution"
 * />
 * ```
 */
export function CostBreakdownChart({
  data,
  loading = false,
  title = 'Cost Distribution',
  height = 300,
}: CostBreakdownChartProps) {
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
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry: any) =>
                `${entry.name}: ${entry.percentage.toFixed(1)}%`
              }
              labelLine={{ stroke: 'hsl(var(--border))' }}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Custom Tooltip for Cost Breakdown Chart
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg bg-card p-3 shadow-lg border border-border">
      <p className="text-sm font-medium mb-1">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        Amount:{' '}
        <span className="font-medium text-foreground">
          <FormatCurrency value={data.amount} />
        </span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {data.percentage.toFixed(1)}% of total costs
      </p>
    </div>
  )
}
