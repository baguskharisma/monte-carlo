import { differenceInMinutes } from 'date-fns'
import type { Route } from '@/types/schedule.types'

/**
 * Calculate trip duration from departure to arrival time
 * @param departureTime - ISO date string of departure
 * @param arrivalTime - ISO date string of arrival (null if not completed)
 * @returns Formatted duration string (e.g., "3h 45m") or "-" if not available
 */
export function calculateTripDuration(
  departureTime: string,
  arrivalTime: string | null
): string {
  if (!arrivalTime) {
    return '-'
  }

  try {
    const departure = new Date(departureTime)
    const arrival = new Date(arrivalTime)
    const totalMinutes = differenceInMinutes(arrival, departure)

    if (totalMinutes < 0) {
      return '-'
    }

    return formatDuration(totalMinutes)
  } catch (error) {
    return '-'
  }
}

/**
 * Format duration in minutes to readable string
 * @param minutes - Total minutes
 * @returns Formatted string (e.g., "2h 30m" or "45m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) {
    return '-'
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  }

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

/**
 * Get distance from route data
 * @param route - Route object containing distance
 * @returns Formatted distance string (e.g., "245 km") or "-" if not available
 */
export function calculateTripDistance(route: Route | null): string {
  if (!route?.distance) {
    return '-'
  }

  // Distance is in km (Float)
  return `${route.distance} km`
}

/**
 * Get distance value from route data
 * @param route - Route object containing distance
 * @returns Distance in km or null if not available
 */
export function getTripDistance(route: Route | null): number | null {
  return route?.distance ?? null
}

/**
 * Calculate average speed
 * @param distanceKm - Distance in kilometers
 * @param durationMinutes - Duration in minutes
 * @returns Average speed in km/h or null if not available
 */
export function calculateAverageSpeed(
  distanceKm: number | null,
  durationMinutes: number | null
): number | null {
  if (!distanceKm || !durationMinutes || durationMinutes === 0) {
    return null
  }

  const durationHours = durationMinutes / 60
  return Math.round(distanceKm / durationHours)
}

/**
 * Format average speed
 * @param distanceKm - Distance in kilometers
 * @param durationMinutes - Duration in minutes
 * @returns Formatted speed string (e.g., "80 km/h") or "-" if not available
 */
export function formatAverageSpeed(
  distanceKm: number | null,
  durationMinutes: number | null
): string {
  const speed = calculateAverageSpeed(distanceKm, durationMinutes)
  return speed ? `${speed} km/h` : '-'
}
