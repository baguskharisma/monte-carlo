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
  cancelTravelDocumentSchema,
  type CancelTravelDocumentFormData,
  type TravelDocument,
} from '@/types/travel-document.types'
import { AlertCircle, Ban } from 'lucide-react'

interface CancelTravelDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: TravelDocument | null
  onConfirm: (reason: string) => Promise<void>
  isLoading?: boolean
}

export function CancelTravelDocumentModal({
  open,
  onOpenChange,
  document,
  onConfirm,
  isLoading = false,
}: CancelTravelDocumentModalProps) {
  const form = useForm<CancelTravelDocumentFormData>({
    resolver: zodResolver(cancelTravelDocumentSchema),
    defaultValues: {
      cancelReason: '',
    },
  })

  const handleSubmit = async (data: CancelTravelDocumentFormData) => {
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
            Cancel Travel Document
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this travel document draft?
          </DialogDescription>
        </DialogHeader>

        {document && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold font-mono">{document.documentNumber}</p>
              <p className="text-sm mt-1">
                This action will cancel the draft document. No coins will be refunded since the
                draft was free.
              </p>
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
                      placeholder="Please provide a reason for cancellation (min 10 characters)..."
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
                Keep Draft
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? 'Cancelling...' : 'Cancel Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
