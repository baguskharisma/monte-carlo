// ==================== ENUMS ====================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum VehicleType {
  EKSEKUTIF = 'EKSEKUTIF',
  REGULAR = 'REGULAR',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED',
}

export enum TicketStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
}

export enum BookingSource {
  CUSTOMER_APP = 'CUSTOMER_APP',
  ADMIN_PANEL = 'ADMIN_PANEL',
}

export enum PaymentProofStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CoinTransactionType {
  TOP_UP = 'TOP_UP',
  DEDUCTION = 'DEDUCTION',
  REFUND = 'REFUND',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
}

export enum TravelDocumentStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED',
}

// ==================== CORE TYPES ====================

export interface User {
  id: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  coinBalance: number;
  birthDate?: string | null;
  gender?: Gender | null;
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  licenseNumber: string | null;
  address: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  profileImage?: string | null;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Route {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  distance: number | null;
  estimatedDuration: number | null;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: VehicleType;
  brand: string | null;
  model: string | null;
  capacity: number;
  status: VehicleStatus;
  vehicleImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string | null;
  departureTime: string;
  arrivalTime: string | null;
  price: number;
  availableSeats: number;
  fuelCost: number | null;
  driverWage: number | null;
  snackCost: number | null;
  status: ScheduleStatus;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  route?: Route;
  vehicle?: Vehicle;
  driver?: Driver;
  tickets?: Ticket[];
  _count?: {
    tickets: number;
  };
}

export interface Passenger {
  id: string;
  ticketId: string;
  name: string;
  identityNumber: string | null;
  phone: string | null;
  seatNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  scheduleId: string;
  customerId: string | null;
  adminId: string | null;
  bookingSource: BookingSource;
  bookerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPassengers: number;
  totalPrice: number;
  status: TicketStatus;
  bookingDate: string;
  paymentDate: string | null;
  notes: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  schedule?: Schedule;
  customer?: Customer;
  admin?: Admin;
  passengers?: Passenger[];
}

export interface PaymentProof {
  id: string;
  scheduleId: string;
  customerId: string | null;
  adminId: string | null;
  bookingSource: BookingSource;
  bookerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPassengers: number;
  totalPrice: number;
  paymentProofUrl: string;
  status: PaymentProofStatus;
  notes: string | null;
  rejectedReason: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  schedule?: Schedule;
  customer?: Customer;
  admin?: Admin;
  passengers?: Passenger[];
  ticket?: Ticket;
}

export interface CoinRequest {
  id: string;
  adminId: string;
  amount: number;
  status: CoinRequestStatus;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  admin?: Admin;
}

export interface CoinTransaction {
  id: string;
  adminId: string;
  type: CoinTransactionType;
  reason: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string | null;
  referenceType: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  admin?: Admin;
}

export interface TravelDocument {
  id: string;
  documentNumber: string;
  scheduleId: string;
  vehicleId: string;
  adminId: string;
  driverName: string;
  driverPhone: string;
  totalPassengers: number;
  departureDate: string;
  status: TravelDocumentStatus;
  issuedAt: string | null;
  notes: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  schedule?: Schedule;
  vehicle?: Vehicle;
  admin?: Admin;
}

// ==================== API RESPONSE TYPES ====================

// Pagination Meta (used in list responses)
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paginated Response (for list endpoints)
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Authentication Response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    email: string | null;
    role: UserRole;
    status: UserStatus;
    profile: Admin | Customer | Driver | null;
  };
}

// Error Response
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// OTP Response
export interface OtpResponse {
  message: string;
  expiresIn: number;
  phone: string;
}

export interface OtpVerifyResponse {
  message: string;
  verified: boolean;
  phone: string;
}

// Balance Response
export interface BalanceResponse {
  id: string;
  name: string;
  coinBalance: number;
}

// Booked Seats Response
export interface BookedSeatWithStatus {
  seatNumber: number;
  status: 'PENDING' | 'APPROVED';
}

export interface BookedSeatsResponse {
  bookedSeats: number[];
  bookedSeatsWithStatus: BookedSeatWithStatus[];
}
