/**
 * Admin Management Page (SUPER_ADMIN)
 * List, create, edit, and delete admin accounts
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CreateAdminModal } from '@/components/modals/CreateAdminModal'
import { EditAdminModal } from '@/components/modals/EditAdminModal'
import { DeleteAdminModal } from '@/components/modals/DeleteAdminModal'
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
} from '@/hooks/useAdmins'
import { UserPlus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Admin } from '@/types/user.types'
import type {
  CreateAdminFormData,
  EditAdminFormData,
} from '@/types/admin.types'
import type { Column } from '@/types/components.types'
import { RoleBadge } from '@/components/badge/RoleBadge'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatDate } from '@/components/format/FormatDate'

export default function AdminsPage() {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  // Queries and Mutations
  const { data, isLoading, error, refetch } = useAdmins({ search })
  const createMutation = useCreateAdmin()
  const updateMutation = useUpdateAdmin()
  const deleteMutation = useDeleteAdmin()

  // Handlers
  const handleCreateClick = () => {
    setCreateModalOpen(true)
  }

  const handleCreateConfirm = async (
    data: Omit<CreateAdminFormData, 'confirmPassword'>
  ) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateModalOpen(false)
    } catch (error) {
      console.error('Create error:', error)
    }
  }

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin)
    setEditModalOpen(true)
  }

  const handleEditConfirm = async (data: EditAdminFormData) => {
    if (!selectedAdmin) return

    try {
      // Get original admin data
      const adminData = selectedAdmin as any
      const originalEmail = adminData.user?.email || adminData.email || ''
      const originalName = adminData.name || adminData.profile?.name || ''
      const originalPhone = adminData.phone || ''
      const originalStatus = adminData.user?.status || adminData.status || 'ACTIVE'

      // Build update data with only changed fields
      // Note: Email is disabled in form, so we don't need to send it
      const updateData: Partial<EditAdminFormData> = {}

      // Only include fields that have changed
      if (data.name !== originalName) {
        updateData.name = data.name
      }
      if (data.phone !== originalPhone) {
        updateData.phone = data.phone
      }
      if (data.status !== originalStatus) {
        updateData.status = data.status
      }
      
      // Email is always included in form data but we don't send it to API
      // since it's disabled and cannot be changed

      await updateMutation.mutateAsync({ id: selectedAdmin.id, data: updateData as EditAdminFormData })
      setEditModalOpen(false)
      setSelectedAdmin(null)
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return

    try {
      await deleteMutation.mutateAsync(selectedAdmin.id)
      setDeleteModalOpen(false)
      setSelectedAdmin(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleViewClick = (admin: Admin) => {
    router.push(`/super-admin/admins/${admin.id}`)
  }

  // DataTable columns
  const columns: Column<Admin>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (admin) => {
        // API returns flat structure with 'name' directly
        const name = (admin as any).name || admin.profile?.name || 'N/A'
        return <span className="font-medium">{name}</span>
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: (admin) => {
        // API returns email in nested user object
        const email = (admin as any).user?.email || (admin as any).email || admin.email
        return email || '-'
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
    },
    // {
    //   id: 'role',
    //   header: 'Role',
    //   cell: (admin) => {
    //     // API returns role in nested user object
    //     const role = (admin as any).user?.role || (admin as any).role || admin.role
    //     return role ? <RoleBadge role={role} /> : <span className="text-muted-foreground">N/A</span>
    //   },
    // },
    {
      id: 'status',
      header: 'Status',
      cell: (admin) => {
        // API returns status in nested user object
        const status = (admin as any).user?.status || (admin as any).status || admin.status
        return status ? (
          <StatusBadge
            status={status}
            variant={status === 'ACTIVE' ? 'success' : 'secondary'}
          />
        ) : <span className="text-muted-foreground">N/A</span>
      },
    },
    {
      id: 'createdAt',
      header: 'Created At',
      cell: (admin) => {
        const createdAt = (admin as any).createdAt || (admin as any).created_at
        return createdAt ? <FormatDate date={createdAt} /> : 'N/A'
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (admin) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewClick(admin)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(admin)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(admin)}
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
            Admin Management
          </h1>
          <p className="text-muted-foreground">
            Manage admin accounts and permissions
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Admin
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading admins..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          message="Failed to load admin accounts"
          onRetry={() => refetch()}
        />
      )}

      {/* DataTable */}
      {!isLoading && !error && data && (
        <DataTable columns={columns} data={data.data} />
      )}

      {/* Modals */}
      <CreateAdminModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onConfirm={handleCreateConfirm}
        isLoading={createMutation.isPending}
      />

      <EditAdminModal
        admin={selectedAdmin}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onConfirm={handleEditConfirm}
        isLoading={updateMutation.isPending}
      />

      <DeleteAdminModal
        admin={selectedAdmin}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
