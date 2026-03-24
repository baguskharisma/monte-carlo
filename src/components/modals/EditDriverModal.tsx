/**
 * EditDriverModal Component
 * Form modal for editing an existing driver account
 */

'use client'

import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserCog } from 'lucide-react'
import {
  editDriverSchema,
  type EditDriverFormData,
} from '@/types/driver.types'
import type { Driver } from '@/types/user.types'

interface EditDriverModalProps {
  driver: Driver | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: EditDriverFormData) => void
  isLoading?: boolean
}

export function EditDriverModal({
  driver,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: EditDriverModalProps) {
  const form = useForm<EditDriverFormData>({
    resolver: zodResolver(editDriverSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      licenseNumber: '',
      address: '',
      birthDate: '',
      gender: undefined,
      status: 'ACTIVE',
      driverStatus: 'AVAILABLE',
    },
  })

  // Populate form when driver changes
  useEffect(() => {
    if (driver) {
      // Based on Prisma schema:
      // - Driver fields: name, phone, licenseNumber, address, birthDate, gender, status (DriverStatus)
      // - User fields: email, status (UserStatus)
      form.reset({
        email: (driver as any).user?.email || driver.email || '',
        name: (driver as any).name || driver.profile?.name || '',
        phone: (driver as any).phone || driver.phone || (driver as any).user?.phone || '',
        licenseNumber: (driver as any).licenseNumber || driver.profile?.licenseNumber || '',
        address: (driver as any).address || driver.profile?.address || '',
        birthDate: ((driver as any).birthDate || driver.profile?.birthDate || '').split('T')[0] || '',
        gender: (driver as any).gender || driver.profile?.gender || undefined,
        // IMPORTANT: Based on Prisma schema
        // status (UserStatus) is in driver.user.status - Account status
        // driverStatus (DriverStatus) is in driver.status - Operational status
        status: (driver as any).user?.status || 'ACTIVE',
        driverStatus: (driver as any).status || driver.status || 'AVAILABLE',
      })
    }
  }, [driver, form])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (data: EditDriverFormData) => {
    onConfirm(data)
  }

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Edit Driver Account
          </DialogTitle>
          <DialogDescription>
            Update driver account information and status.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone and Email Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="081234567890"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="driver@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* License Number Field */}
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    License Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890123"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Date and Gender Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter full address..."
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account status">
                            {field.value === 'ACTIVE' && 'Active'}
                            {field.value === 'INACTIVE' && 'Inactive'}
                            {field.value === 'SUSPENDED' && 'Suspended'}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Controls login access to the system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driverStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operational Status (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operational status">
                            {field.value === 'AVAILABLE' && 'Available'}
                            {field.value === 'ON_TRIP' && 'On Trip'}
                            {field.value === 'OFF_DUTY' && 'Off Duty'}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="ON_TRIP">On Trip</SelectItem>
                        <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Current availability for trip assignments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
