/**
 * Driver Management Page (SUPER_ADMIN)
 * List, create, edit, and delete driver accounts
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CreateDriverModal } from '@/components/modals/CreateDriverModal'
import { EditDriverModal } from '@/components/modals/EditDriverModal'
import { DeleteDriverModal } from '@/components/modals/DeleteDriverModal'
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from '@/hooks/useDrivers'
import { UserPlus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Driver } from '@/types/user.types'
import type {
  CreateDriverFormData,
  EditDriverFormData,
} from '@/types/driver.types'
import type { Column } from '@/types/components.types'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { DriverStatusBadge } from '@/components/badge/DriverStatusBadge'
import { FormatPhone } from '@/components/format/FormatPhone'

export default function DriversPage() {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  // Queries and Mutations
  const { data, isLoading, error, refetch } = useDrivers({ search })
  const createMutation = useCreateDriver()
  const updateMutation = useUpdateDriver()
  const deleteMutation = useDeleteDriver()

  // Debug: Log driver data structure
  if (data?.data && data.data.length > 0) {
    console.log('Sample driver data structure:', data.data[0])
  }

  // Handlers
  const handleCreateClick = () => {
    setCreateModalOpen(true)
  }

  const handleCreateConfirm = async (
    data: Omit<CreateDriverFormData, 'confirmPassword'>
  ) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateModalOpen(false)
    } catch (error) {
      console.error('Create error:', error)
    }
  }

  const handleEditClick = (driver: Driver) => {
    setSelectedDriver(driver)
    setEditModalOpen(true)
  }

  const handleEditConfirm = async (data: EditDriverFormData) => {
    if (!selectedDriver) return

    try {
      await updateMutation.mutateAsync({ id: selectedDriver.id, data })
      setEditModalOpen(false)
      setSelectedDriver(null)
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleDeleteClick = (driver: Driver) => {
    setSelectedDriver(driver)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return

    try {
      await deleteMutation.mutateAsync(selectedDriver.id)
      setDeleteModalOpen(false)
      setSelectedDriver(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleViewClick = (driver: Driver) => {
    router.push(`/super-admin/drivers/${driver.id}`)
  }

  // DataTable columns
  const columns: Column<Driver>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (driver) => {
        // Handle both nested and flat structures
        const name = driver.profile?.name || (driver as any).name || '-'
        return <span className="font-medium">{name}</span>
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (driver) => {
        const phone = driver.phone || (driver as any).user?.phone || '-'
        return <FormatPhone phone={phone} />
      },
    },
    {
      id: 'licenseNumber',
      header: 'License Number',
      cell: (driver) => {
        const licenseNumber = driver.profile?.licenseNumber || (driver as any).licenseNumber || '-'
        return <span className="font-mono text-sm">{licenseNumber}</span>
      },
    },
    {
      id: 'accountStatus',
      header: 'Account Status',
      cell: (driver) => {
        // Account status is in user.status (UserStatus: ACTIVE/INACTIVE/SUSPENDED)
        const status = (driver as any).user?.status || driver.status || 'INACTIVE'
        return (
          <StatusBadge
            status={status}
            variant={status === 'ACTIVE' ? 'success' : 'secondary'}
          />
        )
      },
    },
    {
      id: 'driverStatus',
      header: 'Operational Status',
      cell: (driver) => {
        // Operational status is in driver.status (DriverStatus: AVAILABLE/ON_TRIP/OFF_DUTY)
        // Note: Based on Prisma schema, driver.status is DriverStatus, not driver.profile.status
        const driverStatus = driver.status || (driver as any).driverStatus || 'OFF_DUTY'
        return <DriverStatusBadge status={driverStatus} />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (driver) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewClick(driver)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(driver)}
            title="Edit Driver"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(driver)}
            title="Delete Driver"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Driver Management
          </h1>
          <p className="text-muted-foreground">
            Manage driver accounts and assignments
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Driver
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or license number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading drivers..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          message="Failed to load driver accounts"
          onRetry={() => refetch()}
        />
      )}

      {/* DataTable */}
      {!isLoading && !error && data && (
        <DataTable columns={columns} data={data.data} />
      )}

      {/* Modals */}
      <CreateDriverModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onConfirm={handleCreateConfirm}
        isLoading={createMutation.isPending}
      />

      <EditDriverModal
        driver={selectedDriver}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onConfirm={handleEditConfirm}
        isLoading={updateMutation.isPending}
      />

      <DeleteDriverModal
        driver={selectedDriver}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
