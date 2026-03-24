"use client"

import * as React from "react"
import { CustomerTable, type Customer } from "@/components/features/users/CustomerTable"
import { CustomerBookingsDialog } from "@/components/features/users/CustomerBookingsDialog"
import { SearchBar } from "@/components/features/shared/SearchBar"
import { FilterPanel } from "@/components/features/shared/FilterPanel"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

// Mock data - replace with actual API call
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Alice Chen",
    phone: "081234567890",
    email: "alice.chen@example.com",
    avatarUrl: null,
    totalBookings: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Bob Wilson",
    phone: "081234567891",
    email: "bob.wilson@example.com",
    avatarUrl: null,
    totalBookings: 8,
    status: "active",
  },
  {
    id: "3",
    name: "Charlie Davis",
    phone: "081234567892",
    email: "charlie.davis@example.com",
    avatarUrl: null,
    totalBookings: 15,
    status: "active",
  },
  {
    id: "4",
    name: "Diana Martinez",
    phone: "081234567893",
    email: "diana.martinez@example.com",
    avatarUrl: null,
    totalBookings: 5,
    status: "inactive",
  },
  {
    id: "5",
    name: "Ethan Brown",
    phone: "081234567894",
    email: "ethan.brown@example.com",
    avatarUrl: null,
    totalBookings: 20,
    status: "active",
  },
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [customers, setCustomers] = React.useState<Customer[]>(MOCK_CUSTOMERS)
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null)
  const [isBookingsDialogOpen, setIsBookingsDialogOpen] = React.useState(false)

  // Filter customers based on search and status
  const filteredCustomers = React.useMemo(() => {
    let result = customers

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone.includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((customer) => customer.status === statusFilter)
    }

    return result
  }, [customers, searchQuery, statusFilter])

  const handleViewBookings = (id: string) => {
    setSelectedCustomerId(id)
    setIsBookingsDialogOpen(true)
  }

  const handleRowClick = (id: string) => {
    console.log("View customer detail:", id)
    // TODO: Implement customer detail view
  }

  const handleExport = () => {
    console.log("Export customers")
    // TODO: Implement export functionality
  }

  const selectedCustomer = React.useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer database and view booking history
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search by name or phone"
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-3">
          <FilterPanel
            filters={[
              {
                label: "Status",
                value: statusFilter,
                options: [
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ],
                onChange: setStatusFilter,
              },
            ]}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Customer Table */}
      <CustomerTable
        customers={filteredCustomers}
        onViewBookings={handleViewBookings}
        onRowClick={handleRowClick}
      />

      {/* Pagination Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Bookings Dialog */}
      {selectedCustomer && (
        <CustomerBookingsDialog
          open={isBookingsDialogOpen}
          onOpenChange={setIsBookingsDialogOpen}
          customerName={selectedCustomer.name}
          customerId={selectedCustomer.id}
        />
      )}
    </div>
  )
}
