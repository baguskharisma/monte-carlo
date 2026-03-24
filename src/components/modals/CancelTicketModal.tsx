'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  cancelTicketSchema,
  type CancelTicketFormData,
  type Ticket,
} from '@/types/ticket.types'
import { AlertCircle, Ban } from 'lucide-react'

interface CancelTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: Ticket | null
  onConfirm: (reason: string) => Promise<void>
  isLoading?: boolean
}

export function CancelTicketModal({
  open,
  onOpenChange,
  ticket,
  onConfirm,
  isLoading = false,
}: CancelTicketModalProps) {
  const form = useForm<CancelTicketFormData>({
    resolver: zodResolver(cancelTicketSchema),
    defaultValues: {
      cancelReason: '',
    },
  })

  const handleSubmit = async (data: CancelTicketFormData) => {
    await onConfirm(data.cancelReason)
    form.reset()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Cancel Ticket
          </DialogTitle>
          <DialogDescription>Are you sure you want to cancel this ticket?</DialogDescription>
        </DialogHeader>

        {ticket && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">{ticket.ticketNumber}</p>
              {ticket.bookingSource === 'ADMIN_PANEL' && (
                <p className="text-sm mt-1">
                  Coins will be refunded to your account upon cancellation.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cancelReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for cancellation..."
                      rows={4}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Keep Ticket
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? 'Cancelling...' : 'Cancel Ticket'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
