/**
 * FormatPhone Component
 * Format Indonesian phone numbers consistently
 */

"use client"

import { useMemo } from "react"
import {
  formatPhoneNumber,
  formatPhoneNumberInternational,
} from "@/lib/format.utils"

type PhoneFormat = "standard" | "international" | "display"

interface FormatPhoneProps {
  /** Phone number to format */
  phone: string | null | undefined
  /** Format type (default: 'standard') */
  format?: PhoneFormat
  /** Make the phone number clickable (tel: link) */
  clickable?: boolean
  /** Text to show if phone is null/undefined (default: '-') */
  fallback?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * FormatPhone - Formats Indonesian phone numbers
 *
 * @example
 * ```tsx
 * <FormatPhone phone="081234567890" /> // 0812-3456-7890
 * <FormatPhone phone="6281234567890" format="international" /> // +62 812-3456-7890
 * <FormatPhone phone="081234567890" clickable /> // Clickable link with tel:
 * <FormatPhone phone={null} fallback="Not provided" /> // Not provided
 * ```
 */
export function FormatPhone({
  phone,
  format = "standard",
  clickable = false,
  fallback = "-",
  className,
}: FormatPhoneProps) {
  const formatted = useMemo(() => {
    if (!phone) return fallback

    try {
      switch (format) {
        case "international":
          return formatPhoneNumberInternational(phone)
        case "standard":
        case "display":
        default:
          return formatPhoneNumber(phone)
      }
    } catch (error) {
      console.error("Error formatting phone:", error)
      return phone
    }
  }, [phone, format, fallback])

  // Create tel: link if clickable
  const href = useMemo(() => {
    if (!phone || !clickable) return undefined

    // Clean phone number for tel: link
    const cleaned = phone.replace(/\D/g, "")
    let normalized = cleaned

    // Convert to international format for tel: link
    if (cleaned.startsWith("0")) {
      normalized = "62" + cleaned.slice(1)
    } else if (!cleaned.startsWith("62")) {
      normalized = "62" + cleaned
    }

    return `tel:+${normalized}`
  }, [phone, clickable])

  if (clickable && href) {
    return (
      <a
        href={href}
        data-slot="format-phone"
        className={className}
        aria-label={`Call ${formatted}`}
      >
        {formatted}
      </a>
    )
  }

  return (
    <span data-slot="format-phone" className={className}>
      {formatted}
    </span>
  )
}
