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
