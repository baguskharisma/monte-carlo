'use client'

import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSchedule, useAssignDriver } from '@/hooks/useSchedules'
import { useDrivers } from '@/hooks/useDrivers'
import { AssignDriverFormData, assignDriverSchema } from '@/types/schedule.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'

export default function AssignDriverPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.id as string

  const { data: schedule, isLoading: scheduleLoading } = useSchedule(scheduleId)
  const { data: driversData } = useDrivers({ driverStatus: 'AVAILABLE' })
  const assignMutation = useAssignDriver()

  // Form
  const form = useForm<AssignDriverFormData>({
    resolver: zodResolver(assignDriverSchema),
  })

  const onSubmit = async (data: AssignDriverFormData) => {
    await assignMutation.mutateAsync({
      id: scheduleId,
      data,
    })

    router.push(`/admin/schedules/${scheduleId}`)
  }

  if (scheduleLoading) {
    return <LoadingState message="Loading schedule..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Driver</h1>
          {schedule && (
            <RouteDisplay
              origin={schedule.route?.origin || 'Unknown'}
              destination={schedule.route?.destination || 'Unknown'}
              routeCode={schedule.route?.routeCode}
            />
          )}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an available driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {driversData?.data.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{driver.profile.name}</span>
                              <span className="text-sm text-muted-foreground">{driver.phone}</span>
                              {driver.profile.licenseNumber && (
                                <span className="text-xs text-muted-foreground">
                                  License: {driver.profile.licenseNumber}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignMutation.isPending}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {assignMutation.isPending ? 'Assigning...' : 'Assign Driver'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
