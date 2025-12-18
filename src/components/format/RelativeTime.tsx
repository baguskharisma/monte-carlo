/**
 * RelativeTime Component
 * Display relative time (e.g., "2 hours ago", "in 3 days")
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { formatDistanceToNow, format as dateFnsFormat } from "date-fns"
import { id } from "date-fns/locale"
import type { Locale } from "date-fns"

import { parseDate } from "@/lib/format.utils"

interface RelativeTimeProps {
  /** Date to format (string, Date object, null, or undefined) */
  date: string | Date | null | undefined
  /** Locale for date formatting (default: Bahasa Indonesia) */
  locale?: Locale
  /** Add suffix "yang lalu" or "lagi" (default: true) */
  addSuffix?: boolean
  /** Include seconds in the output */
  includeSeconds?: boolean
  /** Text to show if date is null/undefined/invalid (default: '-') */
  fallback?: string
  /** Additional CSS classes */
  className?: string
  /** Show tooltip with absolute date (default: true) */
  showTooltip?: boolean
}

/**
 * RelativeTime - Displays relative time from now
 *
 * @example
 * ```tsx
 * <RelativeTime date={new Date(Date.now() - 2 * 60 * 60 * 1000)} /> // 2 jam yang lalu
 * <RelativeTime date={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} /> // dalam 3 hari
 * <RelativeTime date={null} fallback="Never" /> // Never
 * ```
 *
 * @note Component auto-updates every minute for accuracy
 */
export function RelativeTime({
  date,
  locale = id,
  addSuffix = true,
  includeSeconds = false,
  fallback = "-",
  className,
  showTooltip = true,
}: RelativeTimeProps) {
  // Force re-render every minute for accuracy
  const [, setTick] = useState(0)

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const parsedDate = useMemo(() => parseDate(date), [date])

  const formatted = useMemo(() => {
    if (!parsedDate) return fallback

    try {
      return formatDistanceToNow(parsedDate, {
        addSuffix,
        locale,
        includeSeconds,
      })
    } catch (error) {
      console.error("Error formatting relative time:", error)
      return fallback
    }
  }, [parsedDate, addSuffix, locale, includeSeconds, fallback])

  const absoluteDate = useMemo(() => {
    if (!parsedDate || !showTooltip) return undefined

    try {
      return dateFnsFormat(parsedDate, "dd MMM yyyy HH:mm", { locale })
    } catch {
      return undefined
    }
  }, [parsedDate, showTooltip, locale])

  return (
    <span
      data-slot="relative-time"
      className={className}
      title={absoluteDate}
      aria-label={absoluteDate}
    >
      {formatted}
    </span>
  )
}
