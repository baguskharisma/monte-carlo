/**
 * ApprovePaymentProofModal Component
 * Modal for approving payment proof with optional notes
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
import { useApprovePaymentProof } from '@/hooks/usePaymentProofs'
import {
  approvePaymentProofSchema,
  type ApprovePaymentProofFormData,
  type PaymentProof,
} from '@/types/payment-proof.types'
import { CheckCircle, AlertTriangle, Users, MapPin, Coins } from 'lucide-react'

interface ApprovePaymentProofModalProps {
  /** Whether modal is open */
  open: boolean
  /** Callback when modal close is requested */
  onOpenChange: (open: boolean) => void
  /** Payment proof to approve */
  proof: PaymentProof | null
  /** Callback when approval succeeds */
  onSuccess?: () => void
}

/**
 * ApprovePaymentProofModal - Modal for approving payment proof
 * Shows booking summary and allows optional notes
 */
export function ApprovePaymentProofModal({
  open,
  onOpenChange,
  proof,
  onSuccess,
}: ApprovePaymentProofModalProps) {
  const approveMutation = useApprovePaymentProof()

  const form = useForm<ApprovePaymentProofFormData>({
    resolver: zodResolver(approvePaymentProofSchema),
    defaultValues: {
      notes: '',
    },
  })

  const handleSubmit = async (data: ApprovePaymentProofFormData) => {
    if (!proof) return

    try {
      await approveMutation.mutateAsync({
        proofId: proof.id,
        data,
      })

      // Reset form and close modal
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation hook
      console.error('Approve error:', error)
    }
  }

  // Close modal and reset form
  const handleClose = () => {
    if (!approveMutation.isPending) {
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
  const seatNumbers = proof.passengers
    ?.map((p) => p.seatNumber)
    .filter(Boolean)
    .join(', ')

  // Calculate coin cost if ADMIN_PANEL booking
  const coinCost = proof.bookingSource === 'ADMIN_PANEL'
    ? proof.totalPassengers * 10000
    : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Payment Proof
          </DialogTitle>
          <DialogDescription>
            Review the booking details and confirm approval. A confirmed ticket will be created automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold text-sm">Booking Summary</h4>

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

            {/* Passengers and Seats */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Passengers
                </p>
                <p className="text-sm font-medium">{proof.totalPassengers}</p>
              </div>
              {seatNumbers && (
                <div>
                  <p className="text-xs text-muted-foreground">Seats</p>
                  <p className="text-sm font-medium">{seatNumbers}</p>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Pickup
                </p>
                <p className="text-xs">{proof.pickupAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Dropoff
                </p>
                <p className="text-xs">{proof.dropoffAddress}</p>
              </div>
            </div>

            {/* Total Price */}
            <div>
              <p className="text-xs text-muted-foreground">Total Price</p>
              <p className="text-lg font-bold">
                <FormatCurrency value={proof.totalPrice} showSymbol />
              </p>
            </div>

            {/* Booking Source */}
            <div>
              <Badge variant={proof.bookingSource === 'CUSTOMER_APP' ? 'default' : 'secondary'}>
                {proof.bookingSource === 'CUSTOMER_APP' ? 'Customer App' : 'Admin Panel'}
              </Badge>
            </div>
          </div>

          {/* Coin Deduction Warning (if ADMIN_PANEL) */}
          {coinCost > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>
                    <FormatCurrency value={coinCost} showSymbol /> will be deducted from admin&apos;s coin balance
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Approval Notes Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Verified payment receipt, all details confirmed"
                        rows={3}
                        {...field}
                        disabled={approveMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any notes about this approval (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Alert */}
              {approveMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {approveMutation.error?.message || 'Failed to approve payment proof'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={approveMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve & Create Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
