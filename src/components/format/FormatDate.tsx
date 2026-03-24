/**
 * FormatDate Component
 * Format dates consistently across the application using date-fns
 */

"use client"

import { useMemo } from "react"
import { format as dateFnsFormat } from "date-fns"
import { id } from "date-fns/locale"
import type { Locale } from "date-fns"

import { DATE_FORMAT } from "@/lib/constants"
import { parseDate } from "@/lib/format.utils"
import type { DateFormat } from "@/types/components.types"

interface FormatDateProps {
  /** Date to format (string, Date object, null, or undefined) */
  date: string | Date | null | undefined
  /** Format type or custom format string */
  format?: DateFormat
  /** Locale for date formatting (default: Bahasa Indonesia) */
  locale?: Locale
  /** Text to show if date is null/undefined/invalid (default: '-') */
  fallback?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * FormatDate - Formats dates consistently using date-fns
 *
 * @example
 * ```tsx
 * <FormatDate date={user.createdAt} /> // 18 Des 2025
 * <FormatDate date={order.date} format="display-with-time" /> // 18 Des 2025 14:30
 * <FormatDate date={null} fallback="Not set" /> // Not set
 * ```
 */
export function FormatDate({
  date,
  format = "display",
  locale = id,
  fallback = "-",
  className,
}: FormatDateProps) {
  const formatted = useMemo(() => {
    const parsed = parseDate(date)
    if (!parsed) return fallback

    try {
      // Map format type to date-fns format string
      let formatString: string
      switch (format) {
        case "display":
          formatString = DATE_FORMAT.DISPLAY
          break
        case "display-with-time":
          formatString = DATE_FORMAT.DISPLAY_WITH_TIME
          break
        case "time-only":
          formatString = DATE_FORMAT.TIME_ONLY
          break
        case "iso":
          formatString = DATE_FORMAT.ISO_8601
          break
        default:
          // Custom format string
          formatString = format
      }

      return dateFnsFormat(parsed, formatString, { locale })
    } catch (error) {
      console.error("Error formatting date:", error)
      return fallback
    }
  }, [date, format, locale, fallback])

  return (
    <span data-slot="format-date" className={className}>
      {formatted}
    </span>
  )
}
