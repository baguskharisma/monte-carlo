/**
 * RejectPaymentProofModal Component
 * Modal for rejecting payment proof with required rejection reason
 */

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { useRejectPaymentProof } from '@/hooks/usePaymentProofs'
import {
  rejectPaymentProofSchema,
  type RejectPaymentProofFormData,
  type PaymentProof,
} from '@/types/payment-proof.types'
import { XCircle, AlertTriangle, Users } from 'lucide-react'

interface RejectPaymentProofModalProps {
  /** Whether modal is open */
  open: boolean
  /** Callback when modal close is requested */
  onOpenChange: (open: boolean) => void
  /** Payment proof to reject */
  proof: PaymentProof | null
  /** Callback when rejection succeeds */
  onSuccess?: () => void
}

/**
 * RejectPaymentProofModal - Modal for rejecting payment proof
 * Requires rejection reason (10-500 characters)
 */
export function RejectPaymentProofModal({
  open,
  onOpenChange,
  proof,
  onSuccess,
}: RejectPaymentProofModalProps) {
  const rejectMutation = useRejectPaymentProof()

  const form = useForm<RejectPaymentProofFormData>({
    resolver: zodResolver(rejectPaymentProofSchema),
    defaultValues: {
      rejectedReason: '',
    },
  })

  const handleSubmit = async (data: RejectPaymentProofFormData) => {
    if (!proof) return

    try {
      await rejectMutation.mutateAsync({
        proofId: proof.id,
        data,
      })

      // Reset form and close modal
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation hook
      console.error('Reject error:', error)
    }
  }

  // Close modal and reset form
  const handleClose = () => {
    if (!rejectMutation.isPending) {
      form.reset()
      onOpenChange(false)
    }
  }

  if (!proof) return null

  // Extract details
  const customerName = proof.customer?.name || 'Unknown Customer'
  const scheduleRoute = proof.schedule?.route
    ? `${proof.schedule.route.origin} → ${proof.schedule.route.destination}`
    : 'Route not available'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Reject Payment Proof
          </DialogTitle>
          <DialogDescription>
            Please provide a clear reason for rejecting this payment proof. The customer will see this message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Proof Summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold text-sm">Payment Proof Summary</h4>

            {/* Proof Number */}
            <div>
              <p className="text-xs text-muted-foreground">Proof Number</p>
              <p className="text-sm font-mono">#{proof.proofNumber}</p>
            </div>

            {/* Customer */}
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium">{customerName}</p>
              <p className="text-xs text-muted-foreground">{proof.bookerPhone}</p>
            </div>

            {/* Route */}
            <div>
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="text-sm font-medium">{scheduleRoute}</p>
            </div>

            {/* Passengers and Price */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Passengers
                </p>
                <p className="text-sm font-medium">{proof.totalPassengers}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Price</p>
                <p className="text-sm font-medium">
                  <FormatCurrency value={proof.totalPrice} showSymbol />
                </p>
              </div>
            </div>

            {/* Booking Source */}
            <div>
              <Badge variant={proof.bookingSource === 'CUSTOMER_APP' ? 'default' : 'secondary'}>
                {proof.bookingSource === 'CUSTOMER_APP' ? 'Customer App' : 'Admin Panel'}
              </Badge>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This action will notify the customer. Please ensure your rejection reason is clear and professional.
            </AlertDescription>
          </Alert>

          {/* Rejection Reason Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rejectedReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rejection Reason <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Payment proof image is unclear/unreadable, Amount does not match booking total, Bank transfer details do not match our records"
                        rows={4}
                        {...field}
                        disabled={rejectMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear reason for rejection (10-500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Alert */}
              {rejectMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {rejectMutation.error?.message || 'Failed to reject payment proof'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={rejectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Payment Proof'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
