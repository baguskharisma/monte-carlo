'use client'

import { useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSchedule, useUpdateSchedule } from '@/hooks/useSchedules'
import { useRoutes } from '@/hooks/useRoutes'
import { useVehicles } from '@/hooks/useVehicles'
import { useDrivers } from '@/hooks/useDrivers'
import { UpdateScheduleFormData, updateScheduleSchema } from '@/types/schedule.types'
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
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'

export default function EditSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.id as string

  const { data: schedule, isLoading: scheduleLoading } = useSchedule(scheduleId)
  const updateMutation = useUpdateSchedule()

  // Queries - fetch all to ensure current selections are available
  // Don't filter by status so currently assigned drivers are included
  const { data: routesData } = useRoutes({})
  const { data: vehiclesData } = useVehicles({})
  const { data: driversData } = useDrivers({})

  // Form
  const form = useForm<UpdateScheduleFormData>({
    resolver: zodResolver(updateScheduleSchema),
    defaultValues: {
      routeId: '',
      vehicleId: '',
      driverId: 'none',
      departureTime: '',
      arrivalTime: '',
      price: 0,
      availableSeats: 0,
      fuelCost: 0,
      driverWage: 0,
      snackCost: 0,
    },
  })

  // Populate form when schedule data is loaded
  const resetForm = useCallback(() => {
    if (schedule) {
      const departureDateTime = schedule.departureTime
        ? new Date(schedule.departureTime).toISOString().slice(0, 16)
        : ''
      const arrivalDateTime = schedule.arrivalTime
        ? new Date(schedule.arrivalTime).toISOString().slice(0, 16)
        : ''

      form.reset({
        routeId: schedule.routeId,
        vehicleId: schedule.vehicleId,
        driverId: schedule.driverId || 'none',
        departureTime: departureDateTime || '',
        arrivalTime: arrivalDateTime || '',
        price: schedule.price,
        availableSeats: schedule.availableSeats,
        fuelCost: schedule.fuelCost || 0,
        driverWage: schedule.driverWage || 0,
        snackCost: schedule.snackCost || 0,
      })
    }
  }, [schedule, form])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit = async (data: UpdateScheduleFormData) => {
    // Combine date and time into ISO string
    const departureISO = data.departureTime ? new Date(data.departureTime).toISOString() : undefined
    const arrivalISO = data.arrivalTime ? new Date(data.arrivalTime).toISOString() : undefined

    await updateMutation.mutateAsync({
      id: scheduleId,
      data: {
        ...data,
        driverId: data.driverId === 'none' ? undefined : data.driverId,
        departureTime: departureISO,
        arrivalTime: arrivalISO,
      },
    })

    router.push(`/admin/schedules/${scheduleId}`)
  }

  if (scheduleLoading || !schedule || !routesData || !vehiclesData || !driversData) {
    return <LoadingState message="Loading schedule..." />
  }

  // Use current selections from API response (with relations populated)
  // Fallback to searching in lists if relations are not populated
  const currentRoute = schedule.route || routesData.data.find(r => r.id === schedule.routeId)
  const currentVehicle = schedule.vehicle || vehiclesData.data.find(v => v.id === schedule.vehicleId)
  const currentDriver = schedule.driver || (schedule.driverId ? driversData.data.find(d => d.id === schedule.driverId) : null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Schedule</h1>
          <p className="text-muted-foreground">Update schedule information</p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route */}
              <FormField
                control={form.control}
                name="routeId"
                render={({ field }) => {
                  const selectedRoute = routesData.data.find(r => r.id === field.value) || currentRoute
                  return (
                    <FormItem>
                      <FormLabel>Route</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedRoute
                                  ? `${selectedRoute.origin} → ${selectedRoute.destination} (${selectedRoute.routeCode})`
                                  : 'Select route'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routesData.data.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.origin} → {route.destination} ({route.routeCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {/* Vehicle */}
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => {
                  const selectedVehicle = vehiclesData.data.find(v => v.id === field.value) || currentVehicle
                  return (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedVehicle
                                  ? `${selectedVehicle.vehicleNumber} - ${selectedVehicle.type} (Capacity: ${selectedVehicle.capacity})`
                                  : 'Select vehicle'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehiclesData.data.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.vehicleNumber} - {vehicle.type} (Capacity: {vehicle.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {/* Driver (Optional) */}
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => {
                  const selectedDriver = field.value && field.value !== 'none'
                    ? (driversData.data.find(d => d.id === field.value) || currentDriver)
                    : null
                  // Handle both Driver types (from user.types.ts with profile, or from schedule.types.ts with flat structure)
                  const driverName = selectedDriver
                    ? ('profile' in selectedDriver ? selectedDriver.profile.name : selectedDriver.name)
                    : null
                  return (
                    <FormItem>
                      <FormLabel>Driver (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedDriver
                                  ? `${driverName} (${selectedDriver.phone})`
                                  : 'No driver'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No driver</SelectItem>
                          {driversData.data.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.profile.name} ({driver.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {/* Departure Time */}
              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Arrival Time */}
              <FormField
                control={form.control}
                name="arrivalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseFloat(e.target.value)
                          field.onChange(isNaN(value as number) ? undefined : value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Cost Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fuel Cost */}
              <FormField
                control={form.control}
                name="fuelCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Cost (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="300000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                          field.onChange(isNaN(value) ? 0 : value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Driver Wage */}
              <FormField
                control={form.control}
                name="driverWage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Wage (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="200000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                          field.onChange(isNaN(value) ? 0 : value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Snack Cost */}
              <FormField
                control={form.control}
                name="snackCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snack Cost (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                          field.onChange(isNaN(value) ? 0 : value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
