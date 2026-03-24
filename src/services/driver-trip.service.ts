import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  DriverTrip,
  DriverTripsResponse,
  DriverTripResponse,
  PassengerManifestResponse,
  GetDriverTripsParams,
  UpdateTripStatusRequest,
  CheckInPassengerRequest,
  BulkCheckInRequest,
  TripLog,
} from '@/types/driver-trip.types'

class DriverTripService {
  private readonly baseUrl = '/driver/trips'

  /**
   * Get driver's trips with filters
   * Uses /driver/trips endpoint which automatically filters by authenticated driver
   */
  async getDriverTrips(params: GetDriverTripsParams): Promise<DriverTripsResponse> {
    try {
      // Use the dedicated driver endpoint (GET /driver/trips)
      // This endpoint automatically filters by the authenticated driver's ID
      const response: unknown = await apiClient.get(this.baseUrl, {
        params: {
          status: params.status,
          page: params.page,
          limit: params.limit,
        }
      })
      return response as DriverTripsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get single trip detail with trip logs
   * Uses /driver/trips/{scheduleId} endpoint which verifies driver assignment
   */
  async getDriverTripById(scheduleId: string): Promise<DriverTrip> {
    try {
      const response: unknown = await apiClient.get(`${this.baseUrl}/${scheduleId}`)

      if (!response) {
        throw new Error('No data returned from server')
      }

      // apiClient already extracts response.data, so backend {data: trip} becomes {data: trip}
      const typedResponse = response as DriverTripResponse | DriverTrip

      // If response has 'data' property, extract it
      if (typeof typedResponse === 'object' && 'data' in typedResponse && typedResponse.data) {
        return typedResponse.data
      }

      // Otherwise, response is already the trip object
      return typedResponse as DriverTrip
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Update trip status (SCHEDULED -> DEPARTED -> ARRIVED)
   * This creates a trip log entry and updates schedule status
   */
  async updateTripStatus(
    scheduleId: string,
    data: UpdateTripStatusRequest
  ): Promise<DriverTrip> {
    try {
      const response: unknown = await apiClient.post(
        `${this.baseUrl}/${scheduleId}/status`,
        data
      )
      return response as DriverTrip
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create trip log entry (manual location update)
   */
  async createTripLog(
    scheduleId: string,
    data: { location?: string; notes?: string }
  ): Promise<TripLog> {
    try {
      const response: unknown = await apiClient.post(
        `${this.baseUrl}/${scheduleId}/trip-logs`,
        data
      )
      return response as TripLog
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get passenger manifest with check-in status
   */
  async getPassengerManifest(scheduleId: string): Promise<PassengerManifestResponse> {
    try {
      const response: unknown = await apiClient.get(
        `${this.baseUrl}/${scheduleId}/passengers`
      )

      // BACKEND ISSUE: API does not return isCheckedIn or checkedInAt fields
      // Backend needs to JOIN with PassengerCheckIn table and include check-in status
      // Expected fields: isCheckedIn (boolean), checkedInAt (string | null)
      // Current response only includes: passengerId, passengerName, ticketNumber, etc.
      //
      // TODO for backend developer:
      // 1. JOIN Schedule -> Ticket -> Passenger -> PassengerCheckIn
      // 2. Add isCheckedIn field (boolean) to each passenger object
      // 3. Add checkedInAt field (string | null) to each passenger object

      return response as PassengerManifestResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Check in a passenger
   */
  async checkInPassenger(
    scheduleId: string,
    data: CheckInPassengerRequest
  ): Promise<void> {
    try {
      await apiClient.post(
        `${this.baseUrl}/${scheduleId}/passengers/${data.passengerId}/check-in`
      )
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Remove passenger check-in
   */
  async removeCheckIn(scheduleId: string, passengerId: string): Promise<void> {
    try {
      await apiClient.delete(
        `${this.baseUrl}/${scheduleId}/passengers/${passengerId}/check-in`
      )
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Bulk check-in passengers
   */
  async bulkCheckIn(
    scheduleId: string,
    data: BulkCheckInRequest
  ): Promise<void> {
    try {
      await apiClient.post(
        `${this.baseUrl}/${scheduleId}/passengers/bulk-check-in`,
        data
      )
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

export const driverTripService = new DriverTripService()
