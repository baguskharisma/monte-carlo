/**
 * Application Constants
 * Centralized constants untuk seluruh aplikasi
 */

// ============================================================================
// User & Role Constants
// ============================================================================

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const

export type Gender = (typeof GENDER)[keyof typeof GENDER]

// ============================================================================
// OTP Constants
// ============================================================================

export const OTP_TYPE = {
  REGISTRATION: "REGISTRATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  PHONE_VERIFICATION: "PHONE_VERIFICATION",
} as const

export type OtpType = (typeof OTP_TYPE)[keyof typeof OTP_TYPE]

export const OTP_STATUS = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
} as const

export type OtpStatus = (typeof OTP_STATUS)[keyof typeof OTP_STATUS]

// OTP Configuration
export const OTP_CONFIG = {
  VALIDITY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  GRACE_PERIOD_MINUTES: 30, // Status verified berlaku 30 menit untuk registrasi
  RATE_LIMIT_MINUTES: 4, // Max 1 OTP per 4 menit
  CODE_LENGTH: 6,
} as const

// ============================================================================
// Coin System Constants
// ============================================================================

export const COIN_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type CoinRequestStatus =
  (typeof COIN_REQUEST_STATUS)[keyof typeof COIN_REQUEST_STATUS]

export const COIN_TRANSACTION_TYPE = {
  TOP_UP: "TOP_UP",
  DEDUCTION: "DEDUCTION",
  REFUND: "REFUND",
} as const

export type CoinTransactionType =
  (typeof COIN_TRANSACTION_TYPE)[keyof typeof COIN_TRANSACTION_TYPE]

// Coin Pricing
export const COIN_PRICES = {
  TICKET_BOOKING: 10000, // per passenger
  TRAVEL_DOCUMENT: 10000, // per document
} as const

// ============================================================================
// Vehicle Constants
// ============================================================================

export const VEHICLE_TYPE = {
  EKSEKUTIF: "EKSEKUTIF",
  REGULAR: "REGULAR",
} as const

export type VehicleType = (typeof VEHICLE_TYPE)[keyof typeof VEHICLE_TYPE]

export const VEHICLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  IN_USE: "IN_USE",
  MAINTENANCE: "MAINTENANCE",
  RETIRED: "RETIRED",
} as const

export type VehicleStatus =
  (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS]

// ============================================================================
// Schedule Constants
// ============================================================================

export const SCHEDULE_STATUS = {
  SCHEDULED: "SCHEDULED",
  DEPARTED: "DEPARTED",
  ARRIVED: "ARRIVED",
  CANCELLED: "CANCELLED",
} as const

export type ScheduleStatus =
  (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS]

// ============================================================================
// Ticket Constants
// ============================================================================

export const TICKET_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
} as const

export type TicketStatus =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]

export const BOOKING_SOURCE = {
  CUSTOMER_APP: "CUSTOMER_APP",
  ADMIN_PANEL: "ADMIN_PANEL",
} as const

export type BookingSource =
  (typeof BOOKING_SOURCE)[keyof typeof BOOKING_SOURCE]

// ============================================================================
// Travel Document Constants
// ============================================================================

export const TRAVEL_DOCUMENT_STATUS = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  CANCELLED: "CANCELLED",
} as const

export type TravelDocumentStatus =
  (typeof TRAVEL_DOCUMENT_STATUS)[keyof typeof TRAVEL_DOCUMENT_STATUS]

// ============================================================================
// Payment Proof Constants
// ============================================================================

export const PAYMENT_PROOF_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type PaymentProofStatus =
  (typeof PAYMENT_PROOF_STATUS)[keyof typeof PAYMENT_PROOF_STATUS]

// ============================================================================
// Trip Status Constants
// ============================================================================

export const TRIP_STATUS = {
  ASSIGNED: "ASSIGNED",
  READY: "READY",
  DEPARTED: "DEPARTED",
  IN_TRANSIT: "IN_TRANSIT",
  REST_STOP: "REST_STOP",
  ARRIVED: "ARRIVED",
  COMPLETED: "COMPLETED",
} as const

export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS]

// ============================================================================
// API Constants
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  // OTP
  OTP: {
    SEND: "/otp/send",
    VERIFY: "/otp/verify",
  },
  // Users
  USERS: {
    ADMINS: "/admins",
    CUSTOMERS: "/customers",
    DRIVERS: "/drivers",
  },
  // Resources
  ROUTES: "/routes",
  VEHICLES: "/vehicles",
  SCHEDULES: "/schedules",
  TICKETS: "/tickets",
  TRAVEL_DOCUMENTS: "/travel-documents",
  PAYMENT_PROOFS: "/payment-proofs",
  // Coin System
  COINS: {
    REQUESTS: "/coin-requests",
    TRANSACTIONS: "/coin-transactions",
    BALANCE: "/coin-balance",
  },
} as const

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

// ============================================================================
// Date & Time Constants
// ============================================================================

export const DATE_FORMAT = {
  ISO_8601: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  DISPLAY: "dd MMM yyyy",
  DISPLAY_WITH_TIME: "dd MMM yyyy HH:mm",
  TIME_ONLY: "HH:mm",
} as const

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  // Phone number format: Indonesian phone format
  PHONE_REGEX: /^(\+62|62|0)[0-9]{9,12}$/,
  // NIK format: 16-digit number
  NIK_LENGTH: 16,
  // Route code format: ORIGIN-DESTINATION-NUMBER (e.g., JKT-BDG-001)
  ROUTE_CODE_REGEX: /^[A-Z]{3}-[A-Z]{3}-\d{3}$/,
  // Vehicle number format: Indonesian license plate (e.g., B 1234 ABC)
  VEHICLE_NUMBER_REGEX: /^[A-Z]{1,2}\s\d{1,4}\s[A-Z]{1,4}$/,
  // Ticket number format: TKT-YYYYMMDD-XXXXX
  TICKET_NUMBER_REGEX: /^TKT-\d{8}-[A-Z0-9]{5}$/,
  // Document number format: SJ-YYYYMMDD-XXXXX
  DOCUMENT_NUMBER_REGEX: /^SJ-\d{8}-[A-Z0-9]{5}$/,
} as const

// ============================================================================
// App Configuration
// ============================================================================

export const APP_CONFIG = {
  NAME: "Monte Carlo",
  VERSION: "0.1.0",
  DESCRIPTION: "Admin panel for Travel App",
} as const

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  THEME: "theme",
} as const

