/**
 * Revenue Analytics Page
 * Detailed revenue analysis with route breakdown and time period filtering
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/StatCard'
import { DateRangeFilter } from '@/components/analytics/DateRangeFilter'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { useRevenueByRoute, useRevenueTrends } from '@/hooks/useAnalytics'
import { TrendingUp, ShoppingCart, DollarSign } from 'lucide-react'
import type { AnalyticsDateRange } from '@/types/analytics.types'

export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({})
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')

  const { data: routeDataResponse, isLoading: routeLoading } = useRevenueByRoute({
    ...dateRange,
  })
  const { data: trendsDataResponse, isLoading: trendsLoading } = useRevenueTrends({
    ...dateRange,
    groupBy,
  })

  // Extract data from responses
  const routeData = routeDataResponse?.data || []
  const trendsData = trendsDataResponse?.data || []

  // Calculate summary stats
  const totalRevenue = routeData.reduce((sum, r) => sum + r.totalRevenue, 0)
  const totalBookings = routeData.reduce((sum, r) => sum + r.totalBookings, 0)
  const avgPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed revenue analysis and trends
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={totalRevenue}
          icon={<DollarSign className="h-4 w-4" />}
          loading={routeLoading}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={<ShoppingCart className="h-4 w-4" />}
          loading={routeLoading}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title="Average Price"
          value={Math.round(avgPrice)}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={routeLoading}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="by-route" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-route">By Route</TabsTrigger>
          <TabsTrigger value="by-time">By Time Period</TabsTrigger>
        </TabsList>

        {/* By Route Tab */}
        <TabsContent value="by-route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Route</CardTitle>
            </CardHeader>
            <CardContent>
              {routeLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : routeData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No revenue data available for the selected period
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Route</th>
                        <th className="text-right py-3 px-4 font-medium">Bookings</th>
                        <th className="text-right py-3 px-4 font-medium">Passengers</th>
                        <th className="text-right py-3 px-4 font-medium">Revenue</th>
                        {/* <th className="text-right py-3 px-4 font-medium">Avg Price</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {routeData.map((route) => (
                        <tr key={route.routeId} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {route.origin} - {route.destination}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            {route.totalBookings}
                          </td>
                          <td className="text-right py-3 px-4">
                            {route.totalPassengers}
                          </td>
                          <td className="text-right py-3 px-4">
                            <FormatCurrency value={route.totalRevenue} />
                          </td>
                          {/* <td className="text-right py-3 px-4">
                            <FormatCurrency value={route.averagePrice} />
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Time Period Tab */}
        <TabsContent value="by-time" className="space-y-4">
          {/* Group By Selector */}
          <div className="flex gap-2">
            <Button
              variant={groupBy === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGroupBy('day')}
            >
              Daily
            </Button>
            <Button
              variant={groupBy === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGroupBy('week')}
            >
              Weekly
            </Button>
            <Button
              variant={groupBy === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGroupBy('month')}
            >
              Monthly
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : trendsData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No trend data available for the selected period
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-right py-3 px-4 font-medium">Revenue</th>
                        <th className="text-right py-3 px-4 font-medium">Bookings</th>
                        <th className="text-right py-3 px-4 font-medium">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendsData.map((trend, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <FormatDate date={trend.date} />
                          </td>
                          <td className="text-right py-3 px-4">
                            <FormatCurrency value={trend.revenue} />
                          </td>
                          <td className="text-right py-3 px-4">
                            {trend.bookings}
                          </td>
                          <td className="text-right py-3 px-4">
                            {trend.growthRate !== undefined && trend.growthRate !== null ? (
                              <span
                                className={
                                  trend.growthRate >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {trend.growthRate >= 0 ? '+' : ''}
                                {trend.growthRate.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
