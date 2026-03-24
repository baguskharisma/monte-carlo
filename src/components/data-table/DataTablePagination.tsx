/**
 * DataTablePagination Component
 * Pagination controls for DataTable
 */

"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  limit: number
  /** Total number of items */
  total: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Callback when limit changes (optional, not used anymore) */
  onLimitChange?: (limit: number) => void
  /** Show page info text */
  showPageInfo?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * DataTablePagination - Pagination controls for navigating through pages
 *
 * @example
 * ```tsx
 * <DataTablePagination
 *   page={1}
 *   limit={10}
 *   total={100}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */
export function DataTablePagination({
  page,
  limit,
  total,
  onPageChange,
  showPageInfo = true,
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(total / limit)
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        "flex items-center justify-between",
        className
      )}
    >
      {/* Left side: Page info */}
      {showPageInfo && (
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {start}-{end} of {total} results
        </p>
      )}

      {/* Right side: Navigation buttons */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Go to first page"
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Go to previous page"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page indicator */}
        <span className="text-sm text-muted-foreground whitespace-nowrap mx-2">
          Page {page} of {totalPages || 1}
        </span>

        {/* Next page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          aria-label="Go to next page"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || totalPages === 0}
          aria-label="Go to last page"
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
