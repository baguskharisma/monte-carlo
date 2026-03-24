/**
 * Route Management Page (SUPER_ADMIN)
 * List, create, edit, and delete routes
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CreateRouteModal } from '@/components/modals/CreateRouteModal'
import { EditRouteModal } from '@/components/modals/EditRouteModal'
import { DeleteRouteModal } from '@/components/modals/DeleteRouteModal'
import {
  useRoutes,
  useCreateRoute,
  useUpdateRoute,
  useDeleteRoute,
} from '@/hooks/useRoutes'
import { MapPin, Search, Eye, Pencil, Trash2, ArrowRight } from 'lucide-react'
import type { Route } from '@/types/route.types'
import type {
  CreateRouteFormData,
  EditRouteFormData,
} from '@/types/route.types'
import type { Column } from '@/types/components.types'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'

export default function RoutesPage() {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)

  // Queries and Mutations
  const { data, isLoading, error, refetch } = useRoutes({ search })
  const createMutation = useCreateRoute()
  const updateMutation = useUpdateRoute()
  const deleteMutation = useDeleteRoute()

  // Handlers
  const handleCreateClick = () => {
    setCreateModalOpen(true)
  }

  const handleCreateConfirm = async (data: CreateRouteFormData) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateModalOpen(false)
    } catch (error) {
      console.error('Create error:', error)
    }
  }

  const handleEditClick = (route: Route) => {
    setSelectedRoute(route)
    setEditModalOpen(true)
  }

  const handleEditConfirm = async (data: EditRouteFormData) => {
    if (!selectedRoute) return

    try {
      await updateMutation.mutateAsync({ id: selectedRoute.id, data })
      setEditModalOpen(false)
      setSelectedRoute(null)
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleDeleteClick = (route: Route) => {
    setSelectedRoute(route)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRoute) return

    try {
      await deleteMutation.mutateAsync(selectedRoute.id)
      setDeleteModalOpen(false)
      setSelectedRoute(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleViewClick = (route: Route) => {
    router.push(`/super-admin/routes/${route.id}`)
  }

  // DataTable columns
  const columns: Column<Route>[] = [
    {
      id: 'routeCode',
      header: 'Route Code',
      cell: (route) => (
        <span className="font-medium font-mono">{route.routeCode}</span>
      ),
    },
    {
      id: 'route',
      header: 'Route',
      cell: (route) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{route.origin}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{route.destination}</span>
        </div>
      ),
    },
    {
      id: 'distance',
      header: 'Distance',
      cell: (route) => (
        <span className="text-muted-foreground">{route.distance} km</span>
      ),
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: (route) => {
        const hours = Math.floor(route.estimatedDuration / 60)
        const minutes = route.estimatedDuration % 60
        return (
          <span className="text-muted-foreground">
            {hours > 0 && `${hours}h `}
            {minutes}m
          </span>
        )
      },
    },
    {
      id: 'basePrice',
      header: 'Base Price',
      cell: (route) => <FormatCurrency value={route.basePrice} />,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (route) => (
        <StatusBadge
          status={route.isActive ? 'ACTIVE' : 'INACTIVE'}
          variant={route.isActive ? 'success' : 'secondary'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (route) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewClick(route)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(route)}
            title="Edit Route"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(route)}
            title="Delete Route"
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
            Route Management
          </h1>
          <p className="text-muted-foreground">
            Manage travel routes for scheduling
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <MapPin className="mr-2 h-4 w-4" />
          Create Route
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by route code, origin, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading routes..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          message="Failed to load routes"
          onRetry={() => refetch()}
        />
      )}

      {/* DataTable */}
      {!isLoading && !error && data && (
        <DataTable columns={columns} data={data.data} />
      )}

      {/* Modals */}
      <CreateRouteModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onConfirm={handleCreateConfirm}
        isLoading={createMutation.isPending}
      />

      <EditRouteModal
        route={selectedRoute}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onConfirm={handleEditConfirm}
        isLoading={updateMutation.isPending}
      />

      <DeleteRouteModal
        route={selectedRoute}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
