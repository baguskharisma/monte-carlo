'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, User } from 'lucide-react'
import type { CreateTicketFormData } from '@/types/ticket.types'

interface PassengerFormProps {
  form: UseFormReturn<CreateTicketFormData>
  index: number
  onRemove: () => void
  canRemove: boolean
}

export function PassengerForm({ form, index, onRemove, canRemove }: PassengerFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          Passenger {index + 1}
        </CardTitle>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name (Required) */}
        <FormField
          control={form.control}
          name={`passengers.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone (Optional) */}
        <FormField
          control={form.control}
          name={`passengers.${index}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="08123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Identity Number (Optional) */}
        <FormField
          control={form.control}
          name={`passengers.${index}.identityNumber`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Identity Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="3201234567890001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
