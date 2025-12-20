/**
 * Customer Detail Page (SUPER_ADMIN)
 * TEMPORARILY DISABLED - API endpoint not available
 * Backend needs to implement: GET /api/v1/customers/:id
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function CustomerDetailPage() {
  const router = useRouter()

  // Redirect back to customers list after showing message
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/super-admin/customers')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
          <p className="text-muted-foreground">
            Feature temporarily unavailable
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          Feature Temporarily Unavailable
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          The customer detail view is currently unavailable because the API endpoint has not been implemented yet.
          <br />
          <br />
          <strong>Required Backend Implementation:</strong>
          <br />
          <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-sm">
            GET /api/v1/customers/:id
          </code>
          <br />
          <br />
          You can still <strong>edit</strong> and <strong>delete</strong> customers from the main customers list page.
          <br />
          <br />
          <span className="text-sm">Redirecting back to customers list in 5 seconds...</span>
        </AlertDescription>
      </Alert>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm">
              ✅ <strong>View all customers</strong> - See the complete list of customers
            </p>
            <p className="text-sm">
              ℹ️ <strong>Create new customer</strong> - Customers register via mobile app
            </p>
            <p className="text-sm">
              ✅ <strong>Edit customer</strong> - Update customer information and status
            </p>
            <p className="text-sm">
              ✅ <strong>Delete customer</strong> - Remove customers from the system
            </p>
            <p className="text-sm text-muted-foreground">
              ⏸️ <strong>View customer details</strong> - Available after API implementation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button onClick={() => router.push('/super-admin/customers')}>
          Back to Customers List
        </Button>
      </div>
    </div>
  )
}
