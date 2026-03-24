/**
 * Customer Management Page (SUPER_ADMIN)
 * List, edit, and manage customer accounts
 * Note: No create functionality - customers register via mobile app
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EditCustomerModal } from '@/components/modals/EditCustomerModal'
import { DeleteCustomerModal } from '@/components/modals/DeleteCustomerModal'
import {
  useCustomers,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/hooks/useCustomers'
import { Search, Eye, Pencil, Trash2, Info } from 'lucide-react'
import type { Customer } from '@/types/user.types'
import type { EditCustomerFormData } from '@/types/customer.types'
import type { Column } from '@/types/components.types'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatPhone } from '@/components/format/FormatPhone'
import { FormatDate } from '@/components/format/FormatDate'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CustomersPage() {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Queries and Mutations
  const { data, isLoading, error, refetch } = useCustomers({ search })
  const updateMutation = useUpdateCustomer()
  const deleteMutation = useDeleteCustomer()

  // Debug: Log customer data structure
  if (data?.data && data.data.length > 0) {
    console.log('Sample customer data structure:', data.data[0])
  }

  // Handlers
  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditModalOpen(true)
  }

  const handleEditConfirm = async (data: EditCustomerFormData) => {
    if (!selectedCustomer) return

    try {
      await updateMutation.mutateAsync({ id: selectedCustomer.id, data })
      setEditModalOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return

    try {
      await deleteMutation.mutateAsync(selectedCustomer.id)
      setDeleteModalOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleViewClick = (customer: Customer) => {
    router.push(`/super-admin/customers/${customer.id}`)
  }

  // DataTable columns
  const columns: Column<Customer>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (customer) => {
        // Handle both nested and flat structures
        const name = customer.profile?.name || (customer as any).name || '-'
        return <span className="font-medium">{name}</span>
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (customer) => {
        const phone = customer.phone || (customer as any).user?.phone || '-'
        return <FormatPhone phone={phone} />
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: (customer) => {
        const email = customer.email || (customer as any).user?.email || '-'
        return <span>{email}</span>
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (customer) => {
        const status = customer.status || (customer as any).user?.status || 'INACTIVE'
        return (
          <StatusBadge
            status={status}
            variant={status === 'ACTIVE' ? 'success' : 'secondary'}
          />
        )
      },
    },
    {
      id: 'createdAt',
      header: 'Registered',
      cell: (customer) => {
        const createdAt = customer.createdAt || (customer as any).user?.createdAt
        return <FormatDate date={createdAt} />
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            View and manage customer accounts
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Customers register via the mobile app. You can view, edit, and manage their accounts here.
        </AlertDescription>
      </Alert>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading customers..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          message="Failed to load customer accounts"
          onRetry={() => refetch()}
        />
      )}

      {/* DataTable */}
      {!isLoading && !error && data && (
        <DataTable columns={columns} data={data.data} />
      )}

      {/* Modals */}
      <EditCustomerModal
        customer={selectedCustomer}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onConfirm={handleEditConfirm}
        isLoading={updateMutation.isPending}
      />

      <DeleteCustomerModal
        customer={selectedCustomer}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
