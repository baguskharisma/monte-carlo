'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateTicket } from '@/hooks/useTickets'
import { useUpcomingSchedules } from '@/hooks/useSchedules'
import { coinService } from '@/services/coin.service'
import { CreateTicketFormData, createTicketSchema } from '@/types/ticket.types'
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
import { Textarea } from '@/components/ui/textarea'
import { SeatMap } from '@/components/seat-map/SeatMap'
import { PassengerForm } from '@/components/ticket/PassengerForm'
import { CoinDeductionWarning } from '@/components/ticket/CoinDeductionWarning'
import { FormatDate } from '@/components/format/FormatDate'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { ArrowLeft, Save, Plus, Coins, AlertTriangle } from 'lucide-react'
import { COIN_PRICES } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function CreateTicketPage() {
  const router = useRouter()
  const createMutation = useCreateTicket()

  // State
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [coinBalance, setCoinBalance] = useState(0)

  // Queries
  const { data: schedulesData, isLoading: schedulesLoading } = useUpcomingSchedules(50)

  // Get coin balance
  const { data: balanceData } = useQuery({
    queryKey: ['coin-balance'],
    queryFn: () => coinService.getCurrentCoinBalance(),
  })

  useEffect(() => {
    if (balanceData) {
      setCoinBalance(balanceData.coinBalance)
    }
  }, [balanceData])

  // Form
  const form = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      scheduleId: '',
      bookerPhone: '',
      pickupAddress: '',
      dropoffAddress: '',
      passengers: [{ name: '', identityNumber: '', phone: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'passengers',
  })

  const watchScheduleId = form.watch('scheduleId')
  const selectedSchedule = schedulesData?.data.find((s) => s.id === watchScheduleId)

  // Calculate total cost
  const totalPassengers = fields.length
  const totalCost = totalPassengers * COIN_PRICES.TICKET_BOOKING
  const hasInsufficientBalance = coinBalance < totalCost

  // Auto-adjust passenger count when seats are selected
  useEffect(() => {
    const seatCount = selectedSeats.length
    const passengerCount = fields.length

    if (seatCount > passengerCount) {
      // Add more passenger forms
      const toAdd = seatCount - passengerCount
      for (let i = 0; i < toAdd; i++) {
        append({ name: '', identityNumber: '', phone: '' })
      }
    } else if (seatCount < passengerCount && seatCount > 0) {
      // Remove extra passenger forms
      const toRemove = passengerCount - seatCount
      for (let i = 0; i < toRemove; i++) {
        remove(passengerCount - 1 - i)
      }
    }
  }, [selectedSeats.length])

  // Auto-assign seats to passengers when selected
  useEffect(() => {
    selectedSeats.forEach((seat, index) => {
      if (fields[index]) {
        form.setValue(`passengers.${index}.seatNumber`, seat.toString())
      }
    })
  }, [selectedSeats, fields, form])

  const onSubmit = async (data: CreateTicketFormData) => {
    // Validate: Must have at least one seat selected
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    // Validate: Number of passengers must match number of selected seats
    if (data.passengers.length !== selectedSeats.length) {
      toast.error(`Number of passengers (${data.passengers.length}) must match number of selected seats (${selectedSeats.length})`)
      return
    }

    if (hasInsufficientBalance) {
      return
    }

    await createMutation.mutateAsync({
      scheduleId: data.scheduleId,
      bookingSource: 'ADMIN_PANEL',
      bookerPhone: data.bookerPhone,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      passengers: data.passengers.map((p, index) => ({
        name: p.name,
        identityNumber: p.identityNumber || undefined,
        phone: p.phone || undefined,
        seatNumber: selectedSeats[index]?.toString(),
      })),
    })

    router.push('/admin/tickets')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Ticket</h1>
          <p className="text-muted-foreground">Book a new ticket for customer</p>
        </div>
      </div>

      {/* Coin Balance Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Your Coin Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <FormatCurrency value={coinBalance} />
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select upcoming schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schedulesLoading && (
                          <SelectItem value="loading" disabled>
                            Loading schedules...
                          </SelectItem>
                        )}
                        {schedulesData?.data.map((schedule) => (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            {schedule.route?.origin} → {schedule.route?.destination} |{' '}
                            <FormatDate date={schedule.departureTime} format="display-with-time" />{' '}
                            | <FormatCurrency value={schedule.price} /> |{' '}
                            {schedule.availableSeats} seats
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedSchedule && (
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <p>
                    <strong>Route:</strong> {selectedSchedule.route?.origin} →{' '}
                    {selectedSchedule.route?.destination}
                  </p>
                  <p>
                    <strong>Departure:</strong>{' '}
                    <FormatDate date={selectedSchedule.departureTime} format="display-with-time" />
                  </p>
                  <p>
                    <strong>Price:</strong> <FormatCurrency value={selectedSchedule.price} />
                  </p>
                  <p>
                    <strong>Available Seats:</strong> {selectedSchedule.availableSeats}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seat Selection */}
          {watchScheduleId && selectedSchedule && (
            <SeatMap
              scheduleId={watchScheduleId}
              vehicleType={selectedSchedule.vehicle?.type as 'REGULAR' | 'EKSEKUTIF'}
              capacity={selectedSchedule.vehicle?.capacity}
              selectedSeats={selectedSeats}
              onSelectionChange={setSelectedSeats}
              readonly={false}
              showLegend={true}
            />
          )}

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bookerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booker Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter pickup address" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dropoffAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dropoff Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter dropoff address" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Passengers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Passengers</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', identityNumber: '', phone: '' })}
                disabled={selectedSeats.length > 0 && fields.length >= selectedSeats.length}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Passenger
              </Button>
            </div>

            {fields.map((field, index) => (
              <PassengerForm
                key={field.id}
                form={form}
                index={index}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          {/* Seat Selection Warning */}
          {selectedSeats.length === 0 && watchScheduleId && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No seats selected</AlertTitle>
              <AlertDescription>
                Please select at least one seat from the seat map above to continue.
              </AlertDescription>
            </Alert>
          )}

          {/* Passenger Count Mismatch Warning */}
          {selectedSeats.length > 0 && fields.length !== selectedSeats.length && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Passenger count mismatch</AlertTitle>
              <AlertDescription>
                You have selected {selectedSeats.length} seat(s) but have {fields.length} passenger(s).
                Please make sure the number of passengers matches the number of selected seats.
              </AlertDescription>
            </Alert>
          )}

          {/* Coin Deduction Warning */}
          <CoinDeductionWarning passengerCount={totalPassengers} currentBalance={coinBalance} />

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                hasInsufficientBalance ||
                selectedSeats.length === 0 ||
                fields.length !== selectedSeats.length
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
