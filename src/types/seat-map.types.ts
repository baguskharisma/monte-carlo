export type SeatState = 'available' | 'selected' | 'booked' | 'pending' | 'driver'
export type SeatStatus = 'PENDING' | 'APPROVED'
export type VehicleType = 'REGULAR' | 'EKSEKUTIF'

export interface SeatMapProps {
  /** Schedule ID to fetch booked seats */
  scheduleId: string
  /** Vehicle type to determine layout (REGULAR: [1][Driver]+[2-4]+[5-7], EKSEKUTIF: [1][Driver]+[2-3]+[4-5]) */
  vehicleType?: VehicleType
  /** Total vehicle capacity - passenger seats only, excluding driver (default: 7 for Regular, 5 for Eksekutif) */
  capacity?: number
  /** Currently selected seats (controlled) */
  selectedSeats: number[]
  /** Callback when seat selection changes */
  onSelectionChange: (seats: number[]) => void
  /** Readonly mode - disable all interactions */
  readonly?: boolean
  /** Show legend (default: true) */
  showLegend?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface SeatProps {
  /** Seat number (1-8) */
  seatNumber: number
  /** Current state of the seat */
  state: SeatState
  /** Booking status if booked/pending */
  status?: SeatStatus
  /** Click handler */
  onClick?: (seatNumber: number) => void
  /** Whether seat is interactive */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface SeatLegendProps {
  /** Show compact version */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface BookedSeatsDisplayProps {
  /** Array of selected seat numbers */
  selectedSeats: number[]
  /** Additional CSS classes */
  className?: string
}
