/**
 * Request Top-up Page (ADMIN)
 * Form to submit coin top-up request
 */

'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateCoinRequest } from '@/hooks/useCoinRequests'
import { createCoinRequestSchema } from '@/types/coin.types'
import type { CreateCoinRequestFormData } from '@/types/coin.types'
import { Upload, AlertCircle, Info } from 'lucide-react'

export default function RequestTopupPage() {
  const router = useRouter()
  const createRequest = useCreateCoinRequest()

  const form = useForm<CreateCoinRequestFormData>({
    resolver: zodResolver(createCoinRequestSchema),
    defaultValues: {
      amount: undefined,
      notes: '',
    },
  })

  const handleSubmit = async (data: CreateCoinRequestFormData) => {
    try {
      await createRequest.mutateAsync(data)
      router.push('/admin/coins/balance')
    } catch (error) {
      // Error handled by mutation hook
      console.error('Submit error:', error)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Request Coin Top-up
        </h1>
        <p className="text-muted-foreground">
          Submit a request to add coins to your balance
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Submit your top-up request with the amount needed. Your request will be reviewed by a Super Admin.
        </AlertDescription>
      </Alert>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Top-up Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amount <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
                        disabled={createRequest.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the amount of coins to top-up (min: 10,000, max:
                      10,000,000)
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
                      <Textarea
                        placeholder="e.g., Monthly operations budget, Transferred via BCA on Dec 20, 2024"
                        rows={3}
                        {...field}
                        disabled={createRequest.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional information about the top-up request (optional, max 500
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Alert */}
              {createRequest.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {createRequest.error?.message ||
                      'Failed to submit request. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={createRequest.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRequest.isPending}
                  className="flex-1"
                >
                  {createRequest.isPending ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
