/**
 * RejectCoinRequestModal Component
 * Form modal for rejecting a coin request with a reason
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
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { DetailRow } from '@/components/ui/DetailRow'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { XCircle } from 'lucide-react'
import {
  rejectCoinRequestSchema,
  type RejectCoinRequestFormData,
  type CoinRequest,
} from '@/types/coin.types'

interface RejectCoinRequestModalProps {
  /** Coin request to reject */
  request: CoinRequest | null
  /** Whether the modal is open */
  open: boolean
  /** Callback to change open state */
  onOpenChange: (open: boolean) => void
  /** Callback when form is submitted with rejection reason */
  onConfirm: (rejectionReason: string) => void
  /** Whether the reject mutation is loading */
  isLoading?: boolean
}

/**
 * RejectCoinRequestModal - Form dialog for rejecting coin requests
 */
export function RejectCoinRequestModal({
  request,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: RejectCoinRequestModalProps) {
  const form = useForm<RejectCoinRequestFormData>({
    resolver: zodResolver(rejectCoinRequestSchema),
    defaultValues: {
      rejectionReason: '',
    },
  })

  // Reset form when modal opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (data: RejectCoinRequestFormData) => {
    onConfirm(data.rejectionReason)
    form.reset()
  }

  if (!request) return null

  const adminName = request.admin?.profile?.name || 'Unknown Admin'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Reject Coin Request
          </DialogTitle>
          <DialogDescription>
            Please provide a clear reason for rejecting this request. The admin
            will be able to see this reason.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Request Summary */}
            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <DetailRow
                label="Admin"
                value={adminName}
                className="font-medium"
              />
              <DetailRow
                label="Requested Amount"
                value={<FormatCurrency value={request.amount} showSymbol />}
                className="text-lg font-semibold"
              />
            </div>

            {/* Rejection Reason Field */}
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    Rejection Reason <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Proof image is unclear, Amount does not match proof, Duplicate request, etc."
                      rows={5}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed explanation (10-500 characters). This
                    will be visible to the admin.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
