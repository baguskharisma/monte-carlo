'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ScheduleStatus } from '@/types/schedule.types'
import {
  updateTripStatusSchema,
  getNextTripStatus,
  getTripStatusLabel,
  type UpdateTripStatusFormData,
} from '@/types/driver-trip.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from '@/components/ui/button'
import { MapPin, FileText } from 'lucide-react'

interface UpdateTripStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  currentStatus: ScheduleStatus
  onConfirm: (data: UpdateTripStatusFormData) => Promise<void>
  isLoading?: boolean
}

/**
 * UpdateTripStatusModal Component
 * Modal for updating trip status with location and notes
 */
export function UpdateTripStatusModal({
  open,
  onOpenChange,
  scheduleId,
  currentStatus,
  onConfirm,
  isLoading = false,
}: UpdateTripStatusModalProps) {
  const nextStatus = getNextTripStatus(currentStatus)

  const form = useForm<UpdateTripStatusFormData>({
    resolver: zodResolver(updateTripStatusSchema),
    defaultValues: {
      status: (nextStatus === 'DEPARTED' || nextStatus === 'ARRIVED' ? nextStatus : 'DEPARTED') as 'DEPARTED' | 'ARRIVED',
      location: '',
      notes: '',
    },
  })

  const handleSubmit = async (data: UpdateTripStatusFormData) => {
    try {
      await onConfirm(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update trip status:', error)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  // Get available status options based on current status
  const getStatusOptions = (): ScheduleStatus[] => {
    if (currentStatus === 'SCHEDULED') return ['DEPARTED']
    if (currentStatus === 'DEPARTED') return ['ARRIVED']
    return []
  }

  const statusOptions = getStatusOptions()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Trip Status</DialogTitle>
          <DialogDescription>
            Update the current status of your trip with location and additional notes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={statusOptions.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getTripStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {currentStatus === 'SCHEDULED' &&
                      'Mark the trip as departed when you start your journey'}
                    {currentStatus === 'DEPARTED' &&
                      'Mark the trip as arrived when you reach the destination'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Field */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="e.g., Rest Area KM 45, Toll Gate Exit 3"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter your current location or landmark for reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        {...field}
                        placeholder="Add any additional notes about the trip status..."
                        className="pl-10 min-h-[100px]"
                        maxLength={500}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {form.watch('notes')?.length || 0} / 500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
