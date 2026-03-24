"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import { format } from "date-fns"

// ----------------------
// Types
// ----------------------
export interface Booking {
  id: string
  packageName: string
  destination: string
  bookingDate: Date
  travelDate: Date
  status: "confirmed" | "pending" | "cancelled" | "completed"
  totalAmount: number
  participants: number
}

interface CustomerBookingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  customerId: string
  bookings?: Booking[]
}

// ----------------------
// Mock Data Generator
// ----------------------
const generateMockBookings = (customerId: string): Booking[] => {
  const packages = [
    { name: "Bali Paradise Tour", destination: "Bali, Indonesia" },
    { name: "Raja Ampat Adventure", destination: "Raja Ampat, Indonesia" },
    { name: "Yogyakarta Cultural Tour", destination: "Yogyakarta, Indonesia" },
    { name: "Komodo Island Explorer", destination: "Komodo, Indonesia" },
    { name: "Jakarta City Tour", destination: "Jakarta, Indonesia" },
  ]

  const statuses: Booking["status"][] = ["confirmed", "pending", "cancelled", "completed"]

  return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
    id: `booking-${customerId}-${i}`,
    packageName: packages[Math.floor(Math.random() * packages.length)].name,
    destination: packages[Math.floor(Math.random() * packages.length)].destination,
    bookingDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    travelDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    totalAmount: Math.floor(Math.random() * 10000000) + 2000000,
    participants: Math.floor(Math.random() * 6) + 1,
  })).sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime())
}

// ----------------------
// Component
// ----------------------
export function CustomerBookingsDialog({
  open,
  onOpenChange,
  customerName,
  customerId,
  bookings: providedBookings,
}: CustomerBookingsDialogProps) {
  const bookings = React.useMemo(
    () => providedBookings || generateMockBookings(customerId),
    [providedBookings, customerId]
  )

  const getStatusVariant = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "completed":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalBookings = bookings.length
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Booking History - {customerName}</DialogTitle>
          <DialogDescription>
            View all bookings made by this customer
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold">{totalBookings}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Bookings Table */}
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead className="text-center">Guests</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}

              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.packageName}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {booking.destination}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(booking.bookingDate, "dd MMM yyyy")}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(booking.travelDate, "dd MMM yyyy")}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {booking.participants}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm font-medium">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {formatCurrency(booking.totalAmount)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
