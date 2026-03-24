<<<<<<< HEAD
import axiosInstance from '@/lib/axios';
import {
  Schedule,
  PaginatedResponse,
  BookedSeatsResponse,
  ScheduleStatus,
} from '@/lib/api-types';

/**
 * Schedule Service
 * Handles trip schedule operations
 */

// Create Schedule
export const createSchedule = async (data: {
  routeId: string;
  vehicleId: string;
  driverId?: string;
  departureTime: string;
  arrivalTime?: string;
  price: number;
  availableSeats?: number;
  fuelCost?: number;
  driverWage?: number;
  snackCost?: number;
}) => {
  const response = await axiosInstance.post<Schedule>('/schedules', data);
  return response.data;
};

// Get All Schedules with filters
export const getSchedules = async (params?: {
  page?: number;
  limit?: number;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  status?: ScheduleStatus;
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'nearest' | 'farthest' | 'cheapest' | 'expensive';
}) => {
  const response = await axiosInstance.get<PaginatedResponse<Schedule>>('/schedules', {
    params,
  });
  return response.data;
};

// Get Upcoming Schedules
export const getUpcomingSchedules = async (limit: number = 20) => {
  const response = await axiosInstance.get<{ data: Schedule[]; total: number }>(
    '/schedules/upcoming',
    {
      params: { limit },
    }
  );
  return response.data;
};

// Get Schedule by ID
export const getScheduleById = async (id: string) => {
  const response = await axiosInstance.get<Schedule>(`/schedules/${id}`);
  return response.data;
};

// Update Schedule
export const updateSchedule = async (
  id: string,
  data: Partial<{
    routeId: string;
    vehicleId: string;
    driverId: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    availableSeats: number;
    fuelCost: number;
    driverWage: number;
    snackCost: number;
  }>
) => {
  const response = await axiosInstance.patch<Schedule>(`/schedules/${id}`, data);
  return response.data;
};

// Delete Schedule
export const deleteSchedule = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(`/schedules/${id}`);
  return response.data;
};

// Assign Driver
export const assignDriver = async (id: string, driverId: string) => {
  const response = await axiosInstance.patch<Schedule>(`/schedules/${id}/assign-driver`, {
    driverId,
  });
  return response.data;
};

// Cancel Schedule
export const cancelSchedule = async (id: string) => {
  const response = await axiosInstance.patch<Schedule>(`/schedules/${id}/cancel`);
  return response.data;
};

// Get Booked Seats
export const getBookedSeats = async (id: string) => {
  const response = await axiosInstance.get<BookedSeatsResponse>(
    `/schedules/${id}/booked-seats`
  );
  return response.data;
};
=======
import apiClient, { getErrorMessage } from '@/lib/api'
import {
  Schedule,
  SchedulesResponse,
  UpcomingSchedulesResponse,
  GetSchedulesParams,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  AssignDriverRequest,
  BookedSeatsResponse,
} from '@/types/schedule.types'

class ScheduleService {
  private readonly baseUrl = '/schedules'

  /**
   * Get all schedules with optional filters
   */
  async getSchedules(params?: GetSchedulesParams): Promise<SchedulesResponse> {
    try {
      const response: unknown = await apiClient.get(this.baseUrl, { params })
      return response as SchedulesResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get upcoming schedules
   */
  async getUpcomingSchedules(limit: number = 20): Promise<UpcomingSchedulesResponse> {
    try {
      const response: unknown = await apiClient.get(`${this.baseUrl}/upcoming`, {
        params: { limit },
      })
      return response as UpcomingSchedulesResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: string): Promise<Schedule> {
    try {
      const response: unknown = await apiClient.get(`${this.baseUrl}/${id}`)
      return response as Schedule
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get booked seats for a schedule
   */
  async getBookedSeats(scheduleId: string): Promise<BookedSeatsResponse> {
    try {
      const response: unknown = await apiClient.get(`${this.baseUrl}/${scheduleId}/booked-seats`)
      return response as BookedSeatsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create new schedule
   */
  async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    try {
      const response: unknown = await apiClient.post(this.baseUrl, data)
      return response as Schedule
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Update schedule
   */
  async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
    try {
      const response: unknown = await apiClient.patch(`${this.baseUrl}/${id}`, data)
      return response as Schedule
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Assign driver to schedule
   */
  async assignDriver(id: string, data: AssignDriverRequest): Promise<Schedule> {
    try {
      const response: unknown = await apiClient.patch(`${this.baseUrl}/${id}/assign-driver`, data)
      return response as Schedule
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Cancel schedule
   */
  async cancelSchedule(id: string): Promise<Schedule> {
    try {
      const response: unknown = await apiClient.patch(`${this.baseUrl}/${id}/cancel`)
      return response as Schedule
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

export const scheduleService = new ScheduleService()
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
