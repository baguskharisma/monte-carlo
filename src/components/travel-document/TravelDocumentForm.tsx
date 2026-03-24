'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTravelDocumentFormData, createTravelDocumentSchema } from '@/types/travel-document.types'
import { useUpcomingSchedules } from '@/hooks/useSchedules'
import { useTickets } from '@/hooks/useTickets'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DetailRow } from '@/components/ui/detail-row'
import { FormatDate } from '@/components/format/FormatDate'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { Calendar, MapPin, Car, User, Users, Phone, Info, AlertCircle } from 'lucide-react'

interface TravelDocumentFormProps {
  onSubmit: (data: CreateTravelDocumentFormData) => Promise<void>
  isLoading?: boolean
}

export function TravelDocumentForm({ onSubmit, isLoading }: TravelDocumentFormProps) {
  // Form
  const form = useForm<CreateTravelDocumentFormData>({
    resolver: zodResolver(createTravelDocumentSchema),
    defaultValues: {
      scheduleId: '',
      vehicleId: '',
      driverName: '',
      driverPhone: '',
      totalPassengers: 1,
      departureDate: '',
      notes: '',
    },
  })

  // Queries
  const { data: schedulesData, isLoading: schedulesLoading } = useUpcomingSchedules(50)

  const watchScheduleId = form.watch('scheduleId')
  const selectedSchedule = schedulesData?.data.find((s) => s.id === watchScheduleId)

  // Fetch tickets for selected schedule
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets(
    watchScheduleId ? { scheduleId: watchScheduleId } : undefined,
    { enabled: !!watchScheduleId }
  )

  // Aggregate passengers from CONFIRMED tickets only
  const aggregatedPassengers = useMemo(() => {
    if (!ticketsData?.data) return []
    // Filter only CONFIRMED tickets
    const confirmedTickets = ticketsData.data.filter(ticket => ticket.status === 'CONFIRMED')
    return confirmedTickets.flatMap(ticket => ticket.passengers || [])
  }, [ticketsData])

  // Get ticket counts by status for debugging
  const ticketStats = useMemo(() => {
    if (!ticketsData?.data) return {
      total: 0,
      confirmed: 0,
      pendingPayment: 0,
      pendingApproval: 0,
      cancelled: 0,
      completed: 0,
    }
    const tickets = ticketsData.data
    return {
      total: tickets.length,
      confirmed: tickets.filter(t => t.status === 'CONFIRMED').length,
      pendingPayment: tickets.filter(t => t.status === 'PENDING_PAYMENT').length,
      pendingApproval: tickets.filter(t => t.status === 'PENDING_APPROVAL').length,
      cancelled: tickets.filter(t => t.status === 'CANCELLED').length,
      completed: tickets.filter(t => t.status === 'COMPLETED').length,
    }
  }, [ticketsData])

  // Auto-fill fields from selected schedule
  useEffect(() => {
    if (selectedSchedule) {
      // Set vehicleId from schedule
      if (selectedSchedule.vehicleId) {
        form.setValue('vehicleId', selectedSchedule.vehicleId)
      }

      // Set departureDate from schedule
      if (selectedSchedule.departureTime) {
        form.setValue('departureDate', selectedSchedule.departureTime)
      }

      // Pre-fill driver info from schedule if available
      if (selectedSchedule.driver) {
        form.setValue('driverName', selectedSchedule.driver.name)
        form.setValue('driverPhone', selectedSchedule.driver.phone)
      } else {
        form.setValue('driverName', '')
        form.setValue('driverPhone', '')
      }

      // Auto-fill passenger count from tickets
      form.setValue('totalPassengers', aggregatedPassengers.length || 1)
    }
  }, [selectedSchedule, aggregatedPassengers, form])

  const handleSubmit = async (data: CreateTravelDocumentFormData) => {
    // Validation: Ensure driver is assigned
    if (!selectedSchedule?.driver) {
      toast.error('Cannot create travel document: No driver assigned to schedule')
      return
    }

    // Validation: Ensure passengers exist
    if (aggregatedPassengers.length === 0) {
      toast.error('Cannot create travel document: No passengers booked for this schedule')
      return
    }

    // Auto-fill data from aggregated sources
    const enhancedData = {
      ...data,
      driverName: selectedSchedule.driver.name,
      driverPhone: selectedSchedule.driver.phone,
      totalPassengers: aggregatedPassengers.length,
    }

    await onSubmit(enhancedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Schedule Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="scheduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={schedulesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select upcoming schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schedulesData?.data.map((schedule) => {
                        const route = schedule.route
                        const routeDisplay = route
                          ? `${route.origin} → ${route.destination}`
                          : 'Route N/A'

                        return (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{routeDisplay}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(schedule.departureTime).toLocaleString()} •{' '}
                                {schedule.availableSeats} seats available
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                      {schedulesData?.data.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No upcoming schedules available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule Summary */}
            {selectedSchedule && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-medium text-sm">Selected Schedule Details</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Route:</span>
                    <span className="font-medium">
                      {selectedSchedule.route?.origin} → {selectedSchedule.route?.destination}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Departure:</span>
                    <span className="font-medium">
                      <FormatDate date={selectedSchedule.departureTime} format="display-with-time" />
                    </span>
                  </div>

                  {selectedSchedule.vehicle && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span className="font-medium">
                        {selectedSchedule.vehicle.vehicleNumber} - {selectedSchedule.vehicle.type}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Available Seats:</span>
                    <span className="font-medium">{selectedSchedule.availableSeats}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      <FormatCurrency value={selectedSchedule.price} />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Information - READ ONLY */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSchedule?.driver ? (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Driver information is automatically filled from the schedule
                  </AlertDescription>
                </Alert>

                <DetailRow label="Name">{selectedSchedule.driver.name}</DetailRow>
                <DetailRow label="Phone">{selectedSchedule.driver.phone}</DetailRow>
                {selectedSchedule.driver.licenseNumber && (
                  <DetailRow label="License Number">
                    {selectedSchedule.driver.licenseNumber}
                  </DetailRow>
                )}
                {selectedSchedule.driver.status && (
                  <DetailRow label="Status">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        selectedSchedule.driver.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : selectedSchedule.driver.status === 'ON_TRIP'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedSchedule.driver.status}
                    </span>
                  </DetailRow>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No driver assigned to this schedule. Please assign a driver to the schedule first before creating a travel document.
                </AlertDescription>
              </Alert>
            )}

            {/* Hidden fields for form submission */}
            <input type="hidden" {...form.register('driverName')} />
            <input type="hidden" {...form.register('driverPhone')} />
          </CardContent>
        </Card>

        {/* Passenger Manifest */}
        <Card>
          <CardHeader>
            <CardTitle>Passenger Manifest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aggregatedPassengers.length > 0 ? (
              <>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription className="space-y-1">
                    <div className="font-semibold">
                      {aggregatedPassengers.length} passenger(s) from {ticketStats.confirmed} CONFIRMED ticket(s)
                    </div>
                    {ticketStats.total > ticketStats.confirmed && (
                      <div className="text-xs text-muted-foreground">
                        Total tickets for this schedule: {ticketStats.total}
                        {ticketStats.pendingPayment > 0 && ` • ${ticketStats.pendingPayment} pending payment`}
                        {ticketStats.pendingApproval > 0 && ` • ${ticketStats.pendingApproval} pending approval`}
                        {ticketStats.cancelled > 0 && ` • ${ticketStats.cancelled} cancelled`}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>ID Number</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-[100px]">Seat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aggregatedPassengers.map((passenger, idx) => (
                        <TableRow key={passenger.id}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell>{passenger.name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {passenger.identityNumber || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {passenger.phone || '-'}
                          </TableCell>
                          <TableCell className="font-semibold text-center">
                            {passenger.seatNumber || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <div className="font-semibold">No CONFIRMED passengers for this schedule</div>
                  {ticketStats.total > 0 ? (
                    <div className="text-sm">
                      Found {ticketStats.total} ticket(s), but none are CONFIRMED yet.
                      {ticketStats.pendingPayment > 0 && (
                        <div>• {ticketStats.pendingPayment} ticket(s) pending payment</div>
                      )}
                      {ticketStats.pendingApproval > 0 && (
                        <div>• {ticketStats.pendingApproval} ticket(s) pending approval</div>
                      )}
                      {ticketStats.cancelled > 0 && (
                        <div>• {ticketStats.cancelled} ticket(s) cancelled</div>
                      )}
                      <div className="mt-2 text-xs">
                        Please approve pending tickets or create new tickets before generating a travel document.
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      No tickets booked for this schedule yet. Please create tickets first.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Hidden field for form submission */}
            <input type="hidden" {...form.register('totalPassengers')} />
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        {selectedSchedule && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(selectedSchedule.fuelCost || selectedSchedule.driverWage || selectedSchedule.snackCost) ? (
                <div className="space-y-3">
                  {selectedSchedule.fuelCost && (
                    <DetailRow label="Fuel Cost">
                      <FormatCurrency value={selectedSchedule.fuelCost} />
                    </DetailRow>
                  )}
                  {selectedSchedule.driverWage && (
                    <DetailRow label="Driver Wage">
                      <FormatCurrency value={selectedSchedule.driverWage} />
                    </DetailRow>
                  )}
                  {selectedSchedule.snackCost && (
                    <DetailRow label="Snack Cost">
                      <FormatCurrency value={selectedSchedule.snackCost} />
                    </DetailRow>
                  )}

                  <div className="border-t pt-3">
                    <DetailRow label="Total Operational Cost" className="font-semibold">
                      <FormatCurrency
                        value={
                          (selectedSchedule.fuelCost || 0) +
                          (selectedSchedule.driverWage || 0) +
                          (selectedSchedule.snackCost || 0)
                        }
                      />
                    </DetailRow>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Cost breakdown not available for this schedule. Please update the schedule with cost information.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes or remarks about this trip..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about cargo, special instructions, or other relevant information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Creating...' : 'Create Draft Document'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
