"use client"

import * as React from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

// ----------------------
// Types
// ----------------------
export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  avatarUrl?: string | null
  totalBookings: number
  status: "active" | "inactive"
}

interface CustomerTableProps {
  customers: Customer[]
  onViewBookings: (id: string) => void
  onRowClick?: (id: string) => void
}

// ----------------------
// Debounce Hook
// ----------------------
function useDebounce<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ----------------------
// Component
// ----------------------
export function CustomerTable({
  customers,
  onViewBookings,
  onRowClick,
}: CustomerTableProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search)

  const filteredCustomers = React.useMemo(() => {
    if (!debouncedSearch) return customers

    const q = debouncedSearch.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    )
  }, [customers, debouncedSearch])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            )}

            {filteredCustomers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer"
                onClick={() => onRowClick?.(customer.id)}
              >
                {/* Avatar + Name */}
                <TableCell className="flex items-center gap-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
                    {customer.avatarUrl ? (
                      <Image
                        src={customer.avatarUrl}
                        alt={customer.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-medium">
                        {customer.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{customer.name}</span>
                </TableCell>

                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="text-center">
                  {customer.totalBookings}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.status === "active" ? "default" : "secondary"}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewBookings(customer.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View bookings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
