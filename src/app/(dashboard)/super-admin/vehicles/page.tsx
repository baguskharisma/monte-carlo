/**
 * Vehicle Management Page (SUPER_ADMIN)
 * List, create, edit, and delete vehicles
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CreateVehicleModal } from '@/components/modals/CreateVehicleModal'
import { EditVehicleModal } from '@/components/modals/EditVehicleModal'
import { DeleteVehicleModal } from '@/components/modals/DeleteVehicleModal'
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useUpdateVehicleStatus,
  useDeleteVehicle,
} from '@/hooks/useVehicles'
import { Car, Search, Eye, Pencil, Trash2, Users } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle.types'
import type {
  CreateVehicleFormData,
  EditVehicleFormData,
} from '@/types/vehicle.types'
import type { Column } from '@/types/components.types'
import { VehicleTypeBadge } from '@/components/badge/VehicleTypeBadge'
import { VehicleStatusBadge } from '@/components/badge/VehicleStatusBadge'

export default function VehiclesPage() {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Queries and Mutations
  const { data, isLoading, error, refetch } = useVehicles({ search })
  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle()
  const updateStatusMutation = useUpdateVehicleStatus()
  const deleteMutation = useDeleteVehicle()

  // Handlers
  const handleCreateClick = () => {
    setCreateModalOpen(true)
  }

  const handleCreateConfirm = async (data: CreateVehicleFormData) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateModalOpen(false)
    } catch (error) {
      console.error('Create error:', error)
    }
  }

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setEditModalOpen(true)
  }

  const handleEditConfirm = async (data: EditVehicleFormData) => {
    if (!selectedVehicle) return

    try {
      console.log('Edit form data:', data)
      console.log('Original vehicle:', selectedVehicle)

      // Separate status update from vehicle data update
      const { status, ...vehicleData } = data

      // Check if status changed
      const statusChanged = status !== selectedVehicle.status

      // Update vehicle data (without status)
      await updateMutation.mutateAsync({
        id: selectedVehicle.id,
        data: vehicleData
      })

      // If status changed, update status separately using dedicated endpoint
      if (statusChanged) {
        console.log('Status changed, updating separately:', status)
        await updateStatusMutation.mutateAsync({
          id: selectedVehicle.id,
          status: status
        })
      }

      setEditModalOpen(false)
      setSelectedVehicle(null)
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return

    try {
      await deleteMutation.mutateAsync(selectedVehicle.id)
      setDeleteModalOpen(false)
      setSelectedVehicle(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleViewClick = (vehicle: Vehicle) => {
    router.push(`/super-admin/vehicles/${vehicle.id}`)
  }

  // DataTable columns
  const columns: Column<Vehicle>[] = [
    {
      id: 'vehicleNumber',
      header: 'Vehicle Number',
      cell: (vehicle) => (
        <span className="font-medium font-mono">{vehicle.vehicleNumber}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: (vehicle) => <VehicleTypeBadge type={vehicle.type} />,
    },
    {
      id: 'vehicle',
      header: 'Brand / Model',
      cell: (vehicle) => (
        <div className="flex flex-col">
          <span className="font-medium">{vehicle.brand}</span>
          <span className="text-sm text-muted-foreground">{vehicle.model}</span>
        </div>
      ),
    },
    {
      id: 'capacity',
      header: 'Capacity',
      cell: (vehicle) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{vehicle.capacity} seats</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (vehicle) => <VehicleStatusBadge status={vehicle.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (vehicle) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewClick(vehicle)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(vehicle)}
            title="Edit Vehicle"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(vehicle)}
            title="Delete Vehicle"
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
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            Manage fleet vehicles for scheduling
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Car className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle number, brand, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading vehicles..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          message="Failed to load vehicles"
          onRetry={() => refetch()}
        />
      )}

      {/* DataTable */}
      {!isLoading && !error && data && (
        <DataTable columns={columns} data={data.data} />
      )}

      {/* Modals */}
      <CreateVehicleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onConfirm={handleCreateConfirm}
        isLoading={createMutation.isPending}
      />

      <EditVehicleModal
        vehicle={selectedVehicle}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onConfirm={handleEditConfirm}
        isLoading={updateMutation.isPending}
      />

      <DeleteVehicleModal
        vehicle={selectedVehicle}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
