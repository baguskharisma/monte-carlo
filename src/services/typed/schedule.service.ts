/**
 * Type-safe Schedule Service
 * Uses generated types from OpenAPI spec
 *
 * Run: npm run generate:api to generate types
 */

import { apiClient, buildPath, buildQuery } from '@/lib/api-client';

// ==================== TYPES ====================
// These types will be replaced with generated types after running npm run generate:api

// Temporary types (will be replaced by generated types)
export interface Schedule {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string | null;
  departureTime: string;
  arrivalTime: string | null;
  price: number;
  availableSeats: number;
  status: 'SCHEDULED' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSchedules {
  data: Schedule[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateScheduleDto {
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
}

export interface ScheduleQueryParams {
  page?: number;
  limit?: number;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  status?: 'SCHEDULED' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED';
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'nearest' | 'farthest' | 'cheapest' | 'expensive';
}

// ==================== SERVICE FUNCTIONS ====================

/**
 * Get all schedules with optional filters
 */
export async function getSchedules(
  params?: ScheduleQueryParams
): Promise<PaginatedSchedules> {
  const query = params ? buildQuery(params) : '';
  return apiClient.get<PaginatedSchedules>(`/schedules${query}`);
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: string): Promise<Schedule> {
  const path = buildPath('/schedules/{id}', { id });
  return apiClient.get<Schedule>(path);
}

/**
 * Create new schedule
 */
export async function createSchedule(
  data: CreateScheduleDto
): Promise<Schedule> {
  return apiClient.post<Schedule, CreateScheduleDto>('/schedules', data);
}

/**
 * Update schedule
 */
export async function updateSchedule(
  id: string,
  data: Partial<CreateScheduleDto>
): Promise<Schedule> {
  const path = buildPath('/schedules/{id}', { id });
  return apiClient.patch<Schedule, Partial<CreateScheduleDto>>(path, data);
}

/**
 * Delete schedule
 */
export async function deleteSchedule(id: string): Promise<{ message: string }> {
  const path = buildPath('/schedules/{id}', { id });
  return apiClient.delete<{ message: string }>(path);
}

/**
 * Get upcoming schedules
 */
export async function getUpcomingSchedules(limit: number = 20): Promise<{
  data: Schedule[];
  total: number;
}> {
  const query = buildQuery({ limit });
  return apiClient.get<{ data: Schedule[]; total: number }>(
    `/schedules/upcoming${query}`
  );
}

/**
 * Get booked seats for schedule
 */
export async function getBookedSeats(scheduleId: string): Promise<{
  bookedSeats: number[];
  bookedSeatsWithStatus: Array<{
    seatNumber: number;
    status: 'PENDING' | 'APPROVED';
  }>;
}> {
  const path = buildPath('/schedules/{id}/booked-seats', { id: scheduleId });
  return apiClient.get(path);
}

/**
 * Assign driver to schedule
 */
export async function assignDriver(
  scheduleId: string,
  driverId: string
): Promise<Schedule> {
  const path = buildPath('/schedules/{id}/assign-driver', { id: scheduleId });
  return apiClient.patch<Schedule, { driverId: string }>(path, { driverId });
}

/**
 * Cancel schedule
 */
export async function cancelSchedule(scheduleId: string): Promise<Schedule> {
  const path = buildPath('/schedules/{id}/cancel', { id: scheduleId });
  return apiClient.patch<Schedule>(path);
}

// ==================== EXAMPLE WITH GENERATED TYPES ====================

/*
// After running npm run generate:api, you can import generated types:

import type { components, paths } from '@/generated/api';

// Use generated types
type Schedule = components['schemas']['Schedule'];
type CreateScheduleDto = components['schemas']['CreateScheduleDto'];
type GetSchedulesResponse = paths['/schedules']['get']['responses']['200']['content']['application/json'];

// Then use them in your service:
export async function getSchedules(
  params?: ScheduleQueryParams
): Promise<GetSchedulesResponse> {
  const query = params ? buildQuery(params) : '';
  return apiClient.get<GetSchedulesResponse>(`/schedules${query}`);
}
*/
