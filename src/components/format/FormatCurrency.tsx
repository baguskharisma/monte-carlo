/**
 * FormatCurrency Component
 * Format currency values in IDR (Indonesian Rupiah) with proper separators
 */

"use client"

import { useMemo } from "react"
import { formatCurrency as formatCurrencyUtil } from "@/lib/format.utils"

interface FormatCurrencyProps {
  /** Value to format (number or string) */
  value: number | string | null | undefined
  /** Locale for formatting (default: 'id-ID') */
  locale?: string
  /** Whether to show 'Rp' symbol (default: true) */
  showSymbol?: boolean
  /** Text to show if value is null/undefined/invalid (default: '-') */
  fallback?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * FormatCurrency - Formats currency values in IDR
 *
 * @example
 * ```tsx
 * <FormatCurrency value={10000} /> // Rp 10.000
 * <FormatCurrency value={10000} showSymbol={false} /> // 10.000
 * <FormatCurrency value={null} fallback="N/A" /> // N/A
 * <FormatCurrency value={-5000} /> // Rp -5.000
 * ```
 */
export function FormatCurrency({
  value,
  locale = "id-ID",
  showSymbol = true,
  fallback = "-",
  className,
}: FormatCurrencyProps) {
  const formatted = useMemo(() => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }

    try {
      return formatCurrencyUtil(value, showSymbol)
    } catch (error) {
      console.error("Error formatting currency:", error)
      return fallback
    }
  }, [value, showSymbol, fallback])

  return (
    <span data-slot="format-currency" className={className}>
      {formatted}
    </span>
  )
}
