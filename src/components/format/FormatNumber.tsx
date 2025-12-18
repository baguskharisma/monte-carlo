/**
 * FormatNumber Component
 * Format numbers with thousand separators
 */

"use client"

import { useMemo } from "react"
import { formatNumber as formatNumberUtil } from "@/lib/format.utils"

interface FormatNumberProps {
  /** Value to format (number or string) */
  value: number | string | null | undefined
  /** Number of decimal places (default: 0) */
  decimals?: number
  /** Locale for formatting (default: 'id-ID') */
  locale?: string
  /** Text to show if value is null/undefined/invalid (default: '-') */
  fallback?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * FormatNumber - Formats numbers with thousand separators
 *
 * @example
 * ```tsx
 * <FormatNumber value={1000000} /> // 1.000.000
 * <FormatNumber value={1000.5} decimals={2} /> // 1.000,50
 * <FormatNumber value={null} fallback="N/A" /> // N/A
 * <FormatNumber value={1234.5678} decimals={1} /> // 1.234,6
 * ```
 */
export function FormatNumber({
  value,
  decimals = 0,
  locale = "id-ID",
  fallback = "-",
  className,
}: FormatNumberProps) {
  const formatted = useMemo(() => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }

    try {
      return formatNumberUtil(value, decimals, locale)
    } catch (error) {
      console.error("Error formatting number:", error)
      return fallback
    }
  }, [value, decimals, locale, fallback])

  return (
    <span data-slot="format-number" className={className}>
      {formatted}
    </span>
  )
}
