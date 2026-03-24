/**
 * Formatting Utility Functions
 * Utility functions untuk formatting data di seluruh aplikasi
 */

import { format as dateFnsFormat } from "date-fns"
import { id } from "date-fns/locale"

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Parse date from string or Date object
 * @param date - Date value to parse
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  if (date instanceof Date) return isNaN(date.getTime()) ? null : date

  try {
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return null
    return parsed
  } catch {
    return null
  }
}

// ============================================================================
// Phone Number Utilities
// ============================================================================

/**
 * Format Indonesian phone number
 * @param phone - Phone number to format
 * @returns Formatted phone number (e.g., 0812-3456-7890)
 *
 * @example
 * formatPhoneNumber('081234567890') // '0812-3456-7890'
 * formatPhoneNumber('+6281234567890') // '0812-3456-7890'
 * formatPhoneNumber('6281234567890') // '0812-3456-7890'
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")

  // Handle different prefixes (62, +62, 0)
  let normalized = cleaned
  if (cleaned.startsWith("62")) {
    normalized = "0" + cleaned.slice(2)
  }

  // Format: 0812-3456-7890
  if (normalized.length >= 11 && normalized.length <= 13) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8)}`
  }

  // Return original if can't format
  return phone
}

/**
 * Format phone number for international display
 * @param phone - Phone number to format
 * @returns Formatted international phone number (e.g., +62 812-3456-7890)
 */
export function formatPhoneNumberInternational(phone: string): string {
  if (!phone) return phone

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")

  // Normalize to start with 62
  let normalized = cleaned
  if (cleaned.startsWith("0")) {
    normalized = "62" + cleaned.slice(1)
  } else if (!cleaned.startsWith("62")) {
    normalized = "62" + cleaned
  }

  // Format: +62 812-3456-7890
  if (normalized.length >= 11 && normalized.length <= 13) {
    const countryCode = normalized.slice(0, 2)
    const number = normalized.slice(2)
    return `+${countryCode} ${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`
  }

  // Return original if can't format
  return phone
}

// ============================================================================
// Currency Utilities
// ============================================================================

/**
 * Format currency in IDR (Indonesian Rupiah)
 * @param value - Number or string to format
 * @param showSymbol - Whether to show "Rp" symbol
 * @returns Formatted currency string (e.g., "Rp 10.000")
 *
 * @example
 * formatCurrency(10000) // 'Rp 10.000'
 * formatCurrency(10000, false) // '10.000'
 * formatCurrency('10000.50') // 'Rp 10.001' (rounded)
 */
export function formatCurrency(
  value: number | string,
  showSymbol: boolean = true
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(numValue)) return "-"

  const formatted = new Intl.NumberFormat("id-ID", {
    style: showSymbol ? "currency" : "decimal",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)

  return formatted
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format number with thousand separators
 * @param value - Number or string to format
 * @param decimals - Number of decimal places
 * @param locale - Locale string
 * @returns Formatted number string (e.g., "1.000.000")
 *
 * @example
 * formatNumber(1000000) // '1.000.000'
 * formatNumber(1000.5, 2) // '1.000,50'
 */
export function formatNumber(
  value: number | string,
  decimals: number = 0,
  locale: string = "id-ID"
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(numValue)) return "-"

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Convert SNAKE_CASE or snake_case to Title Case
 * @param value - String to convert
 * @returns Title case string
 *
 * @example
 * getFriendlyLabel('SUPER_ADMIN') // 'Super Admin'
 * getFriendlyLabel('pending_approval') // 'Pending Approval'
 */
export function getFriendlyLabel(value: string): string {
  if (!value) return value

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Convert camelCase or PascalCase to Title Case
 * @param value - String to convert
 * @returns Title case string
 *
 * @example
 * camelToTitle('superAdmin') // 'Super Admin'
 * camelToTitle('PendingApproval') // 'Pending Approval'
 */
export function camelToTitle(value: string): string {
  if (!value) return value

  // Insert space before uppercase letters
  const withSpaces = value.replace(/([A-Z])/g, " $1")
  // Capitalize first letter of each word
  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim()
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText('This is a long text', 10) // 'This is a...'
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}
