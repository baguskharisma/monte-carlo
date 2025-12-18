/**
 * Component-specific Type Definitions
 * Type definitions untuk reusable components di seluruh aplikasi
 */

import { type ReactNode } from "react"

// ============================================================================
// Format Component Types
// ============================================================================

/**
 * Date format options
 * - display: dd MMM yyyy (e.g., 18 Des 2025)
 * - display-with-time: dd MMM yyyy HH:mm (e.g., 18 Des 2025 14:30)
 * - time-only: HH:mm (e.g., 14:30)
 * - iso: ISO 8601 format
 * - custom string: any valid date-fns format string
 */
export type DateFormat = "display" | "display-with-time" | "time-only" | "iso" | string

// ============================================================================
// Badge Component Types
// ============================================================================

/**
 * Badge size options
 */
export type BadgeSize = "sm" | "md" | "lg"

// ============================================================================
// Data Table Types
// ============================================================================

/**
 * Sort order for table columns
 */
export type SortOrder = "asc" | "desc"

/**
 * Column definition for DataTable
 */
export interface Column<T> {
  /** Unique column identifier */
  id: string
  /** Column header text or React component */
  header: string | ReactNode
  /** Key to access data in row object (for simple data access) */
  accessorKey?: keyof T
  /** Custom cell renderer function */
  cell?: (item: T) => ReactNode
  /** Whether this column is sortable */
  sortable?: boolean
  /** Fixed width for the column */
  width?: string
  /** Additional CSS classes for the column */
  className?: string
}

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  limit: number
  /** Total number of items */
  total: number
}

/**
 * Sorting state
 */
export interface SortingState {
  /** Column ID being sorted */
  sortBy: string | null
  /** Sort direction */
  sortOrder: SortOrder
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter input types
 */
export type FilterType = "text" | "select" | "date-range" | "multi-select"

/**
 * Option for select/multi-select filters
 */
export interface FilterOption {
  /** Display text for the option */
  label: string
  /** Value to be used when option is selected */
  value: string
}

/**
 * Filter definition
 */
export interface Filter {
  /** Unique filter identifier */
  id: string
  /** Filter label displayed to user */
  label: string
  /** Type of filter input */
  type: FilterType
  /** Placeholder text for input fields */
  placeholder?: string
  /** Options for select/multi-select filters */
  options?: FilterOption[]
  /** Current filter value */
  value?: any
  /** Callback when filter value changes */
  onChange: (value: any) => void
}
