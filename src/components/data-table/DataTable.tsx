/**
 * DataTable Component
 * Reusable data table with sorting, pagination, selection, and row actions
 */

"use client"

import { useState, useMemo, type ReactNode } from "react"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTablePagination } from "./DataTablePagination"
import { cn } from "@/lib/utils"
import type { Column, SortOrder } from "@/types/components.types"

interface DataTableProps<T> {
  /** Array of data to display */
  data: T[]
  /** Column definitions */
  columns: Column<T>[]
  /** Pagination configuration (optional) */
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
  }
  /** Sorting configuration (optional) */
  sorting?: {
    sortBy: string | null
    sortOrder: SortOrder
    onSortChange: (sortBy: string, sortOrder: SortOrder) => void
  }
  /** Row selection configuration (optional) */
  selection?: {
    selectedRows: Set<string>
    onSelectionChange: (selectedRows: Set<string>) => void
    getRowId: (row: T) => string
  }
  /** Row actions renderer (optional) */
  rowActions?: (row: T) => ReactNode
  /** Loading state */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Additional CSS classes */
  className?: string
  /** Row class name function */
  rowClassName?: (row: T) => string
}

/**
 * DataTable - Reusable data table with advanced features
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
 *     { id: 'email', header: 'Email', accessorKey: 'email' },
 *     { id: 'status', header: 'Status', cell: (user) => <StatusBadge status={user.status} /> },
 *   ]}
 *   pagination={{
 *     page: 1,
 *     limit: 10,
 *     total: 100,
 *     onPageChange: setPage,
 *     onLimitChange: setLimit,
 *   }}
 *   rowActions={(user) => (
 *     <>
 *       <DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>
 *       <DropdownMenuItem onClick={() => handleDelete(user)}>Delete</DropdownMenuItem>
 *     </>
 *   )}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  pagination,
  sorting,
  selection,
  rowActions,
  loading = false,
  emptyMessage = "No data found",
  className,
  rowClassName,
}: DataTableProps<T>) {
  // Local sorting state (if external sorting not provided)
  const [localSortBy, setLocalSortBy] = useState<string | null>(null)
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>("asc")

  const currentSortBy = sorting?.sortBy ?? localSortBy
  const currentSortOrder = sorting?.sortOrder ?? localSortOrder

  // Handle sort toggle
  const handleSort = (columnId: string) => {
    let newSortOrder: SortOrder = "asc"

    if (currentSortBy === columnId) {
      // Toggle: asc → desc → none (null)
      if (currentSortOrder === "asc") {
        newSortOrder = "desc"
      } else {
        // Reset sorting
        if (sorting) {
          sorting.onSortChange(null as any, "asc")
        } else {
          setLocalSortBy(null)
        }
        return
      }
    }

    if (sorting) {
      sorting.onSortChange(columnId, newSortOrder)
    } else {
      setLocalSortBy(columnId)
      setLocalSortOrder(newSortOrder)
    }
  }

  // Client-side sorting (only if no external sorting)
  const sortedData = useMemo(() => {
    if (sorting || !localSortBy) return data

    const sorted = [...data].sort((a, b) => {
      const column = columns.find((col) => col.id === localSortBy)
      if (!column || !column.accessorKey) return 0

      const aValue = a[column.accessorKey]
      const bValue = b[column.accessorKey]

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Compare values
      if (aValue < bValue) return localSortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return localSortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [data, columns, localSortBy, localSortOrder, sorting])

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return

    if (checked) {
      const allIds = new Set(data.map((row) => selection.getRowId(row)))
      selection.onSelectionChange(allIds)
    } else {
      selection.onSelectionChange(new Set())
    }
  }

  // Handle select row
  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!selection) return

    const newSelection = new Set(selection.selectedRows)
    if (checked) {
      newSelection.add(rowId)
    } else {
      newSelection.delete(rowId)
    }
    selection.onSelectionChange(newSelection)
  }

  // Check if all rows selected
  const allSelected =
    selection &&
    data.length > 0 &&
    data.every((row) => selection.selectedRows.has(selection.getRowId(row)))

  // Check if some rows selected
  const someSelected =
    selection &&
    data.some((row) => selection.selectedRows.has(selection.getRowId(row))) &&
    !allSelected

  // Loading state
  if (loading) {
    return <TableSkeleton columns={columns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)} />
  }

  // Empty state
  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div data-slot="data-table" className={cn("space-y-4", className)}>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Selection checkbox column */}
              {selection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                    data-state={someSelected ? "indeterminate" : undefined}
                  />
                </TableHead>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.className)}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.id)}
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                      <span>{column.header}</span>
                      {currentSortBy === column.id ? (
                        currentSortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}

              {/* Row actions column */}
              {rowActions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.map((row, rowIndex) => {
              const rowId = selection?.getRowId(row) || String(rowIndex)
              const isSelected = selection?.selectedRows.has(rowId) || false

              return (
                <TableRow
                  key={rowId}
                  data-state={isSelected ? "selected" : undefined}
                  className={rowClassName?.(row)}
                >
                  {/* Selection checkbox */}
                  {selection && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(rowId, checked as boolean)
                        }
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </TableCell>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                          ? String(row[column.accessorKey] ?? "-")
                          : "-"}
                    </TableCell>
                  ))}

                  {/* Row actions */}
                  {rowActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                            aria-label={`Row ${rowIndex + 1} actions`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions(row)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && <DataTablePagination {...pagination} />}
    </div>
  )
}

/**
 * Skeleton loader for table
 */
function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * Empty state component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-1">No data found</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
